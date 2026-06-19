import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { DifficultyLevel } from '@shared/types';
import { DIFFICULTY_INFO } from '@shared/types';
import {
  Sparkles,
  Target,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  Mountain,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';

const DIFFICULTIES: { value: DifficultyLevel; label: string; icon: typeof Mountain }[] = [
  { value: 'easy', label: '简单', icon: TrendingUp },
  { value: 'medium', label: '中等', icon: Activity },
  { value: 'hard', label: '困难', icon: Mountain },
];

export function InverseGenerator() {
  const targetEnergy = useAppStore((s) => s.inverseTargetEnergy);
  const count = useAppStore((s) => s.inverseCount);
  const difficulty = useAppStore((s) => s.inverseDifficulty);
  const inverseResult = useAppStore((s) => s.inverseResult);
  const isGenerating = useAppStore((s) => s.isGeneratingInverse);
  const setTargetEnergy = useAppStore((s) => s.setInverseTargetEnergy);
  const setCount = useAppStore((s) => s.setInverseCount);
  const setDifficulty = useAppStore((s) => s.setInverseDifficulty);
  const setIsGenerating = useAppStore((s) => s.setIsGeneratingInverse);
  const applyInverseResult = useAppStore((s) => s.applyInverseResult);
  const setInverseResult = useAppStore((s) => s.setInverseResult);

  const [seedInput, setSeedInput] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setInverseResult(null);
    try {
      const seed = seedInput ? parseInt(seedInput) : undefined;
      const res = await fetch('/api/inverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEnergy,
          count,
          difficulty,
          seed,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        applyInverseResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (inverseResult) {
      applyInverseResult(inverseResult);
    }
  };

  const errorPct = inverseResult ? (inverseResult.errorRate * 100).toFixed(2) : '0';
  const errorIsLow = inverseResult && inverseResult.errorRate < 0.02;

  return (
    <div className="cyber-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-title mb-0">
          <Sparkles className="w-4 h-4 text-cyber-purple" />
          AI 逆推出题
        </div>
        {inverseResult && (
          <span className={`cyber-badge gap-1 text-[10px] ${
            errorIsLow ? 'cyber-badge-success' : 'cyber-badge-warn'
          }`}>
            {errorIsLow ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            误差 {errorPct}%
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyber-cyan" />
              目标最低能量
            </label>
            <span className="text-xs text-cyber-cyan font-mono font-bold">E₀ = {targetEnergy}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={1000}
              step={5}
              value={targetEnergy}
              onChange={(e) => setTargetEnergy(parseInt(e.target.value))}
              className="cyber-range flex-1"
            />
            <input
              type="number"
              value={targetEnergy}
              onChange={(e) => setTargetEnergy(parseInt(e.target.value) || 0)}
              className="cyber-input w-16 text-xs text-center"
              min={0}
              max={50000}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyber-purple" />
              建筑数量
            </label>
            <span className="text-xs text-cyber-purple font-mono font-bold">{count}</span>
          </div>
          <input
            type="range"
            min={3}
            max={60}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="cyber-range"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-mono block mb-1.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyber-yellow" />
            难度等级
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {DIFFICULTIES.map((d) => {
              const Icon = d.icon;
              const active = difficulty === d.value;
              const info = DIFFICULTY_INFO[d.value];
              return (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                    active
                      ? d.value === 'easy'
                        ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-300'
                        : d.value === 'medium'
                        ? 'bg-amber-500/15 border border-amber-500/50 text-amber-300'
                        : 'bg-rose-500/15 border border-rose-500/50 text-rose-300'
                      : 'bg-slate-800/60 border border-cyber-border/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                  title={info.description}
                >
                  <Icon className="w-4 h-4" />
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-mono block mb-1.5">
            随机种子 (可选)
          </label>
          <input
            type="number"
            placeholder="留空则随机"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            className="cyber-input text-xs"
          />
        </div>

        {inverseResult && (
          <div className="border border-cyber-border/60 rounded-lg p-2.5 bg-slate-900/50 space-y-1.5">
            <div className="text-[10px] text-slate-500 font-mono mb-1">生成结果统计</div>
            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
              <span className="text-slate-400">实际能量: <b className="text-cyber-cyan">{inverseResult.actualEnergy}</b></span>
              <span className="text-slate-400">峰数: <b className="text-cyber-purple">{inverseResult.terrainStats.peaks}</b></span>
              <span className="text-slate-400">谷数: <b className="text-cyber-purple">{inverseResult.terrainStats.valleys}</b></span>
              <span className="text-slate-400">危险区: <b className="text-cyber-yellow">{inverseResult.terrainStats.dangerZones}</b></span>
              <span className="text-slate-400">平均高度: <b className="text-slate-200">{inverseResult.terrainStats.avgHeight}</b></span>
              <span className="text-slate-400">方差: <b className="text-slate-200">{inverseResult.terrainStats.heightVariance}</b></span>
            </div>
            {inverseResult.seed !== undefined && (
              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-cyber-border/30">
                Seed: {inverseResult.seed}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="col-span-2 cyber-btn-primary cyber-btn flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? 'AI 生成中...' : 'AI 逆推生成'}
          </button>
          {inverseResult && (
            <button
              onClick={handleApply}
              className="col-span-2 cyber-btn flex items-center justify-center gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
              应用到当前数据集
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
