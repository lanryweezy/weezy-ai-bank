import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { WorkflowRun, WorkflowDefinition } from '@/types/workflows';
import { 
  RefreshCw, 
  Filter, 
  ListChecks, 
  Eye, 
  GitMerge, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight,
  Cpu,
  ShieldCheck,
  Target,
  Globe,
  Zap,
  Activity,
  BrainCircuit,
  Wand2,
  PieChart,
  Plus,
  LayoutTemplate,
  Database,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from '@/components/ui/label';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';

const WorkflowRunsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterWorkflowId, setFilterWorkflowId] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");

  const { data: workflowDefinitions } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient<WorkflowDefinition[]>('/workflows'),
  });

  const { data: runs, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-runs', filterWorkflowId, filterStatus],
    queryFn: () => {
        const params = new URLSearchParams();
        if (filterWorkflowId && filterWorkflowId !== 'all') params.append('workflowId', filterWorkflowId);
        if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
        return apiClient<WorkflowRun[]>(`/workflow-runs?${params.toString()}`);
    },
  });

  const getStatusBadge = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-full shadow-2xl">COMPLETED</Badge>;
      case 'in_progress':
        return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-full animate-pulse shadow-2xl">ACTIVE_LATTICE</Badge>;
      case 'failed':
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-full shadow-2xl">BREACH_DETECTED</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 font-black uppercase text-[8px] px-3">{status}</Badge>;
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Process_Lattice_Active</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Instance <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Stream</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Real-time Process Orchestration // Forensic Handshake Audit v4.0
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => refetch()}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <RefreshCw className={cn("w-5 h-5 text-indigo-400", isLoading && "animate-spin")} /> Resync_Stream
              </button>
              <button 
                onClick={() => navigate('/workflows')}
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <LayoutTemplate className="w-5 h-5" /> Manage_Lattices
              </button>
          </div>
        </section>

        {/* Global Performance HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
                { label: 'Active_Orchestrations', val: runs?.filter(r => r.status === 'in_progress').length || 0, icon: Activity, color: 'text-indigo-400', sub: 'Live Consensuses' },
                { label: 'Consensus_Accuracy', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-400', sub: 'Lattice Health' },
                { label: 'Throughput_Velocity', val: '1.2k/hr', icon: Zap, color: 'text-blue-400', sub: 'Transaction Flow' },
                { label: 'System_Latency', val: '4.2ms', icon: Cpu, color: 'text-amber-400', sub: 'Neural Engine' },
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
            
            {/* Filter Hub */}
            <div className="lg:col-span-12">
                <SentientFrame intent="neutral" className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
                        <div className="space-y-6">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Lattice_Template</Label>
                            <Select value={filterWorkflowId} onValueChange={setFilterWorkflowId}>
                                <SelectTrigger className="h-20 rounded-[32px] bg-white/[0.03] border-white/5 px-8 font-black text-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl">
                                    <SelectValue placeholder="All_Lattices" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#050508] border-white/10 text-white rounded-[32px] p-2">
                                    <SelectItem value="all" className="rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest">All_Lattices</SelectItem>
                                    {workflowDefinitions?.map(def => (
                                        <SelectItem key={def.workflow_id} value={def.workflow_id} className="rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest">
                                            {def.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-6">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Node_Status_Filter</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="h-20 rounded-[32px] bg-white/[0.03] border-white/5 px-8 font-black text-xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl">
                                    <SelectValue placeholder="All_Statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#050508] border-white/10 text-white rounded-[32px] p-2">
                                    <SelectItem value="all" className="rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest">All_Statuses</SelectItem>
                                    {['pending', 'in_progress', 'completed', 'failed', 'cancelled'].map(status => (
                                        <SelectItem key={status} value={status} className="rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest capitalize">{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-6">
                             <Button variant="outline" className="h-20 flex-1 rounded-[32px] bg-white/[0.03] border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-2xl">
                                <Filter className="h-5 w-5 mr-4 text-indigo-400" /> Apply_Advanced_Mask
                            </Button>
                        </div>
                    </div>
                </SentientFrame>
            </div>

            {/* Run Stream */}
            <div className="lg:col-span-12 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <GitMerge className="w-6 h-6 text-indigo-400 rotate-90" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Execution Roster</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Historical & Active Process Nodes</p>
                    </div>
                </div>

                <div className="space-y-8">
                {isLoading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-[48px] bg-white/5" />)
                ) : runs?.length === 0 ? (
                    <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[64px] bg-white/[0.01]">
                        <Activity className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                        <h4 className="text-4xl font-black text-slate-700 italic uppercase tracking-tighter">Lattice Dormant</h4>
                        <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">No process instances matching current criteria discovered.</p>
                    </div>
                ) : (
                    runs?.map((run, idx) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={run.run_id}>
                            <HolographicCard className="p-12 border-l-4 border-transparent hover:border-indigo-500 transition-all cursor-pointer group">
                                <div className="flex flex-col md:flex-row items-center gap-16">
                                    <div className="flex items-center gap-12 flex-1">
                                        <div className="relative">
                                            <div className="p-8 rounded-[40px] bg-white/5 border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12">
                                                <BrainCircuit className={cn("h-10 w-10", run.status === 'completed' ? "text-emerald-400 group-hover:text-white" : "text-indigo-400 group-hover:text-white")} />
                                            </div>
                                            {run.status === 'in_progress' && <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-4 border-[#050508] shadow-lg animate-pulse" />}
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-8">
                                                <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">{run.workflow_name || 'Autonomous_Lattice'}</h4>
                                                <Badge className="bg-white/5 text-slate-500 border border-white/10 text-[9px] font-black tracking-[0.4em] uppercase px-4 py-1.5 rounded-full italic">Ver: {run.workflow_version}</Badge>
                                                {getStatusBadge(run.status)}
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-slate-600" />
                                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">{format(new Date(run.start_time), "MMM d // HH:mm:ss")}</p>
                                                </div>
                                                <div className="w-px h-3 bg-white/5" />
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-slate-600" />
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{run.triggering_user_id ? `AGENT_${run.triggering_user_id.substring(0,8)}` : 'SYSTEM_NODE'}</p>
                                                </div>
                                                <div className="w-px h-3 bg-white/5" />
                                                <p className="text-[10px] text-slate-600 font-mono font-black uppercase tracking-widest italic">SHA_PROOF_{run.run_id.substring(0,12)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-20">
                                        <div className="text-right space-y-3">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Current_Node</p>
                                            <Badge className="bg-white/5 text-indigo-400 border border-indigo-500/20 text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl italic">{run.current_step_name || 'TERMINAL'}</Badge>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/workflow-runs/${run.run_id}`)}
                                            className="h-20 px-10 rounded-[32px] bg-white/[0.03] border border-white/5 font-black text-[11px] uppercase tracking-[0.4em] text-white hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-4 group/btn"
                                        >
                                            Inspect <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))
                )}
                </div>
            </div>
        </div>

        {/* Floating Infrastructure HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Database className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Lattice_DB</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active_State_Sync</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Consensus_Seal</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">PQC Finality Verified</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Engine_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Orchestrator_v4.2</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default WorkflowRunsPage;
