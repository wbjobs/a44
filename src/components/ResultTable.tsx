import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ALGORITHM_INFO, type AlgorithmType, type AlertLevel } from '@shared/types';
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
  Target,
  AlertTriangle,
  ShieldCheck,
  Crosshair,
  Brain,
} from 'lucide-react';

const ALGO_ICONS: Record<AlgorithmType, React.ComponentType<{ className?: string }>> = {
  binary_search: Binary,
  greedy: ArrowRightLeft,
  dynamic_programming: TrendingUp,
  simulated_annealing: Flame,
  brute_force: Hammer,
};

function AlertBadge({ level }: { level: AlertLevel }) {
  if (level === 'danger') {
    return (
      <span
        className="cyber-badge gap-1"
        style={{
          background: 'rgba(248,113,113,0.18)',
          color: '#f87171',
          border: '1px solid rgba(248,113,113,0.5)',
        }}
      >
        <AlertCircle className="w-3 h-3" />
        严重偏差
      </span>
    );
  }
  if (level === 'warn') {
    return (
      <span className="cyber-badge cyber-badge-warn gap-1">
        <AlertTriangle className="w-3 h-3" />
        轻微偏差
      </span>
    );
  }
  return (
    <span className="cyber-badge cyber-badge-success gap-1">
      <ShieldCheck className="w-3 h-3" />
      一致
    </span>
  );
}

function DeviationCell({
  rate,
  level,
}: {
  rate: number;
  level: AlertLevel;
}) {
  const color =
    level === 'danger'
      ? '#f87171'
      : level === 'warn'
      ? '#fbbf24'
      : '#34d399';
  const pct = (rate * 100).toFixed(rate < 0.01 ? 2 : 1);
  return (
    <div className="flex items-center gap-2">
      <div
        className="font-mono font-bold number-roll"
        style={{ color }}
      >
        {pct}%
      </div>
      <div className="flex-1 min-w-[60px] h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, rate * 300)}%`,
            background:
              level === 'danger'
                ? 'linear-gradient(90deg,#ef4444,#f87171)'
                : level === 'warn'
                ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                : 'linear-gradient(90deg,#059669,#34d399)',
          }}
        />
      </div>
    </div>
  );
}

