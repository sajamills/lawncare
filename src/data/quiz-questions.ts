export interface QuizOption {
  label: string;
  value: string;
  trait: string;
  traitValue: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "blade-width",
    question: "How would you describe the width of your grass blades?",
    options: [
      {
        label: "Very thin, almost like needles",
        value: "fine",
        trait: "bladeWidth",
        traitValue: "fine",
      },
      {
        label: "Medium width, typical grass look",
        value: "medium",
        trait: "bladeWidth",
        traitValue: "medium",
      },
      {
        label: "Wide and flat blades",
        value: "coarse",
        trait: "bladeWidth",
        traitValue: "coarse",
      },
    ],
  },
  {
    id: "texture",
    question: "When you run your hand across the grass, it feels...",
    options: [
      {
        label: "Soft and comfortable",
        value: "soft",
        trait: "texture",
        traitValue: "soft",
      },
      {
        label: "Rough or scratchy",
        value: "rough",
        trait: "texture",
        traitValue: "rough",
      },
      {
        label: "Stiff and springy",
        value: "stiff",
        trait: "texture",
        traitValue: "stiff",
      },
    ],
  },
  {
    id: "color",
    question: "What is the most accurate color description of your lawn?",
    options: [
      {
        label: "Bright, vivid green",
        value: "bright-green",
        trait: "color",
        traitValue: "bright-green",
      },
      {
        label: "Deep, dark green",
        value: "dark-green",
        trait: "color",
        traitValue: "dark-green",
      },
      {
        label: "Blue-tinted or grayish green",
        value: "blue-green",
        trait: "color",
        traitValue: "blue-green",
      },
    ],
  },
  {
    id: "growth-pattern",
    question: "How does your grass spread or grow?",
    options: [
      {
        label: "It spreads sideways, filling in bare spots on its own",
        value: "spreading",
        trait: "growthPattern",
        traitValue: "spreading",
      },
      {
        label: "It grows in clumps and doesn't fill in bare spots",
        value: "clumping",
        trait: "growthPattern",
        traitValue: "clumping",
      },
    ],
  },
  {
    id: "active-season",
    question: "When does your grass look its best?",
    options: [
      {
        label: "Summer — lush and green in hot weather",
        value: "warm",
        trait: "activeSeason",
        traitValue: "warm",
      },
      {
        label: "Spring and fall — struggles or goes dormant in summer heat",
        value: "cool",
        trait: "activeSeason",
        traitValue: "cool",
      },
      {
        label: "Year-round — stays relatively green in all seasons",
        value: "year-round",
        trait: "activeSeason",
        traitValue: "year-round",
      },
    ],
  },
];
