export interface SimulationResult {
  success: boolean;
  finalEnergy: number;
  energyTrace: number[];
  minEnergyReached: number;
}

export function simulateJump(
  heights: number[],
  initialEnergy: number
): SimulationResult {
  if (heights.length === 0) {
    return {
      success: true,
      finalEnergy: initialEnergy,
      energyTrace: [initialEnergy],
      minEnergyReached: initialEnergy,
    };
  }

  const n = heights.length;
  const energyTrace: number[] = [initialEnergy];
  let energy = initialEnergy;
  let minEnergy = initialEnergy;
  let success = true;

  for (let i = 0; i < n - 1; i++) {
    const h1 = heights[i];
    const h2 = heights[i + 1];
    const diff = Math.abs(h2 - h1);

    if (h2 > h1) {
      energy = energy - 2 * diff;
    } else if (h2 < h1) {
      energy = energy + diff;
    }

    energyTrace.push(energy);

    if (energy < minEnergy) {
      minEnergy = energy;
    }

    if (energy < 0) {
      success = false;
      break;
    }
  }

  return {
    success,
    finalEnergy: energy,
    energyTrace,
    minEnergyReached: minEnergy,
  };
}

export function canReach(heights: number[], initialEnergy: number): boolean {
  if (heights.length <= 1) return true;

  let energy = initialEnergy;
  for (let i = 0; i < heights.length - 1; i++) {
    const h1 = heights[i];
    const h2 = heights[i + 1];
    const diff = Math.abs(h2 - h1);

    if (h2 > h1) {
      energy -= 2 * diff;
    } else if (h2 < h1) {
      energy += diff;
    }

    if (energy < 0) return false;
  }
  return true;
}

export function estimateUpperBound(heights: number[]): number {
  if (heights.length <= 1) return 0;
  let bound = 0;
  let sumUp = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    const diff = heights[i + 1] - heights[i];
    if (diff > 0) {
      sumUp += 2 * diff;
      bound = Math.max(bound, sumUp);
    } else {
      sumUp = Math.max(0, sumUp + diff);
    }
  }
  return bound + Math.max(...heights) * 2;
}
