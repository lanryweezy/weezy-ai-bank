import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Lock, 
  Landmark, 
  Globe, 
  ExternalLink,
  Search,
  Activity,
  Zap,
  Gavel,
  Cpu,
  Database,
  Clock
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Lock, 
  Landmark, 
  Globe, 
  ExternalLink,
  Search,
  Activity,
  Zap,
  Gavel,
  Cpu,
  Database,
  Clock,
  Target,
  Compass,
  LayoutTemplate,
  FastForward,
  Play,
  Scale,
  Wand2,
  BrainCircuit,
  Microscope,
  Gauge
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import ThinkingStream from '@/components/ui/ThinkingStream';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RegulatoryReporting = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // ... (queries and mutations remain the same)

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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Compliance_Node_Active</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Statutory <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Handshake</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                CBN FinA // CRMS // NFIU goAML Gateway v4.8
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <Globe className="w-5 h-5 text-indigo-400" /> Global_Calendar
              </button>
              <button 
                onClick={() => refetch()} 
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <RefreshCw className="w-5 h-5" /> Sync_Registry
              </button>
          </div>
        </section>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
                { label: 'Compliance_Index', val: '100.0%', icon: ShieldCheck, color: 'text-emerald-400', sub: 'CBN/NDIC Rating' },
                { label: 'Flagged_CTR_Nodes', val: '14', icon: AlertTriangle, color: 'text-amber-400', sub: 'Pending Review' },
                { label: 'FinA_Lattice_Health', val: '99.9%', icon: Activity, color: 'text-indigo-400', sub: 'Integrity Check' },
                { label: 'PQC_Payload_Signing', val: 'ACTIVE', icon: Lock, color: 'text-blue-400', sub: 'Post-Quantum Seal' },
            ].map((stat, i) => (
                <HolographicCard key={i} className="p-10 group flex flex-col justify-between min-h-[280px]">
                    <div className="flex justify-between items-start">
                        <div className={cn("p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
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
            
            {/* Protocol Forge */}
            <div className="lg:col-span-4 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <Gavel className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Statutory Protocols</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Autonomous Synthesis Vectors</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {[
                        { id: 'FINA_SCH_001', name: 'CBN FinA (SCH 001)', desc: 'Autonomous Monthly Trial Balance & GL Aggregation.', type: 'MONTHLY' },
                        { id: 'CRMS_LOAD', name: 'CRMS Return 1', desc: 'Sovereign Credit Risk Management System Upload.', type: 'REAL-TIME' },
                        { id: 'NFIU_CTR', name: 'NFIU CTR (₦10M+)', desc: 'Real-time Currency Transaction Reporting Vector.', type: 'DAILY' }
                    ].map((report) => (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={report.id}>
                            <HolographicCard className="p-10 group cursor-pointer hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:rotate-6 shadow-2xl">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">{report.type}</Badge>
                                </div>
                                <div className="space-y-2 mb-8">
                                    <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{report.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono font-black tracking-widest">{report.id}</p>
                                </div>
                                <p className="text-[11px] text-slate-400 italic mb-10 leading-relaxed font-medium">"{report.desc}"</p>
                                <Button 
                                    className="w-full bg-white/[0.03] hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] h-14 rounded-2xl transition-all shadow-2xl border border-white/5"
                                    onClick={() => generateMutation.mutate(report.id)}
                                    disabled={generateMutation.isPending}
                                >
                                    {generateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-3" /> : <Zap className="h-4 w-4 mr-3" />}
                                    Initialize_Export
                                </Button>
                            </HolographicCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Forensic Archive */}
            <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <History className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Forensic Export Archive</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Certified Statutory Payloads</p>
                    </div>
                </div>

                <HolographicCard className="p-0 overflow-hidden flex flex-col min-h-[700px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-white/[0.03]">
                            {logs?.length > 0 ? (
                                logs.map((log: any, idx: number) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={log.id} 
                                        className="p-12 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-500 gap-12"
                                    >
                                        <div className="flex items-center gap-12 flex-1">
                                            <div className="relative">
                                                <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-12">
                                                    <ShieldCheck className={cn("h-8 w-8", log.status === 'GENERATED' ? "text-emerald-400 group-hover:text-white" : "text-slate-600")} />
                                                </div>
                                                {log.status === 'GENERATED' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050508] shadow-lg animate-pulse" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-8 mb-4">
                                                    <p className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{log.report_name}</p>
                                                    {getStatusBadge(log.status)}
                                                </div>
                                                <div className="flex items-center gap-10">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-4 h-4 text-indigo-400" />
                                                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">Node_Cycle: {format(new Date(log.reporting_period_end_date), 'MMM dd // yyyy')}</p>
                                                    </div>
                                                    <div className="w-px h-3 bg-white/5" />
                                                    <p className="text-[10px] text-slate-600 font-mono font-black uppercase tracking-widest italic">LATTICE_HASH_{log.id.toString().padStart(8, '0')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            {log.status === 'GENERATED' && (
                                                <button 
                                                    className="h-16 px-10 rounded-[24px] bg-white/[0.03] border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-2xl group/dl"
                                                    onClick={() => handleDownload(log.id, `${log.report_name}_${log.reporting_period_end_date}`)}
                                                >
                                                    <Download className="mr-3 h-5 w-5 group-hover/dl:translate-y-0.5 transition-transform" /> Download_Proof
                                                </button>
                                            )}
                                            <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-600 hover:text-indigo-400 transition-all shadow-2xl">
                                                <Activity className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-48 text-center border-4 border-dashed border-white/5 m-16 rounded-[64px] bg-white/[0.01]">
                                    <Database className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                                    <h4 className="text-4xl font-black text-slate-700 italic uppercase tracking-tighter">Archive Dormant</h4>
                                    <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">Synthesize statutory payloads to populate the forensic lattice.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-12 border-t border-white/5 bg-white/[0.01] flex justify-center">
                        <div className="flex items-center gap-5 px-8 py-4 rounded-full bg-black/40 border border-white/5 shadow-2xl group hover:border-indigo-500/30 transition-all">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">CBN_Gateway_Sync_Nominal // RSA_4096_Enforced</span>
                        </div>
                    </div>
                </HolographicCard>
            </div>
        </div>

        {/* Floating Compliance HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Adherence_Pulse</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">100% CBN Compliance</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Database className="w-5 h-5 text-indigo-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Data_Lineage</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">T+0 Audit Finality</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Reg_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Statutory_OS_v4.8</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default RegulatoryReporting;

export default RegulatoryReporting;
