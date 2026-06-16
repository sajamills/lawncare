import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import type { WeeklyTask, WeeklyPlan } from "@/lib/week-utils";
import {
  normalizeGrassId,
  normalizeStateCode,
  validateWeeklyPlan,
  extractPlanFromText,
} from "@/lib/week-utils";
import { getSeededPlan } from "@/data/seeded-plans";

// Re-export types so existing importers (dashboard, calendar) keep working
export type { WeeklyTask, WeeklyPlan };

function getAnthropicClient(): Anthropic | null {
  if (process.env.ENABLE_LIVE_PLAN_GENERATION !== "1") return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

const SYSTEM_PROMPT = `You are a lawn care expert. Generate a week-by-week care plan for the specified grass type and US state.

Return ONLY a valid JSON array with exactly 52 entries, one per ISO 8601 week (weeks 1–52). Use ISO 8601 week numbering: week 1 is the week containing January 4 (Monday–Sunday). This matches JavaScript's standard ISO week calculation. Week 25 falls in mid-June for most years. Each entry must have:
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
- Use your expert knowledge of the grass type and state's climate to assign tasks to the correct ISO weeks
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

  const raw = body as { pdfUrl?: string; state?: string; grassType?: string };

  if (!raw.state || !raw.grassType) {
    return NextResponse.json(
      { error: "state and grassType are required" },
      { status: 400 }
    );
  }

  const stateKey = normalizeStateCode(raw.state);
  const grassKey = normalizeGrassId(raw.grassType);
  const pdfUrl = raw.pdfUrl;

  // Check cache first
  try {
    const cached = await db.query(
      "SELECT parsed_plan FROM cached_plans WHERE state = $1 AND grass_type = $2",
      [stateKey, grassKey]
    );
    if (cached.rows.length > 0) {
      const cachedPlan = cached.rows[0].parsed_plan as unknown;
      const error = validateWeeklyPlan(cachedPlan);
      if (!error) {
        console.log(`[parse-pdf] stage=cache_hit state=${stateKey} grass=${grassKey}`);
        return NextResponse.json({ plan: cachedPlan, cached: true });
      }
      // Invalid cached plan — delete and regenerate
      console.error(`[parse-pdf] stage=cache_invalid state=${stateKey} grass=${grassKey}: ${error.message}`);
      await db.query(
        "DELETE FROM cached_plans WHERE state = $1 AND grass_type = $2",
        [stateKey, grassKey]
      );
    }
  } catch (err) {
    // DB not available in dev — continue without cache
    console.error(`[parse-pdf] stage=cache_read_error state=${stateKey} grass=${grassKey}`, err instanceof Error ? err.message : String(err));
  }

  const seeded = getSeededPlan(stateKey, grassKey);
  if (seeded) {
    try {
      await db.query(
        `INSERT INTO cached_plans (state, grass_type, pdf_url, parsed_plan)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (state, grass_type) DO UPDATE
         SET pdf_url = EXCLUDED.pdf_url, parsed_plan = EXCLUDED.parsed_plan, created_at = NOW()`,
        [stateKey, grassKey, seeded.sourceUrl, JSON.stringify(seeded.plan)]
      );
      console.log(`[parse-pdf] stage=seed_cache_write state=${stateKey} grass=${grassKey} weeks=${seeded.plan.length}`);
    } catch (err) {
      console.error(`[parse-pdf] stage=seed_cache_write_error state=${stateKey} grass=${grassKey}`, err instanceof Error ? err.message : String(err));
    }

    console.log(`[parse-pdf] stage=seed_hit state=${stateKey} grass=${grassKey}`);
    return NextResponse.json({ plan: seeded.plan, cached: false, source: "seeded" });
  }

  if (process.env.ENABLE_LIVE_PLAN_GENERATION !== "1") {
    console.error(`[parse-pdf] stage=seed_missing state=${stateKey} grass=${grassKey}`);
    return NextResponse.json(
      {
        error: "No seeded plan is available for this state and grass type yet.",
      },
      { status: 404 }
    );
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
  console.log(`[parse-pdf] stage=claude_call state=${stateKey} grass=${grassKey}`);
  const client = getAnthropicClient();
  if (!client) {
    console.error(`[parse-pdf] stage=missing_anthropic_key state=${stateKey} grass=${grassKey}`);
    return NextResponse.json(
      { error: "Plan generation is not configured. Missing ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  let plan: WeeklyPlan[];
  try {
    let message: Anthropic.Message;
    const userPrompt = `Generate a 52-week ISO 8601 lawn care plan for ${grassKey} grass in ${stateKey}. Return only the JSON array.`;

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
    const parsed = extractPlanFromText(rawText);
    if (!parsed) {
      console.error(`[parse-pdf] stage=invalid_plan state=${stateKey} grass=${grassKey} — Claude response failed validation`);
      return NextResponse.json(
        { error: "Failed to parse plan: Claude response failed validation" },
        { status: 500 }
      );
    }
    plan = parsed;
  } catch (err) {
    console.error(`[parse-pdf] stage=claude_error state=${stateKey} grass=${grassKey}`, err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      {
        error: `Failed to generate plan: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }

  // Cache to DB (only reached when plan is valid)
  try {
    await db.query(
      `INSERT INTO cached_plans (state, grass_type, pdf_url, parsed_plan)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (state, grass_type) DO UPDATE SET parsed_plan = EXCLUDED.parsed_plan, created_at = NOW()`,
      [stateKey, grassKey, pdfUrl ?? "", JSON.stringify(plan)]
    );
    console.log(`[parse-pdf] stage=cache_write state=${stateKey} grass=${grassKey} weeks=${plan.length}`);
  } catch (err) {
    // DB not available in dev — return plan anyway
    console.error(`[parse-pdf] stage=cache_write_error state=${stateKey} grass=${grassKey}`, err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json({ plan, cached: false });
}
