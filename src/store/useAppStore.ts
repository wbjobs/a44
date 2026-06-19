import { create } from 'zustand';
import type { AlgorithmType, SolveResponse, DistributionType, CompareResponse, InverseGenerateResponse, DifficultyLevel } from '@shared/types';

export type GroundTruth = CompareResponse['groundTruth'];
export type Validation = CompareResponse['validation'];

export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
}

interface AppState {
  heights: number[];
  selectedAlgorithms: AlgorithmType[];
  results: SolveResponse[];
  groundTruth: GroundTruth;
  validation: Validation | null;
  playback: PlaybackState;
  isComputing: boolean;
  selectedResultIndex: number;

  inverseResult: InverseGenerateResponse | null;
  inverseTargetEnergy: number;
  inverseCount: number;
  inverseDifficulty: DifficultyLevel;
  isGeneratingInverse: boolean;

  setHeights: (heights: number[]) => void;
  updateHeight: (index: number, value: number) => void;
  toggleAlgorithm: (algo: AlgorithmType) => void;
  setSelectedAlgorithms: (algos: AlgorithmType[]) => void;
  setCompareResult: (resp: CompareResponse) => void;
  setIsComputing: (val: boolean) => void;
  setSelectedResultIndex: (idx: number) => void;

  setInverseTargetEnergy: (val: number) => void;
  setInverseCount: (val: number) => void;
  setInverseDifficulty: (val: DifficultyLevel) => void;
  setInverseResult: (res: InverseGenerateResponse | null) => void;
  setIsGeneratingInverse: (val: boolean) => void;
  applyInverseResult: (res: InverseGenerateResponse) => void;

  setPlayback: (p: Partial<PlaybackState>) => void;
  resetPlayback: () => void;
  stepPlayback: (delta: number) => void;
}

const DEFAULT_HEIGHTS = [14, 28, 19, 42, 35, 56, 23, 31, 67, 45, 38, 29];
const DEFAULT_ALGOS: AlgorithmType[] = ['binary_search', 'greedy', 'dynamic_programming', 'simulated_annealing'];

export const useAppStore = create<AppState>((set, get) => ({
  heights: DEFAULT_HEIGHTS,
  selectedAlgorithms: DEFAULT_ALGOS,
  results: [],
  groundTruth: null,
  validation: null,
  playback: {
    isPlaying: false,
    currentStep: 0,
    speed: 1,
  },
  isComputing: false,
  selectedResultIndex: 0,

  inverseResult: null,
  inverseTargetEnergy: 100,
  inverseCount: 12,
  inverseDifficulty: 'medium',
  isGeneratingInverse: false,

  setHeights: (heights) => {
    set({ heights, playback: { ...get().playback, currentStep: 0, isPlaying: false } });
  },

  updateHeight: (index, value) => {
    const newHeights = [...get().heights];
    if (index >= 0 && index < newHeights.length) {
      newHeights[index] = Math.max(1, value);
      set({
        heights: newHeights,
        playback: { ...get().playback, currentStep: 0, isPlaying: false },
      });
    }
  },

  toggleAlgorithm: (algo) => {
    const current = get().selectedAlgorithms;
    const next = current.includes(algo)
      ? current.filter((a) => a !== algo)
      : [...current, algo];
    set({ selectedAlgorithms: next });
  },

  setSelectedAlgorithms: (algos) => set({ selectedAlgorithms: algos }),

  setCompareResult: (resp) => {
    set({
      results: resp.results,
      groundTruth: resp.groundTruth,
      validation: resp.validation,
      selectedResultIndex: 0,
    });
  },

  setIsComputing: (val) => set({ isComputing: val }),

  setSelectedResultIndex: (idx) => set({ selectedResultIndex: idx }),

  setPlayback: (p) => {
    set({ playback: { ...get().playback, ...p } });
  },

  resetPlayback: () => {
    set({ playback: { ...get().playback, currentStep: 0, isPlaying: false } });
  },

  stepPlayback: (delta) => {
    const current = get().playback.currentStep;
    const traceLen =
      get().results[get().selectedResultIndex]?.energyTrace.length ??
      get().heights.length;
    const maxStep = Math.max(0, traceLen - 1);
    const nextStep = Math.min(maxStep, Math.max(0, current + delta));
    set({ playback: { ...get().playback, currentStep: nextStep } });
  },

  setInverseTargetEnergy: (val) => set({ inverseTargetEnergy: Math.max(0, val) }),
  setInverseCount: (val) => set({ inverseCount: Math.max(2, Math.min(500, val)) }),
  setInverseDifficulty: (val) => set({ inverseDifficulty: val }),
  setInverseResult: (res) => set({ inverseResult: res }),
  setIsGeneratingInverse: (val) => set({ isGeneratingInverse: val }),
  applyInverseResult: (res) => {
    set({
      heights: res.heights,
      inverseResult: res,
      playback: { ...get().playback, currentStep: 0, isPlaying: false },
    });
  },
}));

export function generateDataPayload(
  count: number,
  minHeight: number,
  maxHeight: number,
  distribution: DistributionType,
  seed?: number
) {
  return { count, minHeight, maxHeight, distribution, seed };
}
