import { createPool } from "@vercel/postgres";
import { seededPlanDefinitions, getSeededPlan } from "../src/data/seeded-plans";
import { validateWeeklyPlan } from "../src/lib/week-utils";

async function seedCachedPlans() {
  const db = createPool();
  let count = 0;

  console.log(`Seeding ${seededPlanDefinitions.length} cached plan(s)...`);

  for (const definition of seededPlanDefinitions) {
    const seeded = getSeededPlan(definition.state, definition.grassType);
    if (!seeded) {
      throw new Error(`No seeded plan for ${definition.state}_${definition.grassType}`);
    }

    const error = validateWeeklyPlan(seeded.plan);
    if (error) {
      throw new Error(
        `Invalid seeded plan for ${definition.state}_${definition.grassType}: ${error.message}`
      );
    }

    await db.query(
      `INSERT INTO cached_plans (state, grass_type, pdf_url, parsed_plan)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (state, grass_type) DO UPDATE
       SET pdf_url = EXCLUDED.pdf_url, parsed_plan = EXCLUDED.parsed_plan, created_at = NOW()`,
      [definition.state, definition.grassType, seeded.sourceUrl, JSON.stringify(seeded.plan)]
    );
    count += 1;
    console.log(`  -> ${definition.state}_${definition.grassType}`);
  }

  console.log(`Seeded ${count} cached plan(s).`);
  await db.end();
}

seedCachedPlans().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
