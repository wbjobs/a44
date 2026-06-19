import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart as LineChartIcon, Thermometer, Zap } from 'lucide-react';

export function EnergyChart() {
  const results = useAppStore((s) => s.results);
  const selectedIdx = useAppStore((s) => s.selectedResultIndex);
  const playbackStep = useAppStore((s) => s.playback.currentStep);
  const heights = useAppStore((s) => s.heights);

  const result = results[selectedIdx];
  const trace = result?.energyTrace ?? [];

  const chartData = useMemo(() => {
    if (trace.length === 0) {
      return heights.map((h, i) => ({
        step: i,
        label: `#${i}`,
        building: h,
        energy: null as number | null,
      }));
    }
    return trace.map((e, i) => {
      const nextH = heights[i];
      return {
        step: i,
        label: i < heights.length ? `#${i}` : `终`,
        building: nextH ?? 0,
        energy: e,
        danger: e < Math.max(...heights) * 0.15 && e >= 0,
        critical: e < 0,
      };
    });
  }, [trace, heights]);

  const maxE = Math.max(...(trace.length > 0 ? trace : [1]));
  const minE = Math.min(0, ...(trace.length > 0 ? trace : [0]));

  const currentEnergy = trace[playbackStep];

  return (
    <div className="cyber-panel h-full flex flex-col">
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="section-title mb-0">
          <LineChartIcon className="w-4 h-4 text-cyber-green" />
          能量变化曲线
        </div>
        <AnimatePresence mode="wait">
          {currentEnergy !== undefined && (
            <motion.div
              key={currentEnergy}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                currentEnergy < 0
                  ? 'bg-cyber-red/10 border-cyber-red/40'
                  : currentEnergy < maxE * 0.2
                  ? 'bg-cyber-yellow/10 border-cyber-yellow/40'
                  : 'bg-cyber-green/10 border-cyber-green/40'
              }`}
            >
              <Zap
                className={`w-4 h-4 ${
                  currentEnergy < 0
                    ? 'text-cyber-red'
                    : currentEnergy < maxE * 0.2
                    ? 'text-cyber-yellow'
                    : 'text-cyber-green'
                }`}
              />
              <span className="font-mono font-bold text-sm">
                能量 = {currentEnergy}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-h-[220px] px-2 py-2">
        {chartData.length > 0 && trace.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.08)"
              />

              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(51,65,85,0.6)' }}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(51,65,85,0.6)' }}
                tickLine={false}
                domain={[Math.min(0, minE) - Math.abs(maxE) * 0.1, maxE * 1.15]}
              />

              <ReferenceLine
                y={0}
                stroke="#f87171"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: '0',
                  fill: '#f87171',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(34,211,238,0.4)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  boxShadow: '0 0 20px rgba(34,211,238,0.2)',
                }}
                itemStyle={{ color: '#e2e8f0' }}
                labelStyle={{ color: '#22d3ee', fontWeight: 600, marginBottom: 4 }}
                formatter={(value: any, name: string) => {
                  if (name === 'energy') return [value, '当前能量 E'];
                  if (name === 'building') return [value, '建筑高度'];
                  return [value, name];
                }}
              />

              <Area
                type="monotone"
                dataKey="energy"
                fill="url(#energyGrad)"
                stroke="none"
              />

              <Line
                type="monotone"
                dataKey="energy"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  if (!payload) return null;
                  const isCurrent = index === playbackStep;
                  const r = isCurrent ? 7 : payload.critical ? 4 : payload.danger ? 3.5 : 2.5;
                  const color = payload.critical
                    ? '#f87171'
                    : payload.danger
                    ? '#fbbf24'
                    : isCurrent
                    ? '#a78bfa'
                    : '#22d3ee';
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={color}
                      stroke={isCurrent ? '#fff' : color}
                      strokeWidth={isCurrent ? 2 : 1}
                      opacity={0.95}
                      style={{
                        filter: isCurrent
                          ? 'drop-shadow(0 0 8px rgba(167,139,250,0.8))'
                          : undefined,
                      }}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#a78bfa', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <Thermometer className="w-10 h-10 text-slate-600" />
            <div>
              <div className="text-sm text-slate-400 font-semibold">
                暂无能量数据
              </div>
              <div className="text-xs text-slate-600 mt-1">
                选择算法并运行求解以显示能量变化曲线
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-cyber-border/50 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-green" />
          能量充足
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-yellow" />
          能量偏低
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-red" />
          能量耗尽
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-3 h-3 rounded-full bg-cyber-purple" />
          当前位置
        </div>
      </div>
    </div>
  );
}
