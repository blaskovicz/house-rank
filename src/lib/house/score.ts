import { HouseTableModel } from "@/lib/house";
import { parseUpperCamelCase } from "@/lib/string";

export function scoreHouses(houses: HouseTableModel[]) {
  if (!houses || houses.length === 0) return;

  const statPoints: {
    [key: string]: {
      score: number;
    };
  } = {
    price: { score: 30 },
    priceAppraised: { score: 15 },
    bedrooms: { score: 10 },
    bathrooms: { score: 10 },
    acreage: { score: 20 },
    livingArea: { score: 20 },
    taxPaid: { score: 10 },
    yearBuilt: { score: 15 }
  };

  // first, build lookup for numeric stats, keyed by column
  const stats: {
    avg: { [key: string]: number };
    max: { [key: string]: number };
    min: { [key: string]: number };
  } = {
    avg: {},
    max: {},
    min: {}
  };

  for (const h of houses) {
    for (const [key, value] of Object.entries(h)) {
      if (typeof value !== "number") continue;
      if (stats.avg[key] === undefined) {
        stats.avg[key] = 0;
        stats.max[key] = 0;
        stats.min[key] = Number.MAX_VALUE;
      }

      // new max
      if (value > stats.max[key]) {
        stats.max[key] = value;
      }
      // new min
      if (value < stats.min[key]) {
        stats.min[key] = value;
      }
      // accumulate for avg
      stats.avg[key] += value;
    }
  }
  for (const [key, value] of Object.entries(stats.avg)) {
    stats.avg[key] = +value / houses.length;
  }

  // now apply logic for scoring
  for (const h of houses) {
    let { score } = h;
    const { scoreExplanation } = h;
    const addToScore = (
      scorePart: number,
      scoreMax: number,
      reason: string
    ) => {
      score += scorePart;
      scoreExplanation.push({ scorePart, scoreMax, reason });
    };

    // highest %, shared
    for (const sharedBestStat of [
      "priceAppraised",
      "bedrooms",
      "bathrooms",
      "acreage",
      "livingArea"
    ]) {
      if (typeof h[sharedBestStat] !== "number") {
        throw new Error(
          `Cannot calculate score for House${JSON.stringify(
            h
          )} - missing ${sharedBestStat}`
        );
      }
      addToScore(
        (h[sharedBestStat] * statPoints[sharedBestStat].score) /
          stats.max[sharedBestStat],
        statPoints[sharedBestStat].score,
        `most ${parseUpperCamelCase(sharedBestStat)}`
      );
    }

    // lowest, shared
    for (const sharedBestStat of ["price", "taxPaid"]) {
      if (typeof h[sharedBestStat] !== "number") {
        throw new Error(
          `Cannot calculate score for House${JSON.stringify(
            h
          )} - missing ${sharedBestStat}`
        );
      }

      addToScore(
        ((stats.max[sharedBestStat] - h[sharedBestStat]) *
          statPoints[sharedBestStat].score) /
          (stats.max[sharedBestStat] - stats.min[sharedBestStat]),
        statPoints[sharedBestStat].score,
        `least ${parseUpperCamelCase(sharedBestStat)}`
      );
    }

    addToScore(
      (h.yearBuilt * statPoints.yearBuilt.score) / stats.max.yearBuilt,
      statPoints.yearBuilt.score,
      "newest year built"
    );

    // TODO other self-stats
    // TODO other fact-based stats
    // TODO other distance stats
    // etc
    scoreExplanation.sort((a, b) => b.scorePart - a.scorePart);
    h.score = score;
  }
}
