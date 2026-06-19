import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { CompareResponse } from '@shared/types';

export function useSolver() {
  const heights = useAppStore((s) => s.heights);
  const selectedAlgorithms = useAppStore((s) => s.selectedAlgorithms);
  const setCompareResult = useAppStore((s) => s.setCompareResult);
  const setIsComputing = useAppStore((s) => s.setIsComputing);
  const resetPlayback = useAppStore((s) => s.resetPlayback);

  const debounceRef = useRef<number | null>(null);

  const runSolve = useCallback(async () => {
    if (selectedAlgorithms.length === 0) {
      setCompareResult({
        results: [],
        groundTruth: null,
        validation: {
          hasGroundTruth: false,
          totalAlgorithms: 0,
          heuristicCount: 0,
          alertedCount: 0,
          maxDeviationRate: 0,
        },
      });
      return;
    }

    setIsComputing(true);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heights,
          algorithms: selectedAlgorithms,
        }),
      });

      if (res.ok) {
        const data: CompareResponse = await res.json();
        setCompareResult(data);
        resetPlayback();
      }
    } catch (e) {
      console.error('Solve failed:', e);
    } finally {
      setIsComputing(false);
    }
  }, [
    heights,
    selectedAlgorithms,
    setCompareResult,
    setIsComputing,
    resetPlayback,
  ]);

  useEffect(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }
    if (selectedAlgorithms.length === 0) {
      setCompareResult({
        results: [],
        groundTruth: null,
        validation: {
          hasGroundTruth: false,
          totalAlgorithms: 0,
          heuristicCount: 0,
          alertedCount: 0,
          maxDeviationRate: 0,
        },
      });
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      runSolve();
    }, 250);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [heights, selectedAlgorithms, runSolve, setCompareResult]);

  return { runSolve };
}
