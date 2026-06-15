export interface PreemergentWindow {
  spring: { startDate: string; endDate: string };
  fall: { startDate: string; endDate: string };
}

// Date ranges represent when soil typically reaches target temps:
// Spring: 50°F (apply pre-emergent before crabgrass germinates)
// Fall: 70°F cooling (apply before winter annual weeds germinate)
export const PREEMERGENT_WINDOWS: Record<string, PreemergentWindow> = {
  // Deep South
  FL: { spring: { startDate: "02-01", endDate: "03-01" }, fall: { startDate: "09-15", endDate: "10-15" } },
  GA: { spring: { startDate: "02-15", endDate: "03-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  AL: { spring: { startDate: "02-15", endDate: "03-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  MS: { spring: { startDate: "02-15", endDate: "03-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  LA: { spring: { startDate: "02-15", endDate: "03-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  // Mid-South
  NC: { spring: { startDate: "03-01", endDate: "04-01" }, fall: { startDate: "09-15", endDate: "10-15" } },
  SC: { spring: { startDate: "03-01", endDate: "04-01" }, fall: { startDate: "09-15", endDate: "10-15" } },
  TN: { spring: { startDate: "03-01", endDate: "04-01" }, fall: { startDate: "09-15", endDate: "10-15" } },
  AR: { spring: { startDate: "03-01", endDate: "04-01" }, fall: { startDate: "09-15", endDate: "10-15" } },
  TX: { spring: { startDate: "02-15", endDate: "03-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  // Transition zone
  VA: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-01", endDate: "10-01" } },
  KY: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-01", endDate: "10-01" } },
  MO: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-01", endDate: "10-01" } },
  OK: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-01", endDate: "10-01" } },
  WV: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-01", endDate: "10-01" } },
  // Mid-Atlantic / Midwest
  MD: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  DE: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  PA: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  OH: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  IN: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  IL: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  KS: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  NE: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  // Northeast
  NY: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-01", endDate: "09-01" } },
  NJ: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  CT: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-01", endDate: "09-01" } },
  MA: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-01", endDate: "09-01" } },
  RI: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-01", endDate: "09-01" } },
  VT: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  NH: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  ME: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  // Upper Midwest
  MI: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-01", endDate: "09-01" } },
  WI: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  MN: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  ND: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  SD: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  IA: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-01", endDate: "09-01" } },
  // Pacific Coast
  CA: { spring: { startDate: "02-01", endDate: "03-01" }, fall: { startDate: "10-01", endDate: "11-01" } },
  AZ: { spring: { startDate: "02-01", endDate: "03-01" }, fall: { startDate: "10-01", endDate: "11-01" } },
  NV: { spring: { startDate: "02-15", endDate: "03-15" }, fall: { startDate: "10-01", endDate: "11-01" } },
  NM: { spring: { startDate: "03-01", endDate: "04-01" }, fall: { startDate: "09-15", endDate: "10-15" } },
  // Northwest
  OR: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  WA: { spring: { startDate: "03-15", endDate: "04-15" }, fall: { startDate: "09-15", endDate: "10-15" } },
  // Mountain
  CO: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  UT: { spring: { startDate: "04-01", endDate: "05-01" }, fall: { startDate: "08-15", endDate: "09-15" } },
  ID: { spring: { startDate: "04-15", endDate: "05-15" }, fall: { startDate: "08-15", endDate: "09-15" } },
  WY: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  MT: { spring: { startDate: "05-01", endDate: "06-01" }, fall: { startDate: "08-01", endDate: "09-01" } },
  // Other western
  AK: { spring: { startDate: "05-15", endDate: "06-15" }, fall: { startDate: "07-15", endDate: "08-15" } },
  HI: { spring: { startDate: "01-15", endDate: "02-15" }, fall: { startDate: "10-15", endDate: "11-15" } },
};

export function getPreemergentWindow(state: string): PreemergentWindow | null {
  return PREEMERGENT_WINDOWS[state.toUpperCase()] ?? null;
}
