import type { WeeklyPlan, WeeklyTask } from "@/lib/week-utils";

type SeasonStrategy = "warm" | "cool";

export interface SeededPlanDefinition {
  state: string;
  grassType: string;
  sourceUrl: string;
  strategy: SeasonStrategy;
}

const AR_LAWNS = "https://uaex.uada.edu/yard-garden/lawns/default.aspx";
const GA_CALENDARS = "https://turf.caes.uga.edu/publications/Lawn_Care_Calendars.html";

export const seededPlanDefinitions: SeededPlanDefinition[] = [
  {
    state: "AR",
    grassType: "bermudagrass",
    sourceUrl: "https://uaex.uada.edu/publications/PDF/FSA-6121.pdf",
    strategy: "warm",
  },
  {
    state: "AR",
    grassType: "zoysia",
    sourceUrl: "https://www.uaex.uada.edu/publications/pdf/FSA-6122.pdf",
    strategy: "warm",
  },
  { state: "AR", grassType: "tall-fescue", sourceUrl: AR_LAWNS, strategy: "cool" },
  { state: "GA", grassType: "bermudagrass", sourceUrl: GA_CALENDARS, strategy: "warm" },
  {
    state: "GA",
    grassType: "tall-fescue",
    sourceUrl: "https://turf.caes.uga.edu/content/dam/caes-subsite/georgiaturf/docs/pcrp2024/2024_Tall_Fescue_Calendar.pdf",
    strategy: "cool",
  },
  { state: "GA", grassType: "centipede", sourceUrl: GA_CALENDARS, strategy: "warm" },
  { state: "GA", grassType: "zoysia", sourceUrl: GA_CALENDARS, strategy: "warm" },
  { state: "GA", grassType: "st-augustine", sourceUrl: GA_CALENDARS, strategy: "warm" },
  {
    state: "NC",
    grassType: "bermudagrass",
    sourceUrl: "https://content.ces.ncsu.edu/bermudagrass-lawn-maintenance-calendar",
    strategy: "warm",
  },
  {
    state: "NC",
    grassType: "tall-fescue",
    sourceUrl: "https://content.ces.ncsu.edu/tall-fescue-lawn-maintenance-calendar",
    strategy: "cool",
  },
  {
    state: "NC",
    grassType: "centipede",
    sourceUrl: "https://content.ces.ncsu.edu/centipede-lawn-maintenance-calendar",
    strategy: "warm",
  },
  {
    state: "NC",
    grassType: "zoysia",
    sourceUrl: "https://content.ces.ncsu.edu/zoysiagrass-lawn-maintenance-calendar",
    strategy: "warm",
  },
  {
    state: "TX",
    grassType: "bermudagrass",
    sourceUrl: "https://agrilifeextension.tamu.edu/library/gardening/lawn-care/",
    strategy: "warm",
  },
  {
    state: "FL",
    grassType: "st-augustine",
    sourceUrl: "https://edis.ifas.ufl.edu/publication/LH010",
    strategy: "warm",
  },
  {
    state: "FL",
    grassType: "bermudagrass",
    sourceUrl: "https://edis.ifas.ufl.edu/publication/LH008",
    strategy: "warm",
  },
  {
    state: "KY",
    grassType: "kentucky-bluegrass",
    sourceUrl: "https://extension.ca.uky.edu/files/agr-51.pdf",
    strategy: "cool",
  },
  {
    state: "MN",
    grassType: "kentucky-bluegrass",
    sourceUrl: "https://extension.umn.edu/lawn-care/lawn-care-guide",
    strategy: "cool",
  },
  {
    state: "PA",
    grassType: "tall-fescue",
    sourceUrl: "https://extension.psu.edu/lawn-management-through-the-seasons/",
    strategy: "cool",
  },
];

interface SeededPlan {
  plan: WeeklyPlan[];
  sourceUrl: string;
}

function task(
  title: string,
  description: string,
  category: WeeklyTask["category"],
  priority: WeeklyTask["priority"] = "routine",
  petSafetyNote = ""
): WeeklyTask {
  return { title, description, category, priority, petSafetyNote };
}

function emptyPlan(): WeeklyPlan[] {
  return Array.from({ length: 52 }, (_, i) => ({ week: i + 1, tasks: [] }));
}

function add(plan: WeeklyPlan[], week: number, item: WeeklyTask) {
  plan[week - 1]?.tasks.push(item);
}

function addEvery(plan: WeeklyPlan[], start: number, end: number, interval: number, item: WeeklyTask) {
  for (let week = start; week <= end; week += interval) add(plan, week, item);
}

