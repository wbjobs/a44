import type { AlgorithmType, SolveResponse } from '@shared/types';
import { simulateJump, canReach, estimateUpperBound } from '../../utils/energySimulator';

export interface AlgorithmSolver {
  type: AlgorithmType;
  solve(heights: number[]): { minInitialEnergy: number; iterations: number; energyTrace: number[] };
}

export class BinarySearchSolver implements AlgorithmSolver {
  type: AlgorithmType = 'binary_search';

  solve(heights: number[]): { minInitialEnergy: number; iterations: number; energyTrace: number[] } {
    if (heights.length <= 1) {
      return { minInitialEnergy: 0, iterations: 1, energyTrace: [0] };
    }

    let iterations = 0;
    let low = 0;
    let high = estimateUpperBound(heights);

    while (low < high) {
      iterations++;
      const mid = Math.floor((low + high) / 2);
      if (canReach(heights, mid)) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    const sim = simulateJump(heights, low);
    return {
      minInitialEnergy: low,
      iterations,
      energyTrace: sim.energyTrace,
    };
  }
}

export class GreedySolver implements AlgorithmSolver {
  type: AlgorithmType = 'greedy';

  solve(heights: number[]): { minInitialEnergy: number; iterations: number; energyTrace: number[] } {
    if (heights.length <= 1) {
      return { minInitialEnergy: 0, iterations: 1, energyTrace: [0] };
    }

    const n = heights.length;
    let iterations = 0;
    let required = 0;

    for (let i = n - 2; i >= 0; i--) {
      iterations++;
      const h1 = heights[i];
      const h2 = heights[i + 1];
      const diff = Math.abs(h2 - h1);

      if (h2 > h1) {
        required = Math.max(0, required + 2 * diff);
      } else if (h2 < h1) {
        required = Math.max(0, required - diff);
      }
    }

    const minEnergy = required;
    const sim = simulateJump(heights, minEnergy);
    return {
      minInitialEnergy: minEnergy,
      iterations,
      energyTrace: sim.energyTrace,
    };
  }
}

export class DynamicProgrammingSolver implements AlgorithmSolver {
  type: AlgorithmType = 'dynamic_programming';

  solve(heights: number[]): { minInitialEnergy: number; iterations: number; energyTrace: number[] } {
    if (heights.length <= 1) {
      return { minInitialEnergy: 0, iterations: 1, energyTrace: [0] };
    }

    const n = heights.length;
    let iterations = 0;
    let dpNext = 0;

    for (let i = n - 2; i >= 0; i--) {
      iterations++;
      const h1 = heights[i];
      const h2 = heights[i + 1];
      const diff = Math.abs(h2 - h1);

      if (h2 > h1) {
        dpNext = Math.max(0, dpNext + 2 * diff);
      } else if (h2 < h1) {
        dpNext = Math.max(0, dpNext - diff);
      }
    }

    const sim = simulateJump(heights, dpNext);
    return {
      minInitialEnergy: dpNext,
      iterations,
      energyTrace: sim.energyTrace,
    };
  }
}

export class SimulatedAnnealingSolver implements AlgorithmSolver {
  type: AlgorithmType = 'simulated_annealing';

  solve(heights: number[]): { minInitialEnergy: number; iterations: number; energyTrace: number[] } {
    if (heights.length <= 1) {
      return { minInitialEnergy: 0, iterations: 1, energyTrace: [0] };
    }

    const upperBound = estimateUpperBound(heights);
    let currentEnergy = upperBound;
    let bestEnergy = upperBound;
    let iterations = 0;

    let temperature = upperBound;
    const coolingRate = 0.995;
    const minTemperature = 1e-6;

    while (temperature > minTemperature && iterations < 10000) {
      iterations++;

      const step = Math.max(1, Math.floor(temperature * Math.random()));
      let candidate = currentEnergy - step;
      if (candidate < 0) candidate = Math.floor(Math.random() * currentEnergy);

      const currentSim = simulateJump(heights, currentEnergy);
      const candidateSim = simulateJump(heights, candidate);

      const delta = candidate - currentEnergy;
      const improvement = (candidateSim.success ? 0 : 1) - (currentSim.success ? 0 : 1);

      if (improvement < 0 || (candidateSim.success && !currentSim.success)) {
        currentEnergy = candidate;
        if (candidateSim.success && candidate < bestEnergy) {
          bestEnergy = candidate;
        }
      } else if (Math.exp(-delta / temperature) > Math.random() && candidateSim.success) {
        currentEnergy = candidate;
      }

      temperature *= coolingRate;
    }

    const sim = simulateJump(heights, bestEnergy);
    return {
      minInitialEnergy: bestEnergy,
      iterations,
      energyTrace: sim.energyTrace,
    };
  }
}

export class BruteForceSolver implements AlgorithmSolver {
  type: AlgorithmType = 'brute_force';

  solve(heights: number[]): { minInitialEnergy: number; iterations: number; energyTrace: number[] } {
    if (heights.length <= 1) {
      return { minInitialEnergy: 0, iterations: 1, energyTrace: [0] };
    }

    const upperBound = estimateUpperBound(heights);
    let iterations = 0;

    for (let energy = 0; energy <= upperBound; energy++) {
      iterations++;
      if (canReach(heights, energy)) {
        const sim = simulateJump(heights, energy);
        return {
          minInitialEnergy: energy,
          iterations,
          energyTrace: sim.energyTrace,
        };
      }
    }

    const sim = simulateJump(heights, upperBound);
    return {
      minInitialEnergy: upperBound,
      iterations,
      energyTrace: sim.energyTrace,
    };
  }
}

export function wrapTimed(
  solver: AlgorithmSolver,
  heights: number[]
): SolveResponse {
  const startTime = performance.now();
  const result = solver.solve(heights);
  const executionTimeMs = performance.now() - startTime;

  return {
    algorithm: solver.type,
    minInitialEnergy: result.minInitialEnergy,
    energyTrace: result.energyTrace,
    executionTimeMs,
    iterations: result.iterations,
    success: true,
  };
}
