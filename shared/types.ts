export interface BuildingData {
  heights: number[];
}

export type AlgorithmType = 
  | 'binary_search' 
  | 'simulated_annealing' 
  | 'dynamic_programming' 
  | 'greedy' 
  | 'brute_force';

export type AlgorithmCategory = 'exact' | 'heuristic';

export type AlertLevel = 'none' | 'warn' | 'danger';

export interface SolveRequest {
  heights: number[];
  algorithm: AlgorithmType;
}

export interface SolveResponse {
  algorithm: AlgorithmType;
  minInitialEnergy: number;
  energyTrace: number[];
  executionTimeMs: number;
  iterations: number;
  success: boolean;
  category?: AlgorithmCategory;
  deviationRate?: number;
  deviationAbsolute?: number;
  alertLevel?: AlertLevel;
  isGroundTruth?: boolean;
}

export interface CompareRequest {
  heights: number[];
  algorithms: AlgorithmType[];
}

export interface CompareResponse {
  results: SolveResponse[];
  groundTruth: {
    algorithm: AlgorithmType;
    minInitialEnergy: number;
  } | null;
  validation: {
    hasGroundTruth: boolean;
    totalAlgorithms: number;
    heuristicCount: number;
    alertedCount: number;
    maxDeviationRate: number;
  };
}

export type DistributionType = 'random' | 'increasing' | 'decreasing' | 'peak';

export interface GenerateRequest {
  count: number;
  minHeight: number;
  maxHeight: number;
  distribution: DistributionType;
  seed?: number;
}

export interface GenerateResponse {
  heights: number[];
  seed: number;
}

export const ALGORITHM_INFO: Record<AlgorithmType, { name: string; description: string; complexity: string; category: AlgorithmCategory }> = {
  binary_search: {
    name: '二分查找',
    description: '对初始能量空间进行二分，每次验证可行性',
    complexity: 'O(n·log H)',
    category: 'exact',
  },
  greedy: {
    name: '贪心算法',
    description: '从终点倒推每一步所需最小能量',
    complexity: 'O(n)',
    category: 'exact',
  },
  dynamic_programming: {
    name: '动态规划',
    description: '从终点递推每处最少保留能量',
    complexity: 'O(n)',
    category: 'exact',
  },
  simulated_annealing: {
    name: '模拟退火',
    description: '随机搜索+降温机制寻找近似最优解',
    complexity: 'O(k·n)',
    category: 'heuristic',
  },
  brute_force: {
    name: '暴力枚举',
    description: '从0开始逐个尝试直到找到可行解',
    complexity: 'O(n·H)',
    category: 'exact',
  },
};

export const GROUND_TRUTH_ALGORITHM: AlgorithmType = 'binary_search';

export const DEVIATION_WARN_THRESHOLD = 0.05;
export const DEVIATION_DANGER_THRESHOLD = 0.15;
