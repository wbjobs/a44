import type { DifficultyLevel, InverseGenerateResponse } from '@shared/types';
import { GreedySolver } from './algorithms';
import { simulateJump } from '../utils/energySimulator';

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function generateFluctuation(
  count: number,
  difficulty: DifficultyLevel,
  random: () => number
): number[] {
  if (count <= 1) return [0];

  const fluctuation: number[] = new Array(count);

  switch (difficulty) {
    case 'easy': {
      const steepness = 0.6 + random() * 0.4;
      for (let i = 0; i < count; i++) {
        const base = (i / (count - 1)) * steepness;
        const jitter = (random() - 0.5) * 0.08;
        fluctuation[i] = Math.max(0, Math.min(1, base + jitter));
      }
      break;
    }

    case 'medium': {
      const numPeaks = 2 + Math.floor(random() * 2);
      const peakPositions: number[] = [];
      for (let p = 0; p < numPeaks; p++) {
        peakPositions.push(0.2 + (p / (numPeaks - 1 || 1)) * 0.6 + (random() - 0.5) * 0.1);
      }
      const peakHeights: number[] = peakPositions.map(() => 0.5 + random() * 0.5);

      for (let i = 0; i < count; i++) {
        const pos = i / (count - 1);
        let val = 0;
        for (let p = 0; p < numPeaks; p++) {
          const dist = Math.abs(pos - peakPositions[p]);
          const width = 0.15 + random() * 0.1;
          val += peakHeights[p] * Math.exp(-(dist * dist) / (width * width));
        }
        val += (random() - 0.5) * 0.08;
        fluctuation[i] = Math.max(0, Math.min(1, val));
      }

      const minF = Math.min(...fluctuation);
      const maxF = Math.max(...fluctuation);
      const range = Math.max(0.01, maxF - minF);
      for (let i = 0; i < count; i++) {
        fluctuation[i] = (fluctuation[i] - minF) / range;
      }
      break;
    }

    case 'hard': {
      for (let i = 0; i < count; i++) {
        fluctuation[i] = random();
      }

      const smoothLevels = 2;
      for (let level = 0; level < smoothLevels; level++) {
        const smoothed = [...fluctuation];
        for (let i = 1; i < count - 1; i++) {
          smoothed[i] = (fluctuation[i - 1] + fluctuation[i] + fluctuation[i + 1]) / 3;
        }
        for (let i = 0; i < count; i++) {
          fluctuation[i] = smoothed[i];
        }
      }

      for (let i = 0; i < count; i++) {
        fluctuation[i] += (random() - 0.5) * 0.12;
      }

      const minF = Math.min(...fluctuation);
      const maxF = Math.max(...fluctuation);
      const range = Math.max(0.01, maxF - minF);
      for (let i = 0; i < count; i++) {
        fluctuation[i] = (fluctuation[i] - minF) / range;
      }

      const contrast = 1.4;
      for (let i = 0; i < count; i++) {
        const v = fluctuation[i];
        fluctuation[i] = v < 0.5
          ? 0.5 * Math.pow(2 * v, contrast)
          : 1 - 0.5 * Math.pow(2 * (1 - v), contrast);
      }
      break;
    }
  }

  return fluctuation;
}

function buildHeights(
  fluctuation: number[],
  baseHeight: number,
  scale: number
): number[] {
  return fluctuation.map((f) => Math.max(1, Math.round(baseHeight + f * scale)));
}

function computeMinEnergy(heights: number[]): number {
  const solver = new GreedySolver();
  return solver.solve(heights).minInitialEnergy;
}

function computeMinEnergyPerBuilding(heights: number[]): number[] {
  const n = heights.length;
  const dp: number[] = new Array(n);
  dp[n - 1] = 0;

  for (let i = n - 2; i >= 0; i--) {
    const h1 = heights[i];
    const h2 = heights[i + 1];
    const diff = Math.abs(h2 - h1);

    if (h2 > h1) {
      dp[i] = Math.max(0, dp[i + 1] + 2 * diff);
    } else if (h2 < h1) {
      dp[i] = Math.max(0, dp[i + 1] - diff);
    } else {
      dp[i] = dp[i + 1];
    }
  }

  return dp;
}

function countPeaks(heights: number[]): number {
  let peaks = 0;
  for (let i = 1; i < heights.length - 1; i++) {
    if (heights[i] > heights[i - 1] && heights[i] > heights[i + 1]) {
      peaks++;
    }
  }
  return peaks;
}

