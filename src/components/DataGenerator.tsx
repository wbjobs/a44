import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { DistributionType } from '@shared/types';
import { Shuffle, RotateCcw, Copy, Download, Wand2 } from 'lucide-react';

const DISTRIBUTIONS: { value: DistributionType; label: string; desc: string }[] = [
  { value: 'random', label: '随机', desc: '均匀分布' },
  { value: 'increasing', label: '递增', desc: '整体上升' },
  { value: 'decreasing', label: '递减', desc: '整体下降' },
  { value: 'peak', label: '山峰', desc: '先升后降' },
];

export function DataGenerator() {
  const setHeights = useAppStore((s) => s.setHeights);
  const currentHeights = useAppStore((s) => s.heights);

  const [count, setCount] = useState(12);
  const [minH, setMinH] = useState(5);
  const [maxH, setMaxH] = useState(80);
  const [distribution, setDistribution] = useState<DistributionType>('random');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count,
          minHeight: minH,
          maxHeight: maxH,
          distribution,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHeights(data.heights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHeights([14, 28, 19, 42, 35, 56, 23, 31, 67, 45, 38, 29]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentHeights));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ heights: currentHeights }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heights_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cyber-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-title mb-0">
          <Wand2 className="w-4 h-4 text-cyber-yellow" />
          数据生成器
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-400 font-mono">建筑数量</label>
            <span className="text-xs text-cyber-cyan font-mono font-bold">{count}</span>
          </div>
          <input
            type="range"
            min={3}
            max={40}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="cyber-range"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">最矮高度</label>
            <input
              type="number"
              min={1}
              max={maxH - 1}
              value={minH}
              onChange={(e) => setMinH(Math.max(1, parseInt(e.target.value) || 1))}
              className="cyber-input"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">最高高度</label>
            <input
              type="number"
              min={minH + 1}
              max={10000}
              value={maxH}
              onChange={(e) => setMaxH(Math.max(minH + 1, parseInt(e.target.value) || 100))}
              className="cyber-input"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-mono block mb-1.5">分布类型</label>
          <div className="grid grid-cols-4 gap-1.5">
            {DISTRIBUTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDistribution(d.value)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  distribution === d.value
                    ? 'bg-gradient-to-r from-cyber-cyan/25 to-cyber-purple/25 border border-cyber-cyan/50 text-white'
                    : 'bg-slate-800/60 border border-cyber-border/60 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="cyber-btn-primary cyber-btn flex items-center justify-center gap-1.5"
          >
            <Shuffle className="w-4 h-4" />
            {loading ? '生成中...' : '生成数据'}
          </button>
          <button
            onClick={handleReset}
            className="cyber-btn flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            重置示例
          </button>
          <button
            onClick={handleCopy}
            className="cyber-btn flex items-center justify-center gap-1.5 text-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            复制数组
          </button>
          <button
            onClick={handleExport}
            className="cyber-btn flex items-center justify-center gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            导出JSON
          </button>
        </div>
      </div>
    </div>
  );
}
