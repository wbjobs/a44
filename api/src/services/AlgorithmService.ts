import type { AlgorithmType, SolveResponse, CompareResponse } from '@shared/types';
import {
  BinarySearchSolver,
  GreedySolver,
  DynamicProgrammingSolver,
  SimulatedAnnealingSolver,
  BruteForceSolver,
  wrapTimed,
} from './algorithms';

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

  solve(heights: number[], algorithm: AlgorithmType): SolveResponse {
    const solver = this.solvers.get(algorithm);
    if (!solver) {
      throw new Error(`Unknown algorithm: ${algorithm}`);
    }
    return wrapTimed(solver, heights);
  }

  compare(heights: number[], algorithms: AlgorithmType[]): CompareResponse {
    const results = algorithms.map((algo) => {
      try {
        return this.solve(heights, algo);
      } catch (e) {
        return {
          algorithm: algo,
          minInitialEnergy: -1,
          energyTrace: [],
          executionTimeMs: 0,
          iterations: 0,
          success: false,
        };
      }
    });

    return { results };
  }
}

export const algorithmService = new AlgorithmService();
