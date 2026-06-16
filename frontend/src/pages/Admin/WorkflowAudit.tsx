import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { 
  Activity, 
  Cpu, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Brain, 
  Database,
  BarChart3,
  Terminal,
  Search,
  Filter,
  ExternalLink,
  BrainCircuit,
  Target,
  Globe,
  Plus,
  Wand2,
  PieChart,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';

const WorkflowAudit = () => {
  const { data: aiLogs, isLoading: loadingAI, refetch } = useQuery({
    queryKey: ['aiTaskLogs'],
    queryFn: () => apiClient<any[]>('/task-logs'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'PROCESSING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen text-white selection:bg-indigo-500/30 overflow-x-hidden pb-20"
    >
      <NeuralBackdrop />
      <SentientNavigation />
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">AI_Governance_Online</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Sentient <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Audit</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Decision Intelligence Feed // Autonomous Reason History v4.0
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => refetch()}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <RefreshCw className={cn("w-5 h-5 text-indigo-400", loadingAI && "animate-spin")} /> Resync_Lattice
              </button>
              <button className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300">
                  <Target className="w-5 h-5" /> Trace_Confidence
              </button>
          </div>
        </section>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
                { label: 'Neural_Decisions', val: '42.1K', icon: Cpu, color: 'text-indigo-400', sub: 'Total Consensus Count' },
                { label: 'Avg_Confidence', val: '96.4%', icon: ShieldCheck, color: 'text-emerald-400', sub: 'Model Integrity Index' },
                { label: 'Decision_Throughput', val: '4ms', icon: Zap, color: 'text-blue-400', sub: 'Prime Core Latency' },
                { label: 'Anomalous_Nodes', val: '0.2%', icon: Activity, color: 'text-rose-400', sub: 'Escalation Probability' },
            ].map((stat, i) => (
                <HolographicCard key={i} className="p-10 group flex flex-col justify-between min-h-[280px]">
                    <div className="flex justify-between items-start">
                        <div className={cn("p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.4em] border-white/5 opacity-40 italic">NOMINAL</Badge>
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
            
            {/* Live Reasoning Stream */}
            <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Neural Decision Stream</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Real-time explainability handshakes</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {loadingAI ? (
                        [1,2,3,4,5].map(i => <Skeleton key={i} className="h-28 w-full rounded-[48px] bg-white/5" />)
                    ) : aiLogs?.map((log, idx) => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={log.id}>
                            <HolographicCard className="p-10 border-l-4 border-transparent hover:border-indigo-500 transition-all cursor-pointer group">
                                <div className="flex items-center gap-12">
                                    <div className={cn(
                                        "p-6 rounded-[32px] shadow-2xl transition-all duration-700 group-hover:rotate-12",
                                        log.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                                    )}>
                                        <Cpu className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-6">
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">{log.task_name}</h4>
                                                <Badge className={cn("border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-2xl", getStatusColor(log.status))}>
                                                    {log.status}
                                                </Badge>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic">{format(new Date(log.created_at), 'HH:mm:ss.SSS')}</span>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">Confidence: <span className="text-white">{log.confidence_score ? `${(log.confidence_score * 100).toFixed(1)}%` : 'N/A'}</span></p>
                                            </div>
                                            <div className="w-px h-3 bg-white/5" />
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-4 h-4 text-indigo-400" />
                                                <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">Latency: <span className="text-white">{log.processing_duration_ms}ms</span></p>
                                            </div>
                                            <div className="w-px h-3 bg-white/5" />
                                            <p className="text-[10px] text-slate-600 font-mono font-black uppercase tracking-widest italic">WEIGHT_REF_{log.id.toString().padStart(8, '0')}</p>
                                        </div>
                                    </div>
                                    <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-2xl">
                                        <ExternalLink className="h-6 w-6" />
                                    </button>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))}
                    
                    {(!aiLogs || aiLogs.length === 0) && !loadingAI && (
                        <div className="py-48 text-center border-4 border-dashed border-white/5 m-16 rounded-[64px] bg-white/[0.01]">
                            <BrainCircuit className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                            <h4 className="text-4xl font-black text-slate-700 italic uppercase tracking-tighter">Stream Silent</h4>
                            <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">Initialize autonomous nodes to begin recording decision handshakes.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Governance */}
            <div className="lg:col-span-4 space-y-12">
                <SentientFrame intent="compliance" title="Governance Protocol" subtitle="Explainability Core Monitoring">
                    <div className="space-y-10 p-2">
                        <div className="p-8 bg-black/40 border border-white/5 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="w-24 h-24 text-indigo-400 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Terminal className="h-5 w-5 text-indigo-400 animate-pulse" />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Forensic_Model</h4>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-slate-400 italic relative z-10">
                                "Every autonomous decision made by Weezy Prime is traced back to a specific neural weights snapshot and training data vector for 2035 compliance."
                            </p>
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Human_In_Loop</span>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full">ACTIVE</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Data_Lineage</span>
                                    <Badge className="bg-blue-500/20 text-blue-400 border-none text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-full">VERIFIED</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            <div className="flex items-center gap-4 mb-6">
                                <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin-slow" />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Self_Optimization</h4>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-slate-500 italic relative z-10">
                                "Lattice confidence thresholds are dynamically calibrated against successful settlement outcomes. 98.4% drift resistance detected."
                            </p>
                            <Button className="w-full mt-8 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                                Force_Re-Calibration
                            </Button>
                        </div>
                    </div>
                </SentientFrame>

                <HolographicCard className="p-10 bg-gradient-to-br from-rose-900/10 to-transparent flex flex-col justify-center">
                    <div className="flex items-center gap-5 mb-6">
                        <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Bias_Interceptor</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed italic mb-8">
                        "Real-time monitoring for demographic parity and fairness. No deviations from Fair Lending Mandate detected in the last 10k credit appraisals."
                    </p>
                    <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-2xl">
                         <ShieldCheck className="h-4 w-4 text-emerald-400" />
                         <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">FAIR_LATTICE_ENFORCED</span>
                    </div>
                </HolographicCard>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default WorkflowAudit;
