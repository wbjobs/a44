import type {
  AlgorithmType,
  SolveResponse,
  CompareResponse,
  AlertLevel,
} from '@shared/types';
import {
  ALGORITHM_INFO,
  GROUND_TRUTH_ALGORITHM,
  DEVIATION_WARN_THRESHOLD,
  DEVIATION_DANGER_THRESHOLD,
} from '@shared/types';
import {
  BinarySearchSolver,
  GreedySolver,
  DynamicProgrammingSolver,
  SimulatedAnnealingSolver,
  BruteForceSolver,
  wrapTimed,
} from './algorithms';

function computeAlert(
  deviationRate: number
): AlertLevel {
  if (deviationRate >= DEVIATION_DANGER_THRESHOLD) return 'danger';
  if (deviationRate >= DEVIATION_WARN_THRESHOLD) return 'warn';
  return 'none';
}

export class AlgorithmService {
  private solvers: Map<AlgorithmType, any>;

  constructor() {
    this.solvers = new Map();
    this.solvers.set('binary_search', new BinarySearchSolver());
    this.solvers.set('greedy', new GreedySolver());
    this.solvers.set('dynamic_programming', new DynamicProgrammingSolver());
    this.solvers.set('simulated_annealing', new SimulatedAnnealingSolver());
    this.solvers.set('brute_force', new BruteForceSolver());
  }

  private runSolver(algo: AlgorithmType, heights: number[]): SolveResponse {
    const solver = this.solvers.get(algo);
    if (!solver) throw new Error(`Unknown algorithm: ${algo}`);
    const res = wrapTimed(solver, heights);
    res.category = ALGORITHM_INFO[algo].category;
    return res;
  }

  solve(heights: number[], algorithm: AlgorithmType): SolveResponse {
    const result = this.runSolver(algorithm, heights);

    try {
      const gtResult = this.runSolver(GROUND_TRUTH_ALGORITHM, heights);
      if (gtResult.success && result.success && gtResult.minInitialEnergy > 0) {
        const deviationAbs = Math.abs(
          result.minInitialEnergy - gtResult.minInitialEnergy
        );
        const deviationRate = deviationAbs / gtResult.minInitialEnergy;
        result.deviationAbsolute = deviationAbs;
        result.deviationRate = deviationRate;
        result.alertLevel = computeAlert(deviationRate);
        result.isGroundTruth = algorithm === GROUND_TRUTH_ALGORITHM;
      } else {
        result.alertLevel = 'none';
        result.isGroundTruth = algorithm === GROUND_TRUTH_ALGORITHM;
      }
    } catch {
      result.alertLevel = 'none';
      result.isGroundTruth = algorithm === GROUND_TRUTH_ALGORITHM;
    }

    return result;
  }

  compare(heights: number[], algorithms: AlgorithmType[]): CompareResponse {
    let groundTruthResult: SolveResponse | null = null;

    try {
      groundTruthResult = this.runSolver(GROUND_TRUTH_ALGORITHM, heights);
    } catch {
      groundTruthResult = null;
    }

    const results: SolveResponse[] = [];
    const seen = new Set<AlgorithmType>();

    for (const algo of algorithms) {
      if (seen.has(algo)) continue;
      seen.add(algo);

      let result: SolveResponse;
      try {
        if (algo === GROUND_TRUTH_ALGORITHM && groundTruthResult) {
          result = { ...groundTruthResult };
        } else {
          result = this.runSolver(algo, heights);
        }
      } catch (e) {
        result = {
          algorithm: algo,
          minInitialEnergy: -1,
          energyTrace: [],
          executionTimeMs: 0,
          iterations: 0,
          success: false,
          category: ALGORITHM_INFO[algo]?.category ?? 'heuristic',
          alertLevel: 'none',
        };
      }

      if (groundTruthResult && groundTruthResult.success && result.success) {
        const gt = groundTruthResult.minInitialEnergy;
        if (gt > 0) {
          const deviationAbs = Math.abs(result.minInitialEnergy - gt);
          const deviationRate = deviationAbs / gt;
          result.deviationAbsolute = deviationAbs;
          result.deviationRate = deviationRate;
          result.alertLevel = computeAlert(deviationRate);
        } else {
          result.deviationAbsolute = 0;
          result.deviationRate = 0;
          result.alertLevel = 'none';
        }
      } else {
        result.alertLevel = 'none';
      }

      result.isGroundTruth = algo === GROUND_TRUTH_ALGORITHM;
      results.push(result);
    }

    const heuristicResults = results.filter(
      (r) => r.category === 'heuristic' && r.success
    );
    const alertedCount = heuristicResults.filter(
      (r) => (r.alertLevel ?? 'none') !== 'none'
    ).length;
    const maxDeviationRate =
      heuristicResults.length > 0
        ? Math.max(...heuristicResults.map((r) => r.deviationRate ?? 0))
        : 0;

    return {
      results,
      groundTruth: groundTruthResult?.success
        ? {
            algorithm: groundTruthResult.algorithm,
            minInitialEnergy: groundTruthResult.minInitialEnergy,
          }
        : null,
      validation: {
        hasGroundTruth: !!groundTruthResult?.success,
        totalAlgorithms: results.length,
        heuristicCount: heuristicResults.length,
        alertedCount,
        maxDeviationRate,
      },
    };
  }
}

export const algorithmService = new AlgorithmService();
