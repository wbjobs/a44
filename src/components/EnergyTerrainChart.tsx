import { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Mountain, Layers, Zap, Target, Activity } from 'lucide-react';

const TERRAIN_PADDING = { top: 30, right: 24, bottom: 36, left: 44 };
const PERSPECTIVE = 0.15;

export function EnergyTerrainChart() {
  const heights = useAppStore((s) => s.heights);
  const playbackStep = useAppStore((s) => s.playback.currentStep);
  const results = useAppStore((s) => s.results);
  const selectedResultIdx = useAppStore((s) => s.selectedResultIndex);
  const inverseResult = useAppStore((s) => s.inverseResult);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 380 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const minEnergyPerBuilding = useMemo(() => {
    if (inverseResult?.minEnergyPerBuilding &&
        inverseResult.minEnergyPerBuilding.length === heights.length) {
      return inverseResult.minEnergyPerBuilding;
    }
    if (results[selectedResultIdx]?.energyTrace) {
      return null;
    }
    return computeMinEnergyLocal(heights);
  }, [heights, inverseResult, results, selectedResultIdx]);

  const trace = results[selectedResultIdx]?.energyTrace;

  const innerWidth = containerSize.width - TERRAIN_PADDING.left - TERRAIN_PADDING.right;
  const innerHeight = containerSize.height - TERRAIN_PADDING.top - TERRAIN_PADDING.bottom;

  const maxEnergy = useMemo(() => {
    if (minEnergyPerBuilding) {
      const maxMin = Math.max(...minEnergyPerBuilding);
      return Math.max(10, Math.ceil(maxMin * 1.8));
    }
    if (trace) {
      return Math.max(10, Math.ceil(Math.max(...trace) * 1.2));
    }
    return Math.max(...heights) * 2;
  }, [minEnergyPerBuilding, trace, heights]);

  const barGap = Math.min(8, Math.max(1, innerWidth / heights.length * 0.08));
  const barWidth = (innerWidth - barGap * (heights.length - 1)) / heights.length;

  const scaleX = (i: number) => TERRAIN_PADDING.left + i * (barWidth + barGap) + barWidth / 2;
  const scaleY = (e: number) => TERRAIN_PADDING.top + innerHeight - (e / maxEnergy) * innerHeight;

  const perspectiveOffset = (y: number) => {
    const relY = (y - TERRAIN_PADDING.top) / innerHeight;
    return relY * PERSPECTIVE * innerWidth * 0.5;
  };

  const terrainPath = useMemo(() => {
    if (!minEnergyPerBuilding || minEnergyPerBuilding.length === 0) return '';

    const points: string[] = [];
    for (let i = 0; i < heights.length; i++) {
      const x = scaleX(i);
      const y = scaleY(minEnergyPerBuilding[i]);
      const offset = perspectiveOffset(y);
      points.push(`${x + offset},${y}`);
    }

    const bottomLeft = scaleX(0) + perspectiveOffset(scaleY(0));
    const bottomRight = scaleX(heights.length - 1) + perspectiveOffset(scaleY(0));

    return `M ${bottomLeft},${scaleY(0)} L ${points.join(' L ')} L ${bottomRight},${scaleY(0)} Z`;
  }, [heights.length, minEnergyPerBuilding, innerWidth, innerHeight, maxEnergy]);

  const terrainTopLine = useMemo(() => {
    if (!minEnergyPerBuilding || minEnergyPerBuilding.length === 0) return '';

    const points: string[] = [];
    for (let i = 0; i < heights.length; i++) {
      const x = scaleX(i);
      const y = scaleY(minEnergyPerBuilding[i]);
      const offset = perspectiveOffset(y);
      points.push(`${x + offset},${y}`);
    }
    return `M ${points.join(' L ')}`;
  }, [heights.length, minEnergyPerBuilding, innerWidth, innerHeight, maxEnergy]);

  const contourLevels = useMemo(() => {
    const levels: number[] = [];
    const n = 5;
    for (let i = 1; i <= n; i++) {
      levels.push((maxEnergy * i) / (n + 1));
    }
    return levels;
  }, [maxEnergy]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [0];
    const step = Math.ceil(maxEnergy / 5);
    for (let e = step; e <= maxEnergy; e += step) {
      ticks.push(e);
    }
    return ticks;
  }, [maxEnergy]);

  const currentBuildingIdx = Math.min(heights.length - 1, Math.max(0, playbackStep));
  const currentEnergy = trace ? trace[playbackStep] : undefined;

  return (
    <div className="cyber-panel h-full flex flex-col">
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="section-title mb-0">
          <Mountain className="w-4 h-4 text-cyber-purple" />
          能量地形图
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="cyber-badge gap-1 text-[10px]">
            <Layers className="w-3 h-3 text-cyber-cyan" />
            {heights.length} 栋
          </span>
          <span className="cyber-badge gap-1 text-[10px]">
            <Zap className="w-3 h-3 text-cyber-yellow" />
            最高 E={Math.round(maxEnergy)}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 min-h-[300px] mt-1">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="dangerGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="safeGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="terrainTopGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>

            <filter id="terrainGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <pattern id="terrainGrid" width="50" height="30" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 30" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
            </pattern>

            <linearGradient id="buildingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <rect
            x={TERRAIN_PADDING.left}
            y={TERRAIN_PADDING.top}
            width={innerWidth}
            height={innerHeight}
            fill="url(#safeGradient)"
            rx="6"
          />
          <rect
            x={TERRAIN_PADDING.left}
            y={TERRAIN_PADDING.top}
            width={innerWidth}
            height={innerHeight}
            fill="url(#terrainGrid)"
            rx="6"
          />

          {yTicks.map((e) => {
            const y = scaleY(e);
            return (
              <g key={e}>
                <line
                  x1={TERRAIN_PADDING.left}
                  y1={y}
                  x2={TERRAIN_PADDING.left + innerWidth}
                  y2={y}
                  stroke="rgba(148,163,184,0.08)"
                  strokeDasharray="2 4"
                />
                <text
                  x={TERRAIN_PADDING.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(148,163,184,0.5)"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {e}
                </text>
              </g>
            );
          })}

          {minEnergyPerBuilding && (
            <>
              <path
                d={terrainPath}
                fill="url(#dangerGradient)"
                opacity="0.9"
              />

              {contourLevels.map((level, idx) => {
                const y = scaleY(level);
                const offset = perspectiveOffset(y);
                const alpha = 0.06 + (idx / contourLevels.length) * 0.08;
                return (
                  <line
                    key={level}
                    x1={TERRAIN_PADDING.left + offset}
                    y1={y}
                    x2={TERRAIN_PADDING.left + innerWidth - offset}
                    y2={y}
                    stroke={`rgba(251,191,36,${alpha})`}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              <path
                d={terrainTopLine}
                stroke="url(#terrainTopGradient)"
                strokeWidth="2.5"
                fill="none"
                filter="url(#terrainGlow)"
              />

              {minEnergyPerBuilding.map((e, i) => {
                const x = scaleX(i);
                const y = scaleY(e);
                const offset = perspectiveOffset(y);
                const isMin = e === Math.min(...minEnergyPerBuilding.filter((v) => v > 0));
                return (
                  <g key={`dp-${i}`}>
                    <circle
                      cx={x + offset}
                      cy={y}
                      r={isMin ? 4 : 2}
                      fill={isMin ? '#f97316' : '#a78bfa'}
                      opacity={i % 2 === 0 || isMin ? 0.9 : 0.5}
                    />
                  </g>
                );
              })}
            </>
          )}

          {heights.map((h, i) => {
            const x = scaleX(i) - barWidth / 2;
            const y = scaleY(0);
            const buildingHeight = Math.min(innerHeight * 0.3, (h / Math.max(...heights)) * innerHeight * 0.3);
            const isCurrent = i === currentBuildingIdx;
            const isPassed = i < currentBuildingIdx;

            return (
              <g key={`bld-${i}`}>
                <rect
                  x={x}
                  y={y - buildingHeight}
                  width={barWidth}
                  height={buildingHeight}
                  rx="2"
                  fill={isCurrent
                    ? 'url(#buildingGradient)'
                    : isPassed
                    ? 'rgba(52,211,153,0.3)'
                    : 'rgba(34,211,238,0.2)'}
                  stroke={isCurrent
                    ? '#a78bfa'
                    : isPassed
                    ? 'rgba(52,211,153,0.5)'
                    : 'rgba(34,211,238,0.3)'}
                  strokeWidth="1"
                />
                {isCurrent && (
                  <line
                    x1={scaleX(i)}
                    y1={y - buildingHeight - 4}
                    x2={scaleX(i)}
                    y2={TERRAIN_PADDING.top + 4}
                    stroke="rgba(167,139,250,0.3)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                )}
              </g>
            );
          })}

          {trace && trace.length > 0 && (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              d={`M ${trace.map((e, i) => {
                const x = scaleX(i);
                const y = scaleY(e);
                const offset = perspectiveOffset(y);
                return `${x + offset},${y}`;
              }).join(' L ')}`}
              stroke="#22d3ee"
              strokeWidth="2"
              fill="none"
              filter="url(#terrainGlow)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {currentEnergy !== undefined && (
            <g>
              <motion.circle
                cx={scaleX(currentBuildingIdx) + perspectiveOffset(scaleY(currentEnergy))}
                cy={scaleY(currentEnergy)}
                r="5"
                fill="#a78bfa"
                filter="url(#terrainGlow)"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.3 }}
              />
              <circle
                cx={scaleX(currentBuildingIdx) + perspectiveOffset(scaleY(currentEnergy))}
                cy={scaleY(currentEnergy)}
                r="2.5"
                fill="white"
              />
            </g>
          )}

          <line
            x1={TERRAIN_PADDING.left}
            y1={scaleY(0)}
            x2={TERRAIN_PADDING.left + innerWidth}
            y2={scaleY(0)}
            stroke="rgba(34,211,238,0.3)"
            strokeWidth="1.5"
          />

          <text
            x={TERRAIN_PADDING.left - 12}
            y={TERRAIN_PADDING.top + innerHeight / 2}
            textAnchor="middle"
            fill="rgba(148,163,184,0.5)"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
            transform={`rotate(-90, ${TERRAIN_PADDING.left - 12}, ${TERRAIN_PADDING.top + innerHeight / 2})`}
          >
            能量 E
          </text>

          <text
            x={TERRAIN_PADDING.left + innerWidth / 2}
            y={containerSize.height - 10}
            textAnchor="middle"
            fill="rgba(148,163,184,0.5)"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            建筑位置 (0 → {heights.length - 1})
          </text>
        </svg>
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-cyber-border/50">
        <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-red-500/50 to-yellow-500/20"></span>
            危险区 (能量不足)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-8 h-0.5 bg-gradient-to-r from-transparent via-cyber-purple to-transparent"></span>
            临界能量线
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-8 h-0.5 bg-cyber-cyan rounded-full"></span>
            能量轨迹
          </span>
        </div>
      </div>
    </div>
  );
}

function computeMinEnergyLocal(heights: number[]): number[] {
  const n = heights.length;
  const dp: number[] = new Array(n);
  dp[n - 1] = 0;

  for (let i = n - 2; i >= 0; i--) {
    const h1 = heights[i];
    const h2 = heights[i + 1];
    const diff = Math.abs(h2 - h1);

    if (h2 > h1) {
      dp[i] = Math.max(0, dp[i + 1] + 2 * diff);
    } else if (h2 < h1) {
      dp[i] = Math.max(0, dp[i + 1] - diff);
    } else {
      dp[i] = dp[i + 1];
    }
  }

  return dp;
}
