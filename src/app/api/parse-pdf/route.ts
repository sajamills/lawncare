import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

const client = new Anthropic();

type TaskCategory = "mow" | "fertilize" | "water" | "aerate" | "seed" | "pest-weed" | "other";
type TaskPriority = "urgent" | "routine" | "optional";

interface MonthlyTask {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  petSafetyNote: string;
}

interface MonthlyPlan {
  month: number;
  tasks: MonthlyTask[];
}

const SYSTEM_PROMPT = `You are a lawn care expert. Extract a month-by-month care plan from the provided content.

Return ONLY a valid JSON array with 12 entries (months 1-12). Each entry must have:
{
  "month": <1-12>,
  "tasks": [
    {
      "title": "<short task name>",
      "description": "<1-2 sentence description>",
      "category": "<one of: mow, fertilize, water, aerate, seed, pest-weed, other>",
      "priority": "<one of: urgent, routine, optional>",
      "petSafetyNote": "<safety note for pets, or empty string>"
    }
  ]
}

If the content doesn't have detailed monthly breakdowns, infer reasonable tasks based on the grass type and season. Always return all 12 months; use an empty tasks array for months with no activity.`;

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

  if (!pdfUrl || !state || !grassType) {
    return NextResponse.json(
      { error: "pdfUrl, state, and grassType are required" },
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
      return NextResponse.json({ plan: cached.rows[0].parsed_plan, cached: true });
    }
  } catch {
    // DB not available in dev — continue without cache
  }

  // Fetch the PDF or page content
  let content: string;
  let mediaType: string | null = null;
  let pdfBuffer: Buffer | null = null;

  try {
    const response = await fetch(pdfUrl, {
      headers: { "User-Agent": "LawnGuide/1.0 (lawn care app)" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/pdf")) {
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      mediaType = "application/pdf";
    } else {
      // For HTML pages, extract text content
      content = await response.text();
      // Strip HTML tags for cleaner input
      content = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      // Limit to 50k chars to stay within token limits
      content = content.slice(0, 50000);
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch URL: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }

  // Call Claude API
  let plan: MonthlyPlan[];
  try {
    let message: Anthropic.Message;

    if (pdfBuffer && mediaType) {
      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
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
              {
                type: "text",
                text: `Extract the month-by-month lawn care plan for ${grassType} grass in ${state}. Return only the JSON array.`,
              },
            ],
          },
        ],
      });
    } else {
      message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Extract the month-by-month lawn care plan for ${grassType} grass in ${state} from this content:\n\n${content!}\n\nReturn only the JSON array.`,
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
    plan = JSON.parse(jsonMatch[0]) as MonthlyPlan[];
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
      [state.toUpperCase(), grassType, pdfUrl, JSON.stringify(plan)]
    );
  } catch {
    // DB not available in dev — return plan anyway
  }

  return NextResponse.json({ plan, cached: false });
}
