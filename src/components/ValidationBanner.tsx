import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { DEVIATION_WARN_THRESHOLD, DEVIATION_DANGER_THRESHOLD, ALGORITHM_INFO } from '@shared/types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  BrainCircuit,
  Crosshair,
  Info,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function ValidationBanner() {
  const validation = useAppStore((s) => s.validation);
  const groundTruth = useAppStore((s) => s.groundTruth);
  const results = useAppStore((s) => s.results);
  const [dismissed, setDismissed] = useState(false);

  if (!validation || !validation.hasGroundTruth || results.length === 0) {
    return null;
  }

  if (dismissed) return null;

  const alertedResults = results.filter(
    (r) => r.success && (r.alertLevel === 'warn' || r.alertLevel === 'danger')
  );

  const hasDanger = validation.maxDeviationRate >= DEVIATION_DANGER_THRESHOLD;
  const hasWarn =
    !hasDanger && validation.maxDeviationRate >= DEVIATION_WARN_THRESHOLD;
  const allGood = validation.heuristicCount === 0 || validation.alertedCount === 0;

  let bgGradient = '';
  let borderColor = '';
  let badge = null;
  let TitleIcon = null;
  let titleText = '';
  let subtitleText = '';

  if (hasDanger) {
    bgGradient =
      'bg-gradient-to-r from-red-500/18 via-red-500/10 to-transparent';
    borderColor = 'border-red-500/40';
    TitleIcon = AlertOctagon;
    titleText = '检测到严重算法偏差！';
    subtitleText = `启发式算法与精确解偏差超过 ${(
      DEVIATION_DANGER_THRESHOLD * 100
    ).toFixed(0)}%，建议谨慎使用`;
    badge = (
      <span
        className="cyber-badge gap-1.5"
        style={{
          background: 'rgba(248,113,113,0.2)',
          color: '#f87171',
          border: '1px solid rgba(248,113,113,0.5)',
        }}
      >
        <AlertOctagon className="w-3 h-3" /> DANGER
      </span>
    );
  } else if (hasWarn) {
    bgGradient =
      'bg-gradient-to-r from-yellow-500/18 via-yellow-500/10 to-transparent';
    borderColor = 'border-yellow-500/40';
    TitleIcon = AlertTriangle;
    titleText = '检测到轻微算法偏差';
    subtitleText = `启发式算法与精确解偏差在 ${(
      DEVIATION_WARN_THRESHOLD * 100
    ).toFixed(0)}% ~ ${(DEVIATION_DANGER_THRESHOLD * 100).toFixed(0)}% 之间`;
    badge = (
      <span className="cyber-badge cyber-badge-warn gap-1.5">
        <AlertTriangle className="w-3 h-3" /> WARNING
      </span>
    );
  } else {
    bgGradient =
      'bg-gradient-to-r from-emerald-500/14 via-emerald-500/08 to-transparent';
    borderColor = 'border-emerald-500/35';
    TitleIcon = ShieldCheck;
    titleText =
      validation.heuristicCount > 0
        ? '所有算法与精确解一致 ✨'
        : 'Ground Truth 精确解已就绪';
    subtitleText =
      validation.heuristicCount > 0
        ? `${validation.heuristicCount} 个启发式算法在容差范围内`
        : `基准解由 ${
            ALGORITHM_INFO[groundTruth?.algorithm ?? 'binary_search'].name
          } 提供`;
    badge = (
      <span className="cyber-badge cyber-badge-success gap-1.5">
        <ShieldCheck className="w-3 h-3" /> PASSED
      </span>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        className={`${bgGradient} ${borderColor} border rounded-xl px-4 py-3 backdrop-blur-sm relative overflow-hidden`}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              hasDanger
                ? 'bg-red-500/20'
                : hasWarn
                ? 'bg-yellow-500/20'
                : 'bg-emerald-500/20'
            }`}
          >
            <TitleIcon
              className={`w-5 h-5 ${
                hasDanger
                  ? 'text-red-400'
                  : hasWarn
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold font-display text-slate-100">
                {titleText}
              </h3>
              {badge}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {subtitleText}
            </p>

            <div className="mt-2.5 flex items-center gap-4 flex-wrap text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Crosshair className="w-3.5 h-3.5 text-cyber-cyan" />
                Ground Truth:
                <b className="text-cyber-cyan">
                  E₀ = {groundTruth?.minInitialEnergy}
                </b>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <BrainCircuit className="w-3.5 h-3.5 text-cyber-purple" />
                启发式算法:
                <b className="text-slate-200">{validation.heuristicCount}</b>
              </span>
              {validation.heuristicCount > 0 && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">
                    最大偏差率:{' '}
                    <b
                      className={
                        hasDanger
                          ? 'text-red-400'
                          : hasWarn
                          ? 'text-yellow-400'
                          : 'text-emerald-400'
                      }
                    >
                      {(validation.maxDeviationRate * 100).toFixed(
                        validation.maxDeviationRate < 0.01 ? 2 : 1
                      )}
                      %
                    </b>
                  </span>
                  <span className="text-slate-400">
                    异常:{' '}
                    <b className={validation.alertedCount > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
                      {validation.alertedCount}
                    </b>
                  </span>
                </>
              )}
            </div>

            {alertedResults.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {alertedResults.map((r) => (
                  <span
                    key={r.algorithm}
                    className={`cyber-badge gap-1 text-[10px] ${
                      r.alertLevel === 'danger'
                        ? ''
                        : 'cyber-badge-warn'
                    }`}
                    style={
                      r.alertLevel === 'danger'
                        ? {
                            background: 'rgba(248,113,113,0.18)',
                            color: '#f87171',
                            border: '1px solid rgba(248,113,113,0.5)',
                          }
                        : undefined
                    }
                  >
                    <Info className="w-2.5 h-2.5" />
                    {ALGORITHM_INFO[r.algorithm]?.name}:{' '}
                    <b>
                      {((r.deviationRate ?? 0) * 100).toFixed(1)}%
                    </b>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