function countValleys(heights: number[]): number {
  let valleys = 0;
  for (let i = 1; i < heights.length - 1; i++) {
    if (heights[i] < heights[i - 1] && heights[i] < heights[i + 1]) {
      valleys++;
    }
  }
  return valleys;
}

function countDangerZones(minEnergyPerBuilding: number[], threshold = 5): number {
  let zones = 0;
  let inZone = false;
  for (const e of minEnergyPerBuilding) {
    if (e <= threshold && !inZone) {
      zones++;
      inZone = true;
    } else if (e > threshold) {
      inZone = false;
    }
  }
  return zones;
}

export class InverseGeneratorService {
  generate(
    targetEnergy: number,
    count: number,
    difficulty: DifficultyLevel,
    seed?: number,
    baseHeight: number = 20
  ): InverseGenerateResponse {
    const actualSeed = seed ?? Math.floor(Math.random() * 2 ** 31);
    const random = seededRandom(actualSeed);

    if (count <= 1) {
      const heights = [baseHeight];
      return {
        heights,
        targetEnergy,
        actualEnergy: 0,
        errorRate: targetEnergy > 0 ? 1 : 0,
        difficulty,
        seed: actualSeed,
        minEnergyPerBuilding: [0],
        maxEnergyEstimate: 0,
        terrainStats: {
          peaks: 0,
          valleys: 0,
          avgHeight: baseHeight,
          heightVariance: 0,
          dangerZones: 0,
        },
      };
    }

    const fluctuation = generateFluctuation(count, difficulty, random);

    let lowScale = 0;
    let highScale = 10;

    const highHeights = buildHeights(fluctuation, baseHeight, highScale);
    let highEnergy = computeMinEnergy(highHeights);
    while (highEnergy < targetEnergy && highScale < 10000) {
      highScale *= 2;
      const h = buildHeights(fluctuation, baseHeight, highScale);
      highEnergy = computeMinEnergy(h);
    }

    let bestScale = highScale;
    let bestHeights = buildHeights(fluctuation, baseHeight, bestScale);
    let bestEnergy = highEnergy;

    for (let iter = 0; iter < 60; iter++) {
      const midScale = (lowScale + highScale) / 2;
      const midHeights = buildHeights(fluctuation, baseHeight, Math.round(midScale));
      const midEnergy = computeMinEnergy(midHeights);

      if (midEnergy < targetEnergy) {
        lowScale = midScale;
      } else {
        highScale = midScale;
        bestScale = midScale;
        bestHeights = midHeights;
        bestEnergy = midEnergy;
      }
    }

    const lowHeights = buildHeights(fluctuation, baseHeight, Math.max(0, Math.round(lowScale)));
    const lowEnergy = computeMinEnergy(lowHeights);

    if (targetEnergy - lowEnergy < bestEnergy - targetEnergy && lowScale > 0) {
      bestHeights = lowHeights;
      bestEnergy = lowEnergy;
    }

    const errorRate = targetEnergy > 0
      ? Math.abs(bestEnergy - targetEnergy) / targetEnergy
      : bestEnergy > 0 ? 1 : 0;

    const minEnergyPerBuilding = computeMinEnergyPerBuilding(bestHeights);

    const maxEnergyEstimate = Math.max(...minEnergyPerBuilding) * 1.5;

    const avgHeight = bestHeights.reduce((a, b) => a + b, 0) / bestHeights.length;
    const heightVariance = bestHeights.reduce((acc, h) => acc + (h - avgHeight) ** 2, 0) / bestHeights.length;

    return {
      heights: bestHeights,
      targetEnergy,
      actualEnergy: bestEnergy,
      errorRate,
      difficulty,
      seed: actualSeed,
      minEnergyPerBuilding,
      maxEnergyEstimate,
      terrainStats: {
        peaks: countPeaks(bestHeights),
        valleys: countValleys(bestHeights),
        avgHeight: Math.round(avgHeight * 10) / 10,
        heightVariance: Math.round(heightVariance * 10) / 10,
        dangerZones: countDangerZones(minEnergyPerBuilding, Math.max(2, targetEnergy * 0.1)),
      },
    };
  }
}

export const inverseGeneratorService = new InverseGeneratorService();
