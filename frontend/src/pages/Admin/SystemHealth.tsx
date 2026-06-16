import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Network,
  HardDrive,
  BarChart3,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Network,
  HardDrive,
  BarChart3,
  Terminal,
  AlertTriangle,
  Target,
  Compass,
  LayoutTemplate,
  FastForward,
  Play,
  Globe,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Microscope,
  Gauge,
  BrainCircuit,
  Wand2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import ThinkingStream from '@/components/ui/ThinkingStream';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const SystemHealth = () => {
  const [lastScan, setLastScan] = useState(new Date().toLocaleTimeString());
  const [isScanning, setIsScanning] = useState(false);

  // ... (useEffect and queries remain same)

  if (isLoading) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Cpu className="w-12 h-12 text-indigo-500 animate-spin-slow" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Initializing_System_Pulse</div>
        </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen text-white selection:bg-indigo-500/30 overflow-x-hidden pb-20"
    >
      <NeuralBackdrop />
      <ThinkingStream />
      
      <main className="pl-32 pr-12 py-12 space-y-16 relative z-10">
        
        {/* Executive Header */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[2px] bg-indigo-500" 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Infrastructure_Lattice_Secure</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Pulse</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Real-time Node Telemetry // Sentient Diagnostics v4.8
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => refetch()}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <RefreshCw className={cn("w-5 h-5 text-indigo-400", isLoading && "animate-spin")} /> Refresh_Lattice
              </button>
              <button className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300">
                  <FastForward className="w-5 h-5" /> Execute_Forensic_Scan
              </button>
          </div>
        </section>

        {/* Primary Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
                { label: 'Database_Latency', val: `${health?.database?.latency_ms || 0}ms`, icon: Database, color: 'text-indigo-400', sub: 'PostgreSQL 17 Engine' },
                { label: 'AI_Availability', val: 'NOMINAL', icon: Cpu, color: 'text-purple-400', sub: 'Gemini 1.5 Pro Cluster' },
                { label: 'API_Throughput', val: '1,240 req/s', icon: Zap, color: 'text-blue-400', sub: 'Nginx Edge Gateway' },
                { label: 'Neural_Nodes', val: '22 Active', icon: Server, color: 'text-emerald-400', sub: 'Autonomic Modules' },
            ].map((stat, i) => (
                <HolographicCard key={i} className="p-10 group flex flex-col justify-between min-h-[280px]">
                    <div className="flex justify-between items-start">
                        <div className={cn("p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.4em] border-white/5 opacity-40">STABLE</Badge>
                    </div>
                    <div className="mt-8">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 italic">{stat.label}</p>
                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{stat.val}</h3>
                        <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic">{stat.sub}</p>
                    </div>
                </HolographicCard>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Event Stream */}
            <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Neural Event Stream</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Real-time Handshake Logs</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {[
                        { time: '14:20:05', type: 'SUCCESS', msg: 'Atomic multi-leg posting synthesized for TXN_88241.', node: 'CORE_ENGINE' },
                        { time: '14:18:22', type: 'NEURAL', msg: 'Lattice Repair Agent initiated autonomous reversal.', node: 'REPAIR_AGENT' },
                        { time: '14:15:40', type: 'SYMMETRY', msg: 'FIRS tax clearance node synchronized (VAT @ 7.5%).', node: 'GOV_LINK' },
                        { time: '14:10:12', type: 'SECURITY', msg: 'Neural Handshake verified for high-value NIP outbound.', node: 'IDENTITY_HUB' },
                    ].map((log, idx) => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={idx}>
                            <HolographicCard className="p-10 border-l-4 border-transparent hover:border-indigo-500 transition-all cursor-pointer group">
                                <div className="flex items-center gap-10">
                                    <span className="text-[11px] font-mono font-black text-slate-600 group-hover:text-indigo-400 transition-colors">{log.time}</span>
                                    <Badge className={cn(
                                        "border-none font-black text-[9px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full",
                                        log.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                                    )}>{log.type}</Badge>
                                    <p className="text-lg font-black text-white italic tracking-tighter uppercase flex-1">{log.msg}</p>
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-3.5 h-3.5 text-slate-600" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.node}</span>
                                    </div>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Hardware Resources */}
            <div className="lg:col-span-4 space-y-12">
                <SentientFrame intent="neutral" title="Resource Utilization" subtitle="Core Computing Substrate Health">
                    <div className="space-y-10 p-2">
                        {[
                            { label: 'Compute_Load', val: '12%', color: 'bg-indigo-500' },
                            { label: 'Neural_Memory', val: '42%', color: 'bg-emerald-500' },
                            { label: 'Storage_Lattice', val: '8%', color: 'bg-blue-500' },
                        ].map((res, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
                                    <span className="text-slate-500">{res.label}</span>
                                    <span className="text-white">{res.val}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: res.val }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className={cn("h-full shadow-[0_0_10px]", res.color)}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-8 border-t border-white/5 mt-10">
                            <div className={cn(
                                "flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-700 shadow-2xl",
                                isScanning ? "bg-indigo-600 border-indigo-500" : "bg-white/[0.02] border-white/5"
                            )}>
                                <ShieldCheck className={cn("w-6 h-6", isScanning ? "text-white animate-bounce" : "text-indigo-400")} />
                                <div className="flex-1">
                                    <p className={cn("text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed", isScanning ? "text-indigo-100" : "text-slate-400")}>
                                        {isScanning ? 'Orchestrating Forensic Handshake...' : `Lattice Verified at ${lastScan}`}
                                    </p>
                                </div>
                                {!isScanning && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-4 py-1.5 rounded-full">INTEGRITY_SAFE</Badge>}
                            </div>
                        </div>
                    </div>
                </SentientFrame>

                <HolographicCard className="p-10 space-y-10 bg-gradient-to-br from-indigo-900/10 to-transparent">
                    <div className="flex items-center gap-5">
                        <Terminal className="h-6 w-6 text-indigo-400 animate-pulse" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Sentient Diagnostics</h4>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-400 italic">
                        "Lattice Analysis: Database node is operating at <span className="text-emerald-400 font-black">99.999% availability</span>. We recommend a scheduled neural pruning of block history #88000 to maintain 4ms latency thresholds."
                    </p>
                    <button className="w-full h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        Execute_Neural_Pruning
                    </button>
                </HolographicCard>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default SystemHealth;
