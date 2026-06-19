import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Bot, Flag, GripVertical, Zap } from 'lucide-react';

const CHART_PADDING = { top: 50, right: 20, bottom: 40, left: 20 };
const DRAG_HANDLE_HEIGHT = 18;

export function BuildingChart() {
  const heights = useAppStore((s) => s.heights);
  const updateHeight = useAppStore((s) => s.updateHeight);
  const playbackStep = useAppStore((s) => s.playback.currentStep);
  const isPlaying = useAppStore((s) => s.playback.isPlaying);
  const results = useAppStore((s) => s.results);
  const selectedResultIdx = useAppStore((s) => s.selectedResultIndex);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 360 });
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const dragStartRef = useRef<{ y: number; value: number } | null>(null);

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

  const maxH = Math.max(...heights, 1);
  const innerWidth = containerSize.width - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = containerSize.height - CHART_PADDING.top - CHART_PADDING.bottom;
  const barGap = Math.min(10, Math.max(2, innerWidth / heights.length * 0.12));
  const barWidth = (innerWidth - barGap * (heights.length - 1)) / heights.length;

  const scaleY = (h: number) => (h / maxH) * innerHeight;

  const getBarX = (i: number) => CHART_PADDING.left + i * (barWidth + barGap);
  const getBarY = (h: number) => CHART_PADDING.top + innerHeight - scaleY(h);

  const currentBuildingIdx = Math.min(
    heights.length - 1,
    Math.max(0, playbackStep)
  );

  const trace = results[selectedResultIdx]?.energyTrace;
  const currentEnergy = trace ? trace[playbackStep] : undefined;

  const handlePointerDown = useCallback(
    (i: number) => (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDraggingIdx(i);
      dragStartRef.current = {
        y: e.clientY,
        value: heights[i],
      };
    },
    [heights]
  );

  const handlePointerMove = useCallback(
    (i: number) => (e: React.PointerEvent) => {
      if (draggingIdx !== i || !dragStartRef.current) return;
      const dy = dragStartRef.current.y - e.clientY;
      const perPixel = maxH / innerHeight;
      const newValue = Math.round(
        Math.max(1, dragStartRef.current.value + dy * perPixel * 0.8)
      );
      updateHeight(i, Math.min(newValue, 9999));
    },
    [draggingIdx, updateHeight, maxH, innerHeight]
  );

  const handlePointerUp = useCallback(
    (i: number) => (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingIdx(null);
      dragStartRef.current = null;
    },
    []
  );

  const robotX = containerSize.width > 0 ? getBarX(currentBuildingIdx) + barWidth / 2 : 0;
  const robotY =
    containerSize.height > 0
      ? getBarY(heights[currentBuildingIdx]) - 34
      : 0;

  return (
    <div className="cyber-panel h-full flex flex-col">
      <div className="px-4 pt-4 flex items-center justify-between">
        <div className="section-title mb-0">
          <Zap className="w-4 h-4 text-cyber-cyan" />
          建筑群可视化
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="cyber-badge cyber-badge-info">建筑数: {heights.length}</span>
          <span className="cyber-badge cyber-badge-warn">最高: {maxH}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[280px] mt-2"
        style={{ touchAction: 'none' }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0891b2" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#164e63" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect
            x={CHART_PADDING.left}
            y={CHART_PADDING.top}
            width={innerWidth}
            height={innerHeight}
            fill="url(#gridPattern)"
            rx="6"
          />

          <line
            x1={CHART_PADDING.left}
            y1={CHART_PADDING.top + innerHeight}
            x2={CHART_PADDING.left + innerWidth}
            y2={CHART_PADDING.top + innerHeight}
            stroke="rgba(34,211,238,0.3)"
            strokeWidth="2"
          />

          {heights.map((h, i) => {
            const x = getBarX(i);
            const y = getBarY(h);
            const scaledH = scaleY(h);
            const isCurrent = i === currentBuildingIdx;
            const isPassed = i < currentBuildingIdx;

            return (
              <g key={i}>
                <motion.rect
                  initial={{ opacity: 0, y: CHART_PADDING.top + innerHeight }}
                  animate={{ opacity: 1, y }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={scaledH}
                  rx="4"
                  fill={isCurrent ? 'url(#barGradientActive)' : isPassed ? 'rgba(52,211,153,0.35)' : 'url(#barGradient)'}
                  stroke={isCurrent ? '#a78bfa' : isPassed ? 'rgba(52,211,153,0.6)' : 'rgba(34,211,238,0.35)'}
                  strokeWidth={isCurrent ? 2 : 1}
                  filter={isCurrent ? 'url(#glow)' : undefined}
                  style={{ cursor: 'pointer' }}
                />

                <g
                  className="drag-handle"
                  onPointerDown={handlePointerDown(i)}
                  onPointerMove={handlePointerMove(i)}
                  onPointerUp={handlePointerUp(i)}
                  onPointerCancel={handlePointerUp(i)}
                >
                  <rect
                    x={x}
                    y={y - DRAG_HANDLE_HEIGHT}
                    width={barWidth}
                    height={DRAG_HANDLE_HEIGHT}
                    rx="4"
                    fill="rgba(251,191,36,0.12)"
                    stroke="rgba(251,191,36,0.5)"
                    strokeDasharray={draggingIdx === i ? '0' : '3 3'}
                    strokeWidth="1"
                  />
                  <foreignObject
                    x={x + barWidth / 2 - 6}
                    y={y - DRAG_HANDLE_HEIGHT + 2}
                    width="12"
                    height={DRAG_HANDLE_HEIGHT - 4}
                  >
                    <GripVertical className="w-3 h-3 text-cyber-yellow/70 mx-auto" />
                  </foreignObject>
                </g>

                <text
                  x={x + barWidth / 2}
                  y={y - DRAG_HANDLE_HEIGHT - 8}
                  textAnchor="middle"
                  fill={isCurrent ? '#a78bfa' : '#e2e8f0'}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {h}
                </text>

                <text
                  x={x + barWidth / 2}
                  y={CHART_PADDING.top + innerHeight + 20}
                  textAnchor="middle"
                  fill="rgba(148,163,184,0.7)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  #{i}
                </text>

                {i === 0 && (
                  <g transform={`translate(${x + barWidth / 2 - 8}, ${y - DRAG_HANDLE_HEIGHT - 28})`}>
                    <foreignObject width="16" height="16">
                      <Bot className="w-4 h-4 text-cyber-green" />
                    </foreignObject>
                  </g>
                )}
                {i === heights.length - 1 && (
                  <g transform={`translate(${x + barWidth / 2 - 8}, ${y - DRAG_HANDLE_HEIGHT - 28})`}>
                    <foreignObject width="16" height="16">
                      <Flag className="w-4 h-4 text-cyber-red" />
                    </foreignObject>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <AnimatePresence>
          {containerSize.width > 0 && (
            <motion.div
              key="robot"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                x: robotX - 18,
                y: robotY,
                scale: isPlaying ? [1, 1.08, 1] : 1,
                opacity: 1,
              }}
              transition={{
                x: { type: 'spring', stiffness: 280, damping: 22 },
                y: { type: 'spring', stiffness: 320, damping: 20 },
                scale: { repeat: isPlaying ? Infinity : 0, duration: 0.6 },
              }}
              className="absolute z-20 pointer-events-none"
              style={{ willChange: 'transform' }}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple flex items-center justify-center shadow-neon-cyan">
                  <Bot className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                {currentEnergy !== undefined && (
                  <motion.div
                    key={currentEnergy}
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap ${
                      currentEnergy <= 0
                        ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/50'
                        : currentEnergy < maxH * 0.2
                        ? 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/50'
                        : 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50'
                    }`}
                  >
                    E={currentEnergy}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 pb-3 text-[11px] text-slate-500 font-mono flex items-center gap-2 border-t border-cyber-border/50 mt-1 pt-2">
        <GripVertical className="w-3 h-3 text-cyber-yellow/60" />
        拖拽顶部黄色手柄调整建筑高度，机器人跳跃轨迹将实时更新
      </div>
    </div>
  );
}
