import { motion } from 'framer-motion';
import { useSolver } from '@/hooks/useSolver';
import { BuildingChart } from '@/components/BuildingChart';
import { EnergyChart } from '@/components/EnergyChart';
import { EnergyTerrainChart } from '@/components/EnergyTerrainChart';
import { AlgorithmSelector } from '@/components/AlgorithmSelector';
import { DataGenerator } from '@/components/DataGenerator';
import { InverseGenerator } from '@/components/InverseGenerator';
import { ResultTable } from '@/components/ResultTable';
import { PlaybackControl } from '@/components/PlaybackControl';
import { ValidationBanner } from '@/components/ValidationBanner';
import {
  Bot,
  Github,
  Sparkles,
  RefreshCw,
  Brain,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function Home() {
  useSolver();

  return (
    <div className="min-h-screen cyber-grid-bg">
      <header className="border-b border-cyber-border/60 backdrop-blur-sm sticky top-0 z-30 bg-cyber-bg/70">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyber-cyan via-cyber-purple to-pink-500 p-[2px]"
              >
                <div className="w-full h-full rounded-[10px] bg-cyber-bg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyber-cyan" />
                </div>
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold tracking-tight font-display"
                >
                  <span className="gradient-text">Robot Jump</span>
                  <span className="text-slate-300 ml-2">算法分析平台</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[11px] text-slate-500 font-mono mt-0.5"
                >
                  Multi-Algorithm Robot Energy Optimization · Visualizer
                </motion.p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
                  5种算法
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyber-purple" />
                  实时求解
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyber-green" />
                  可验证
                </div>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="cyber-btn !px-3 !py-1.5 flex items-center gap-1.5 text-xs"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">Source</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="mb-4"
        >
          <ValidationBanner />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="xl:col-span-8 space-y-4"
          >
            <div className="h-[400px]">
              <BuildingChart />
            </div>
            <div className="h-[380px]">
              <EnergyChart />
            </div>
            <div className="h-[420px]">
              <EnergyTerrainChart />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="xl:col-span-4 space-y-4"
          >
            <AlgorithmSelector />

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="cyber-btn flex-1 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                重新计算
              </button>
              <button
                className="cyber-btn-primary cyber-btn flex-1 flex items-center justify-center gap-1.5"
                onClick={() => {
                  const evt = new CustomEvent('__force_solve__');
                  window.dispatchEvent(evt);
                }}
              >
                <Sparkles className="w-4 h-4" />
                运行求解
              </button>
            </div>

            <PlaybackControl />
            <DataGenerator />
            <InverseGenerator />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="xl:col-span-12"
          >
            <ResultTable />
          </motion.section>
        </div>

        <footer className="mt-8 text-center text-[11px] text-slate-600 font-mono pb-6">
          <p>
            能量变化规则: 上跳消耗 2×ΔH · 下跳恢复 ΔH · 能量不能为负 ·
            找到使机器人成功到达终点的最小初始能量 E₀
          </p>
        </footer>
      </main>
    </div>
  );
}
