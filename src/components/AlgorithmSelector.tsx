import { useAppStore } from '@/store/useAppStore';
import { ALGORITHM_INFO, type AlgorithmType } from '@shared/types';
import {
  Binary,
  Flame,
  ArrowRightLeft,
  TrendingUp,
  Hammer,
  Check,
  Info,
} from 'lucide-react';

const ALGO_ICONS: Record<AlgorithmType, React.ComponentType<{ className?: string }>> = {
  binary_search: Binary,
  greedy: ArrowRightLeft,
  dynamic_programming: TrendingUp,
  simulated_annealing: Flame,
  brute_force: Hammer,
};

export function AlgorithmSelector() {
  const selected = useAppStore((s) => s.selectedAlgorithms);
  const toggle = useAppStore((s) => s.toggleAlgorithm);

  const algos = Object.entries(ALGORITHM_INFO) as [AlgorithmType, typeof ALGORITHM_INFO[AlgorithmType]][];

  return (
    <div className="cyber-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-title mb-0">
          <Binary className="w-4 h-4 text-cyber-purple" />
          算法选择
        </div>
        <span className="cyber-badge cyber-badge-info text-[10px]">
          已选 {selected.length}/{algos.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {algos.map(([key, info]) => {
          const Icon = ALGO_ICONS[key];
          const isSelected = selected.includes(key);

          return (
            <div
              key={key}
              className={`cyber-algo-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggle(key)}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30'
                      : 'bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-cyber-cyan' : 'text-slate-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {info.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-cyber-green flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-cyber-cyan/80 font-mono">
                      {info.complexity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-2.5 rounded-lg bg-slate-900/50 border border-cyber-border/60">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-cyber-cyan/70 mt-0.5 flex-shrink-0" />
          <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
            <p className="text-cyber-cyan/80 font-semibold mb-1">能量规则:</p>
            <p>
              上跳 H: E = E - 2×ΔH<br />
              下跳 ↓: E = E + ΔH<br />
              能量不能为负，找最小 E₀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