function warmStartWeek(state: string) {
  if (state === "FL") return 9;
  if (state === "TX" || state === "GA") return 11;
  return 12;
}

function coolFallStartWeek(state: string) {
  if (state === "MN") return 33;
  if (state === "PA" || state === "KY") return 35;
  return 37;
}

function warmSeasonPlan(definition: SeededPlanDefinition): WeeklyPlan[] {
  const plan = emptyPlan();
  const start = warmStartWeek(definition.state);
  const isLowNitrogenGrass =
    definition.grassType === "centipede" || definition.grassType === "st-augustine";
  const grassLabel = definition.grassType.replace("-", " ");

  add(plan, 3, task(
    "Order a soil test",
    "Test soil before spring growth so lime and nutrient decisions are based on local recommendations.",
    "other",
    "optional"
  ));
  add(plan, Math.max(7, start - 3), task(
    "Apply spring pre-emergent",
    "Apply a labeled pre-emergent before crabgrass and other summer annual weeds germinate.",
    "pest-weed",
    "urgent",
    "Keep pets off treated turf until the product has dried or the label re-entry interval has passed."
  ));
  add(plan, start, task(
    "Start spring mowing",
    `Begin mowing ${grassLabel} as it greens up, removing no more than one-third of the blade at a time.`,
    "mow"
  ));
  add(plan, start + 2, task(
    "Spot-treat emerged weeds",
    "Treat only actively growing weeds and confirm the product is labeled for this grass type.",
    "pest-weed",
    "routine",
    "Keep pets away until sprays have dried and follow the product label."
  ));
  add(plan, start + 3, task(
    "Begin deep watering checks",
    "Water deeply only when rainfall is short and the lawn shows drought stress; aim for about 1 inch per week including rain.",
    "water"
  ));

  addEvery(plan, start + 4, 36, 2, task(
    "Mow at active-growth height",
    "Keep mowing on the grass type's recommended height range and avoid scalping during heat or drought.",
    "mow"
  ));
  addEvery(plan, start + 6, 35, 3, task(
    "Check irrigation depth",
    "Run irrigation long enough to wet the root zone, then let the surface dry before watering again.",
    "water"
  ));

  const fertilizerWeeks = isLowNitrogenGrass ? [22, 30] : [20, 26, 32];
  for (const week of fertilizerWeeks) {
    add(plan, week, task(
      "Fertilize after full green-up",
      isLowNitrogenGrass
        ? "Apply a modest nitrogen feeding only if the lawn is actively growing and soil-test guidance supports it."
        : "Apply nitrogen while the lawn is actively growing, following soil-test guidance and local rate limits.",
      "fertilize",
      "routine",
      "Water fertilizer off leaf blades and keep pets off the lawn until granules are dissolved or swept in."
    ));
  }

  add(plan, 24, task(
    "Core aerate if compacted",
    "Aerate only while the warm-season lawn is actively growing so it can recover quickly.",
    "aerate",
    "optional"
  ));
  add(plan, 28, task(
    "Inspect for insects and disease",
    "Look for grubs, chinch bugs, armyworms, or disease patches and treat only when damage or threshold levels are present.",
    "pest-weed",
    "routine",
    "Use pet-safe cultural fixes first; follow label re-entry directions for any pesticide."
  ));
  add(plan, 36, task(
    "Apply fall pre-emergent",
    "Apply a labeled pre-emergent for winter annual weeds before fall germination.",
    "pest-weed",
    "urgent",
    "Keep pets off treated turf until dry or until the label says it is safe."
  ));
  add(plan, 40, task(
    "Reduce mowing as growth slows",
    "Keep mowing until dormancy, but stretch intervals as growth slows in fall.",
    "mow",
    "optional"
  ));
  add(plan, 45, task(
    "Mulch or remove leaves",
    "Do not let leaf cover smother dormant turf; mulch lightly or remove heavy piles.",
    "other"
  ));
  add(plan, 50, task(
    "Limit winter traffic",
    "Dormant warm-season turf recovers slowly, so avoid repeated traffic on frozen, wet, or straw-colored areas.",
    "other",
    "optional"
  ));

  return plan;
}

