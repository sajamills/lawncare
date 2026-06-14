import { grassTypes, GrassType } from "@/data/grass-types";

export interface ScoredGrassType {
  grassType: GrassType;
  score: number;
  matchCount: number;
}

export function scoreGrassTypes(
  answers: Record<string, string>
): ScoredGrassType[] {
  const traitKeys = Object.keys(answers);

  const scored = grassTypes.map((grassType) => {
    let matchCount = 0;
    for (const traitKey of traitKeys) {
      const answer = answers[traitKey];
      const grassValue = grassType[traitKey as keyof GrassType];
      if (grassValue === answer) {
        matchCount++;
      }
    }
    return {
      grassType,
      score: traitKeys.length > 0 ? matchCount / traitKeys.length : 0,
      matchCount,
    };
  });

  return scored.sort((a, b) => b.matchCount - a.matchCount || a.grassType.name.localeCompare(b.grassType.name));
}
