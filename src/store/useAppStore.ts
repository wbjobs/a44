import { create } from 'zustand';
import type { AlgorithmType, SolveResponse, DistributionType } from '@shared/types';

export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
}

interface AppState {
  heights: number[];
  selectedAlgorithms: AlgorithmType[];
  results: SolveResponse[];
  playback: PlaybackState;
  isComputing: boolean;
  selectedResultIndex: number;

  setHeights: (heights: number[]) => void;
  updateHeight: (index: number, value: number) => void;
  toggleAlgorithm: (algo: AlgorithmType) => void;
  setSelectedAlgorithms: (algos: AlgorithmType[]) => void;
  setResults: (results: SolveResponse[]) => void;
  setIsComputing: (val: boolean) => void;
  setSelectedResultIndex: (idx: number) => void;

  setPlayback: (p: Partial<PlaybackState>) => void;
  resetPlayback: () => void;
  stepPlayback: (delta: number) => void;
}

const DEFAULT_HEIGHTS = [14, 28, 19, 42, 35, 56, 23, 31, 67, 45, 38, 29];
const DEFAULT_ALGOS: AlgorithmType[] = ['binary_search', 'greedy', 'dynamic_programming'];

export const useAppStore = create<AppState>((set, get) => ({
  heights: DEFAULT_HEIGHTS,
  selectedAlgorithms: DEFAULT_ALGOS,
  results: [],
  playback: {
    isPlaying: false,
    currentStep: 0,
    speed: 1,
  },
  isComputing: false,
  selectedResultIndex: 0,

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

  setResults: (results) => set({ results, selectedResultIndex: 0 }),

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
