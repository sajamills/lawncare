import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

const client = new Anthropic();

type TaskCategory = "mow" | "fertilize" | "water" | "aerate" | "seed" | "pest-weed" | "other";
type TaskPriority = "urgent" | "routine" | "optional";

export interface WeeklyTask {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  petSafetyNote: string;
}

export interface WeeklyPlan {
  week: number;
  tasks: WeeklyTask[];
}

const SYSTEM_PROMPT = `You are a lawn care expert. Generate a week-by-week care plan for the specified grass type and US state.

Return ONLY a valid JSON array with exactly 52 entries (weeks 1–52, where week 1 = first week of January). Each entry must have:
{
  "week": <1-52>,
  "tasks": [
    {
      "title": "<short task name>",
      "description": "<1-2 sentence description with specific timing or product guidance>",
      "category": "<one of: mow, fertilize, water, aerate, seed, pest-weed, other>",
      "priority": "<one of: urgent, routine, optional>",
      "petSafetyNote": "<safety note for pets, or empty string>"
    }
  ]
}

Guidelines:
- Use your expert knowledge of the grass type and state's climate to assign tasks to the correct weeks
- Most weeks will have 1-3 tasks; some off-season weeks may have zero tasks (use empty tasks array)
- Tasks like pre-emergent herbicide, fertilizer applications, aeration, and overseeding must be timed precisely to the correct week windows for that state and grass type
- Mowing tasks should appear during the active growing season weeks only
- Watering tasks should note frequency and amount appropriate to the season
- Always return all 52 weeks; use an empty tasks array for weeks with no activity`;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pdfUrl, state, grassType } = body as {
    pdfUrl?: string;
    state?: string;
    grassType?: string;
  };

  if (!state || !grassType) {
    return NextResponse.json(
      { error: "state and grassType are required" },
      { status: 400 }
    );
  }

  // Check cache first
  try {
    const cached = await db.query(
      "SELECT parsed_plan FROM cached_plans WHERE state = $1 AND grass_type = $2",
      [state.toUpperCase(), grassType]
    );
    if (cached.rows.length > 0) {
      const cachedPlan = cached.rows[0].parsed_plan as Array<Record<string, unknown>>;
      // Detect stale 12-month format (entries have 'month' not 'week')
      const isStale = Array.isArray(cachedPlan) && cachedPlan.length > 0 && !("week" in cachedPlan[0]);
      if (!isStale) {
        return NextResponse.json({ plan: cachedPlan, cached: true });
      }
      // Stale format — delete and regenerate
      await db.query(
        "DELETE FROM cached_plans WHERE state = $1 AND grass_type = $2",
        [state.toUpperCase(), grassType]
      );
    }
  } catch {
    // DB not available in dev — continue without cache
  }

  // Optionally fetch PDF/HTML content if pdfUrl is provided
  let pdfBuffer: Buffer | null = null;
  let mediaType: string | null = null;
  let htmlContent: string | null = null;

  if (pdfUrl) {
    try {
      const response = await fetch(pdfUrl, {
        headers: { "User-Agent": "LawnGuide/1.0 (lawn care app)" },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/pdf")) {
          const arrayBuffer = await response.arrayBuffer();
          pdfBuffer = Buffer.from(arrayBuffer);
          mediaType = "application/pdf";
        } else {
          let text = await response.text();
          text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          htmlContent = text.slice(0, 50000);
        }
      }
    } catch {
      // PDF fetch failed — fall through to knowledge-based generation
    }
  }

  // Call Claude API
  let plan: WeeklyPlan[];
  try {
    let message: Anthropic.Message;
    const userPrompt = `Generate a 52-week lawn care plan for ${grassType} grass in ${state}. Return only the JSON array.`;

    if (pdfBuffer && mediaType) {
      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: mediaType as "application/pdf",
                  data: pdfBuffer.toString("base64"),
                },
              },
              { type: "text", text: userPrompt },
            ],
          },
        ],
      });
    } else if (htmlContent) {
      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Using this reference content:\n\n${htmlContent}\n\n${userPrompt}`,
          },
        ],
      });
    } else {
      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });
    }

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in Claude response");
    }
    plan = JSON.parse(jsonMatch[0]) as WeeklyPlan[];
  } catch (err) {
    return NextResponse.json(
      {
        error: `Failed to parse plan: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }

  // Cache to DB
  try {
    await db.query(
      `INSERT INTO cached_plans (state, grass_type, pdf_url, parsed_plan)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (state, grass_type) DO UPDATE SET parsed_plan = EXCLUDED.parsed_plan, created_at = NOW()`,
      [state.toUpperCase(), grassType, pdfUrl ?? "", JSON.stringify(plan)]
    );
  } catch {
    // DB not available in dev — return plan anyway
  }

  return NextResponse.json({ plan, cached: false });
}