function coolSeasonPlan(definition: SeededPlanDefinition): WeeklyPlan[] {
  const plan = emptyPlan();
  const fallStart = coolFallStartWeek(definition.state);
  const grassLabel = definition.grassType.replace("-", " ");

  add(plan, 3, task(
    "Review soil test and lime needs",
    "Use winter to test soil and apply lime only when a soil test recommends it.",
    "other",
    "optional"
  ));
  add(plan, 9, task(
    "Apply spring pre-emergent",
    "Apply crabgrass pre-emergent before germination, then delay aeration or seeding until fall.",
    "pest-weed",
    "urgent",
    "Keep pets off treated turf until the product has dried or the label re-entry interval has passed."
  ));
  add(plan, 12, task(
    "Resume mowing",
    `Mow ${grassLabel} at its recommended cool-season height and remove no more than one-third of the blade.`,
    "mow"
  ));
  add(plan, 13, task(
    "Apply light spring fertilizer",
    "Use a light spring feeding only if soil-test guidance or turf condition calls for it; avoid pushing lush growth before heat.",
    "fertilize",
    "optional",
    "Water fertilizer in and keep pets away until granules are dissolved or swept off hard surfaces."
  ));
  addEvery(plan, 14, 25, 2, task(
    "Mow during spring growth",
    "Maintain the lawn at the recommended height and sharpen blades for a clean cut.",
    "mow"
  ));
  add(plan, 17, task(
    "Spot-treat broadleaf weeds",
    "Treat only visible weeds on a mild day and avoid applications during heat or drought stress.",
    "pest-weed",
    "routine",
    "Keep pets away until sprays dry and follow the label."
  ));
  addEvery(plan, 22, 34, 3, task(
    "Water through summer stress",
    "Provide about 1 inch of water per week including rainfall, or let the lawn go dormant if that is acceptable locally.",
    "water"
  ));
  addEvery(plan, 24, 34, 3, task(
    "Raise mowing height",
    "Mow higher during summer heat to shade crowns and reduce drought stress.",
    "mow"
  ));
  add(plan, 27, task(
    "Watch for summer disease",
    "Inspect for brown patch or thinning during warm, humid weather and reduce leaf wetness where possible.",
    "pest-weed",
    "routine",
    "Use pesticide products only when needed and follow all pet re-entry instructions."
  ));
  add(plan, fallStart, task(
    "Core aerate compacted areas",
    "Aerate at the start of the fall recovery window when cool-season turf is growing strongly.",
    "aerate",
    "routine"
  ));
  add(plan, fallStart + 1, task(
    "Overseed thin areas",
    "Seed thin or bare areas during the fall establishment window and keep the seedbed consistently moist.",
    "seed",
    "urgent",
    "Keep pets off newly seeded areas until seedlings are rooted enough to tolerate traffic."
  ));
  add(plan, fallStart + 2, task(
    "Apply fall starter fertilizer",
    "Fertilize according to soil-test guidance to support fall root growth and seedling establishment.",
    "fertilize",
    "routine",
    "Water fertilizer in and keep pets off the lawn until granules dissolve."
  ));
  addEvery(plan, fallStart + 3, 45, 2, task(
    "Mow new fall growth",
    "Mow when the lawn reaches the upper end of its recommended height; avoid removing more than one-third at once.",
    "mow"
  ));
  add(plan, 43, task(
    "Control winter annual weeds",
    "If you did not seed this fall, apply labeled winter annual weed prevention or spot-treat emerged weeds.",
    "pest-weed",
    "optional",
    "Avoid herbicides on newly seeded turf unless the product label allows it."
  ));
  add(plan, 46, task(
    "Apply late-fall fertilizer",
    "Use a late-fall feeding while grass is still green to strengthen cool-season roots before winter.",
    "fertilize",
    "routine",
    "Water fertilizer off leaf blades and keep pets away until granules are dissolved."
  ));
  add(plan, 48, task(
    "Remove heavy leaf cover",
    "Mulch light leaves or remove heavy mats so turf can keep receiving light and air.",
    "other"
  ));
  add(plan, 51, task(
    "Avoid winter wear",
    "Limit repeated traffic on frozen or saturated turf to prevent crown injury and compaction.",
    "other",
    "optional"
  ));

  return plan;
}

export function getSeededPlan(state: string, grassType: string): SeededPlan | null {
  const stateKey = state.toUpperCase().trim();
  const grassKey = grassType.toLowerCase().trim();
  const definition = seededPlanDefinitions.find(
    (item) => item.state === stateKey && item.grassType === grassKey
  );

  if (!definition) return null;

  const plan =
    definition.strategy === "warm"
      ? warmSeasonPlan(definition)
      : coolSeasonPlan(definition);

  return { plan, sourceUrl: definition.sourceUrl };
}
