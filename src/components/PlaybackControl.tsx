import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  RotateCcw,
} from 'lucide-react';

export function PlaybackControl() {
  const playback = useAppStore((s) => s.playback);
  const setPlayback = useAppStore((s) => s.setPlayback);
  const resetPlayback = useAppStore((s) => s.resetPlayback);
  const stepPlayback = useAppStore((s) => s.stepPlayback);
  const results = useAppStore((s) => s.results);
  const selectedIdx = useAppStore((s) => s.selectedResultIndex);

  const intervalRef = useRef<number | null>(null);

  const traceLen =
    results[selectedIdx]?.energyTrace.length ??
    useAppStore.getState().heights.length;
  const maxStep = Math.max(0, traceLen - 1);
  const progressPct = maxStep === 0 ? 0 : (playback.currentStep / maxStep) * 100;

  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (playback.isPlaying && maxStep > 0) {
      const stepMs = 1000 / playback.speed;
      intervalRef.current = window.setInterval(() => {
        const state = useAppStore.getState();
        if (state.playback.currentStep >= maxStep) {
          setPlayback({ isPlaying: false });
        } else {
          stepPlayback(1);
        }
      }, stepMs);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playback.isPlaying, playback.speed, maxStep, setPlayback, stepPlayback]);

  const togglePlay = () => {
    if (maxStep === 0) return;
    if (playback.currentStep >= maxStep) {
      setPlayback({ currentStep: 0, isPlaying: true });
    } else {
      setPlayback({ isPlaying: !playback.isPlaying });
    }
  };

  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="cyber-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="section-title mb-0">
          <Gauge className="w-4 h-4 text-cyber-purple" />
          动画播放控制
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          步 {playback.currentStep}/{maxStep}
        </span>
      </div>

      <div className="relative mb-4">
        <div
          className="h-2 rounded-full bg-slate-800 overflow-hidden border border-cyber-border/50"
          onClick={(e) => {
            if (maxStep === 0) return;
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setPlayback({
              currentStep: Math.round(Math.min(1, Math.max(0, pct)) * maxStep),
            });
          }}
          style={{ cursor: maxStep > 0 ? 'pointer' : 'default' }}
        >
          <div
            className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-green transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-100 pointer-events-none flex items-center justify-center"
          style={{
            left: `calc(${progressPct}% - 10px)`,
            boxShadow: '0 0 12px rgba(167,139,250,0.6)',
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 justify-center">
        <button
          onClick={() => setPlayback({ currentStep: 0, isPlaying: false })}
          disabled={maxStep === 0}
          className="cyber-btn !px-2.5 !py-2 text-sm"
          title="回到起点"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => stepPlayback(-5)}
          disabled={maxStep === 0 || playback.currentStep === 0}
          className="cyber-btn !px-2.5 !py-2 text-sm"
          title="后退5步"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => stepPlayback(-1)}
          disabled={maxStep === 0 || playback.currentStep === 0}
          className="cyber-btn !px-2.5 !py-2 text-sm"
          title="后退1步"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          disabled={maxStep === 0}
          className="cyber-btn-primary cyber-btn !px-5 !py-2"
          style={{ minWidth: 88 }}
        >
          {playback.isPlaying ? (
            <Pause className="w-5 h-5 mx-auto" />
          ) : (
            <Play className="w-5 h-5 mx-auto" />
          )}
        </button>

        <button
          onClick={() => stepPlayback(1)}
          disabled={maxStep === 0 || playback.currentStep >= maxStep}
          className="cyber-btn !px-2.5 !py-2 text-sm"
          title="前进1步"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={() => stepPlayback(5)}
          disabled={maxStep === 0 || playback.currentStep >= maxStep}
          className="cyber-btn !px-2.5 !py-2 text-sm"
          title="前进5步"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          播放速度
        </span>
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setPlayback({ speed: s })}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all ${
                playback.speed === s
                  ? 'bg-gradient-to-r from-cyber-cyan/30 to-cyber-purple/30 text-white border border-cyber-cyan/50'
                  : 'bg-slate-800/60 text-slate-500 border border-cyber-border/50 hover:text-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