export function ResultTable() {
  const results = useAppStore((s) => s.results);
  const groundTruth = useAppStore((s) => s.groundTruth);
  const isComputing = useAppStore((s) => s.isComputing);
  const selectedAlgorithms = useAppStore((s) => s.selectedAlgorithms);
  const selectedIdx = useAppStore((s) => s.selectedResultIndex);
  const setSelectedIdx = useAppStore((s) => s.setSelectedResultIndex);

  const bestEnergy =
    results.length > 0
      ? Math.min(
          ...results.filter((r) => r.success).map((r) => r.minInitialEnergy)
        )
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
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="section-title mb-0">
          <Trophy className="w-4 h-4 text-cyber-yellow" />
          算法结果对比 & AI 校验
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {groundTruth && (
            <span className="cyber-badge cyber-badge-info gap-1.5">
              <Crosshair className="w-3 h-3" />
              Ground Truth: E₀ = <b>{groundTruth.minInitialEnergy}</b>
              <span className="opacity-70 text-[10px]">
                ({ALGORITHM_INFO[groundTruth.algorithm].name})
              </span>
            </span>
          )}
          {bestEnergy !== null && (
            <span className="cyber-badge cyber-badge-success">
              最优解: E₀ = {bestEnergy}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-auto scrollbar-thin -mx-2 px-2">
        <table className="cyber-table w-full text-left border-collapse">
          <thead>
            <tr>
              <th>算法</th>
              <th>类别</th>
              <th>最低初始能量</th>
              <th>
                <Brain className="w-3 h-3 inline mr-1" />
                偏差率
              </th>
              <th>
                <Clock className="w-3 h-3 inline mr-1" />
                耗时
              </th>
              <th>
                <Activity className="w-3 h-3 inline mr-1" />
                迭代
              </th>
              <th>校验状态</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {results.map((r, idx) => {
                const info = ALGORITHM_INFO[r.algorithm];
                const Icon = ALGO_ICONS[r.algorithm];
                const isBest = r.success && r.minInitialEnergy === bestEnergy;
                const isSelected = idx === selectedIdx;
                const isGT = r.isGroundTruth;
                const alertLevel: AlertLevel = r.alertLevel ?? 'none';

                let rowBg = '';
                if (alertLevel === 'danger') rowBg = 'bg-red-500/10';
                else if (alertLevel === 'warn') rowBg = 'bg-yellow-500/8';
                else if (isSelected) rowBg = 'bg-cyber-cyan/10';

                return (
                  <motion.tr
                    key={r.algorithm}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => r.success && setSelectedIdx(idx)}
                    className={`${rowBg} ${
                      r.success ? 'cursor-pointer' : 'opacity-60'
                    } transition-colors`}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            isGT
                              ? 'bg-gradient-to-br from-cyber-cyan/35 to-cyber-purple/35 ring-1 ring-cyber-cyan/50'
                              : isBest
                              ? 'bg-gradient-to-br from-cyber-yellow/30 to-cyber-green/30'
                              : 'bg-slate-800/60'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isGT
                                ? 'text-cyber-cyan'
                                : isBest
                                ? 'text-cyber-yellow'
                                : 'text-slate-400'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-200">
                              {info?.name}
                            </span>
                            {isGT && (
                              <Target
                                className="w-3.5 h-3.5 text-cyber-cyan"
                                strokeWidth={2.4}
                              />
                            )}
                            {isBest && !isGT && (
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
                      {info?.category === 'exact' ? (
                        <span
                          className="cyber-badge gap-1"
                          style={{
                            background: 'rgba(34,211,238,0.12)',
                            color: '#22d3ee',
                            border: '1px solid rgba(34,211,238,0.4)',
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          精确
                        </span>
                      ) : (
                        <span
                          className="cyber-badge gap-1"
                          style={{
                            background: 'rgba(167,139,250,0.12)',
                            color: '#a78bfa',
                            border: '1px solid rgba(167,139,250,0.45)',
                          }}
                        >
                          <Brain className="w-3 h-3" />
                          启发式
                        </span>
                      )}
                    </td>

                    <td>
                      <motion.span
                        key={r.minInitialEnergy}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className={`number-roll text-lg font-bold ${
                          isGT
                            ? 'text-cyber-cyan'
                            : isBest
                            ? 'text-cyber-green'
                            : 'text-slate-200'
                        }`}
                      >
                        {r.success ? r.minInitialEnergy : '-'}
                      </motion.span>
                      {r.success && r.deviationAbsolute !== undefined && r.deviationAbsolute > 0 && (
                        <span className="ml-1.5 text-[10px] font-mono text-slate-500">
                          (Δ +{r.deviationAbsolute})
                        </span>
                      )}
                    </td>

                    <td style={{ minWidth: 140 }}>
                      {r.success && r.deviationRate !== undefined ? (
                        r.category === 'exact' && r.deviationRate === 0 ? (
                          <span className="text-[11px] text-slate-500 font-mono italic">
                            精确算法
                          </span>
                        ) : (
                          <DeviationCell
                            rate={r.deviationRate}
                            level={alertLevel}
                          />
                        )
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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
                        <AlertBadge level={alertLevel} />
                      ) : (
                        <span
                          className="cyber-badge gap-1"
                          style={{
                            background: 'rgba(248,113,113,0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(248,113,113,0.4)',
                          }}
                        >
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

      <div className="mt-3 pt-3 border-t border-cyber-border/50 flex items-center gap-4 text-[11px] text-slate-500 font-mono flex-wrap">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-cyber-cyan" /> Ground Truth (二分查找)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyber-green" /> 偏差 {'<'} 5%
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyber-yellow" /> 偏差 5% ~ 15%
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyber-red" /> 偏差 ≥ 15% 告警
        </div>
      </div>
    </div>
  );
}
