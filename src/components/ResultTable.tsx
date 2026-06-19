import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ALGORITHM_INFO, type AlgorithmType } from '@shared/types';
import {
  Binary,
  Flame,
  ArrowRightLeft,
  TrendingUp,
  Hammer,
  Clock,
  Activity,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

const ALGO_ICONS: Record<AlgorithmType, React.ComponentType<{ className?: string }>> = {
  binary_search: Binary,
  greedy: ArrowRightLeft,
  dynamic_programming: TrendingUp,
  simulated_annealing: Flame,
  brute_force: Hammer,
};

export function ResultTable() {
  const results = useAppStore((s) => s.results);
  const isComputing = useAppStore((s) => s.isComputing);
  const selectedAlgorithms = useAppStore((s) => s.selectedAlgorithms);
  const selectedIdx = useAppStore((s) => s.selectedResultIndex);
  const setSelectedIdx = useAppStore((s) => s.setSelectedResultIndex);

  const bestEnergy =
    results.length > 0
      ? Math.min(...results.filter((r) => r.success).map((r) => r.minInitialEnergy))
      : null;

  if (isComputing && results.length === 0) {
    return (
      <div className="cyber-panel p-4 flex items-center justify-center h-[220px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
          <span className="text-sm text-slate-400 font-mono">算法计算中...</span>
        </div>
      </div>
    );
  }

  if (selectedAlgorithms.length === 0) {
    return (
      <div className="cyber-panel p-4 flex items-center justify-center h-[220px]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="w-8 h-8 text-cyber-yellow/70" />
          <div>
            <div className="text-sm text-slate-300 font-semibold">请选择算法</div>
            <div className="text-xs text-slate-500 mt-1">在左侧面板中选择至少一种算法</div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="cyber-panel p-4 flex items-center justify-center h-[220px]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <Sparkles className="w-8 h-8 text-cyber-purple/70" />
          <div>
            <div className="text-sm text-slate-300 font-semibold">等待计算</div>
            <div className="text-xs text-slate-500 mt-1">点击"运行求解"按钮开始分析</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="section-title mb-0">
          <Trophy className="w-4 h-4 text-cyber-yellow" />
          算法结果对比
        </div>
        {bestEnergy !== null && (
          <span className="cyber-badge cyber-badge-success">
            最优解: E₀ = {bestEnergy}
          </span>
        )}
      </div>

      <div className="overflow-auto scrollbar-thin -mx-2 px-2">
        <table className="cyber-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th>算法</th>
              <th>最低初始能量</th>
              <th>
                <Clock className="w-3 h-3 inline mr-1" />
                耗时
              </th>
              <th>
                <Activity className="w-3 h-3 inline mr-1" />
                迭代
              </th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {results.map((r, idx) => {
                const info = ALGORITHM_INFO[r.algorithm];
                const Icon = ALGO_ICONS[r.algorithm];
                const isBest = r.success && r.minInitialEnergy === bestEnergy;
                const isSelected = idx === selectedIdx;

                return (
                  <motion.tr
                    key={r.algorithm}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => r.success && setSelectedIdx(idx)}
                    className={`${
                      isSelected
                        ? 'bg-cyber-cyan/10'
                        : ''
                    } ${
                      r.success ? 'cursor-pointer' : 'opacity-60'
                    } transition-colors`}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            isBest
                              ? 'bg-gradient-to-br from-cyber-yellow/30 to-cyber-green/30'
                              : 'bg-slate-800/60'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isBest ? 'text-cyber-yellow' : 'text-slate-400'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-200">
                              {info?.name}
                            </span>
                            {isBest && (
                              <Trophy className="w-3.5 h-3.5 text-cyber-yellow" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {info?.complexity}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <motion.span
                        key={r.minInitialEnergy}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className={`number-roll text-lg font-bold ${
                          isBest ? 'text-cyber-green' : 'text-cyber-cyan'
                        }`}
                      >
                        {r.success ? r.minInitialEnergy : '-'}
                      </motion.span>
                    </td>
                    <td className="font-mono text-[11px] text-slate-400">
                      {r.executionTimeMs < 1
                        ? `${(r.executionTimeMs * 1000).toFixed(0)}µs`
                        : `${r.executionTimeMs.toFixed(2)}ms`}
                    </td>
                    <td className="font-mono text-[11px] text-slate-400">
                      {r.iterations.toLocaleString()}
                    </td>
                    <td>
                      {r.success ? (
                        <span className="cyber-badge cyber-badge-success gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          成功
                        </span>
                      ) : (
                        <span className="cyber-badge" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)' }}>
                          <AlertCircle className="w-3 h-3" />
                          失败
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
