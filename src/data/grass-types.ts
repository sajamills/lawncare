export interface GrassType {
  id: string;
  name: string;
  description: string;
  bladeWidth: "fine" | "medium" | "coarse";
  texture: "soft" | "rough" | "stiff";
  color: "bright-green" | "dark-green" | "blue-green";
  growthPattern: "clumping" | "spreading";
  activeSeason: "warm" | "cool" | "year-round";
  photoUrl: string;
  traits: string[];
}

export const grassTypes: GrassType[] = [
  {
    id: "bermudagrass",
    name: "Bermudagrass",
    description:
      "A tough, heat-loving warm-season grass that spreads aggressively via stolons and rhizomes. Excellent for high-traffic areas in southern climates.",
    bladeWidth: "fine",
    texture: "rough",
    color: "bright-green",
    growthPattern: "spreading",
    activeSeason: "warm",
    photoUrl: "/images/grass/bermudagrass.jpg",
    traits: [
      "Fine blade",
      "Spreads quickly",
      "Drought-tolerant",
      "Full sun only",
      "Warm season",
    ],
  },
  {
    id: "zoysia",
    name: "Zoysia",
    description:
      "A dense, slow-growing warm-season grass that forms a thick carpet and tolerates heat, drought, and some shade. Turns straw-colored in winter.",
    bladeWidth: "fine",
    texture: "stiff",
    color: "dark-green",
    growthPattern: "spreading",
    activeSeason: "warm",
    photoUrl: "/images/grass/zoysia.jpg",
    traits: [
      "Dense carpet",
      "Slow growing",
      "Shade tolerant",
      "Warm season",
      "Stiff blades",
    ],
  },
  {
    id: "st-augustine",
    name: "St. Augustine",
    description:
      "A coarse, shade-tolerant warm-season grass with wide, flat blades. Very common in coastal Southern states and Florida.",
    bladeWidth: "coarse",
    texture: "soft",
    color: "dark-green",
    growthPattern: "spreading",
    activeSeason: "warm",
    photoUrl: "/images/grass/st-augustine.jpg",
    traits: ["Wide blades", "Shade tolerant", "Spreads via stolons", "Warm season", "Coastal-friendly"],
  },
  {
    id: "centipede",
    name: "Centipede",
    description:
      "A low-maintenance warm-season grass with medium-width blades and a light green color. Grows slowly and requires little fertilizer.",
    bladeWidth: "medium",
    texture: "soft",
    color: "bright-green",
    growthPattern: "spreading",
    activeSeason: "warm",
    photoUrl: "/images/grass/centipede.jpg",
    traits: ["Low maintenance", "Slow growing", "Light green", "Warm season", "Acid soil"],
  },
  {
    id: "bahia",
    name: "Bahia",
    description:
      "A coarse, drought-tolerant warm-season grass common in the Deep South. Known for its V-shaped seed heads and deep root system.",
    bladeWidth: "coarse",
    texture: "rough",
    color: "bright-green",
    growthPattern: "clumping",
    activeSeason: "warm",
    photoUrl: "/images/grass/bahia.jpg",
    traits: ["Drought-tolerant", "Deep roots", "Sandy soil", "Warm season", "Low input"],
  },
  {
    id: "kentucky-bluegrass",
    name: "Kentucky Bluegrass",
    description:
      "A fine-bladed, cool-season grass with a distinctive blue-green color and excellent self-repairing ability. Thrives in northern climates.",
    bladeWidth: "fine",
    texture: "soft",
    color: "blue-green",
    growthPattern: "spreading",
    activeSeason: "cool",
    photoUrl: "/images/grass/kentucky-bluegrass.jpg",
    traits: ["Blue-green color", "Fine blade", "Self-repairs", "Cool season", "Northern lawns"],
  },
  {
    id: "tall-fescue",
    name: "Tall Fescue",
    description:
      "A coarse, heat-tolerant cool-season grass with deep roots. Stays green in summer better than most cool-season grasses.",
    bladeWidth: "coarse",
    texture: "rough",
    color: "dark-green",
    growthPattern: "clumping",
    activeSeason: "cool",
    photoUrl: "/images/grass/tall-fescue.jpg",
    traits: ["Heat-tolerant", "Deep roots", "Clumping", "Cool season", "Stays green in summer"],
  },
  {
    id: "fine-fescue",
    name: "Fine Fescue",
    description:
      "An extremely fine-bladed cool-season grass that excels in shade and low-maintenance situations. Often mixed with Kentucky Bluegrass.",
    bladeWidth: "fine",
    texture: "soft",
    color: "dark-green",
    growthPattern: "clumping",
    activeSeason: "cool",
    photoUrl: "/images/grass/fine-fescue.jpg",
    traits: ["Very fine blades", "Shade tolerant", "Low maintenance", "Cool season", "Drought tolerant"],
  },
  {
    id: "perennial-ryegrass",
    name: "Perennial Ryegrass",
    description:
      "A quick-germinating, fine-to-medium bladed cool-season grass with a shiny appearance. Commonly used for overseeding and quick repairs.",
    bladeWidth: "medium",
    texture: "soft",
    color: "bright-green",
    growthPattern: "clumping",
    activeSeason: "cool",
    photoUrl: "/images/grass/perennial-ryegrass.jpg",
    traits: ["Fast germination", "Shiny leaves", "Cool season", "Quick repairs", "Transition zone"],
  },
  {
    id: "buffalo-grass",
    name: "Buffalo Grass",
    description:
      "A native North American prairie grass that is extremely drought-tolerant and low-maintenance. Stays short naturally and requires minimal mowing.",
    bladeWidth: "fine",
    texture: "soft",
    color: "blue-green",
    growthPattern: "spreading",
    activeSeason: "warm",
    photoUrl: "/images/grass/buffalo-grass.jpg",
    traits: ["Native grass", "Drought-tolerant", "Minimal mowing", "Warm season", "Prairie regions"],
  },
];
