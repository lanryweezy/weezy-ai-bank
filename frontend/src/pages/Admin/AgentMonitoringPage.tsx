import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { AgentMonitoringSummary } from '@/types/agents'; 
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Network, 
  Cpu, 
  Zap, 
  Globe, 
  Target, 
  Smartphone,
  Server,
  Database,
  ChevronRight,
  BrainCircuit,
  Wand2,
  PieChart,
  Plus,
  LayoutTemplate
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';

const AgentMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AgentMonitoringSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitoringData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<AgentMonitoringSummary>('/admin/agents/monitoring-summary');
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to fetch agent monitoring data:', err);
      setError(err.data?.message || err.message || 'Failed to fetch monitoring data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-2xl">NOMINAL</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-2xl">DORMANT</Badge>;
      case 'error':
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-2xl">BREACH</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500 text-[8px]">{status}</Badge>;
    }
  };

  if (loading && !summary) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Network className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Scanning_Global_Mesh_Infrastructure</div>
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Mesh_Infrastructure_Active</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Distributed <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Mesh</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Real-time Agent Telemetry // Distributed Decision Nodes v2.4
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={fetchMonitoringData}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <RefreshCw className={cn("w-5 h-5 text-indigo-400", loading && "animate-spin")} /> Resync_Mesh
              </button>
              <button className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300">
                  <Target className="w-5 h-5" /> Trace_Field_Latency
              </button>
          </div>
        </section>

        {/* Status Counts HUD */}
        {summary?.status_counts && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {[
                  { label: 'Total_Distributed_Nodes', val: summary.status_counts.total, icon: Network, color: 'text-indigo-400', sub: 'Global Lattice Coverage' },
                  { label: 'Active_Field_Synced', val: summary.status_counts.active, icon: Activity, color: 'text-emerald-400', sub: '99.9% Uptime Enforced' },
                  { label: 'Dormant_Nodes', val: summary.status_counts.inactive, icon: Zap, color: 'text-slate-500', sub: 'Awaiting Handshake' },
                  { label: 'Lattice_Breaches', val: summary.status_counts.error, icon: AlertTriangle, color: 'text-rose-400', sub: 'Immediate Response Req.' },
              ].map((stat, i) => (
                  <HolographicCard key={i} className="p-10 group flex flex-col justify-between min-h-[280px]">
                      <div className="flex justify-between items-start">
                          <div className={cn("p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                              <stat.icon className="h-8 w-8" />
                          </div>
                          <div className={cn(
                              "w-2 h-2 rounded-full animate-pulse",
                              stat.label.includes('Breaches') && stat.val > 0 ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                          )} />
                      </div>
                      <div className="mt-8">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 italic">{stat.label}</p>
                          <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{stat.val}</h3>
                          <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic">{stat.sub}</p>
                      </div>
                  </HolographicCard>
              ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Recently Active Stream */}
            <div className="lg:col-span-12 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Neural Activity Stream</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Live node interaction telemetry</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {summary?.recently_active_agents?.map((agent, idx) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={agent.agent_id}>
                        <HolographicCard className="p-10 border-l-4 border-transparent hover:border-indigo-500 transition-all cursor-pointer group">
                            <div className="flex items-center gap-10">
                                <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12">
                                    <Smartphone className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">{agent.bank_specific_name}</h4>
                                        {getStatusBadge(agent.status)}
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{agent.template_name}</p>
                                        <div className="w-px h-3 bg-white/5" />
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{format(new Date(agent.last_task_activity), 'PPpp')}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/admin/configure-agent?agentId=${agent.agent_id}`}>
                                    <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-2xl">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </Link>
                            </div>
                        </HolographicCard>
                    </motion.div>
                ))}
                </div>
            </div>

            {/* Error Roster */}
            {summary?.error_state_agents && summary.error_state_agents.length > 0 && (
                <div className="lg:col-span-12 space-y-12">
                    <div className="flex items-center gap-6 px-4">
                        <div className="p-4 rounded-[24px] bg-rose-500/10 border border-rose-500/20 shadow-2xl shadow-rose-500/10">
                            <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic uppercase tracking-[0.3em] text-rose-400">Lattice Breach Roster</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Critical node failures requiring manual handshake</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {summary.error_state_agents.map((agent, idx) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={agent.agent_id}>
                            <HolographicCard className="p-10 border-l-4 border-rose-600 bg-rose-900/5 hover:bg-rose-900/10 transition-all cursor-pointer group">
                                <div className="flex items-center gap-10">
                                    <div className="p-6 rounded-[32px] bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white group-hover:rotate-12 group-hover:shadow-rose-500/40">
                                        <AlertTriangle className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-rose-400 transition-colors">{agent.bank_specific_name}</h4>
                                            <Badge className="bg-rose-500/20 text-rose-400 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-2xl">CRITICAL_FAIL</Badge>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{agent.template_name}</p>
                                            <div className="w-px h-3 bg-white/5" />
                                            <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest italic">Last Config: {format(new Date(agent.last_config_update), 'PP')}</p>
                                        </div>
                                    </div>
                                    <Link to={`/admin/configure-agent?agentId=${agent.agent_id}`}>
                                        <button className="h-16 w-16 rounded-[24px] bg-rose-600 shadow-2xl shadow-rose-500/20 font-black text-white hover:bg-rose-500 transition-all">
                                            <RefreshCw className="h-6 w-6" />
                                        </button>
                                    </Link>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))}
                    </div>
                </div>
            )}
        </div>

        {/* Floating Mesh HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Database className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Global_Registry</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Master Node Sync Active</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Consensus_Mesh</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sovereign Validation Enforced</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Mesh_Control_v2.4</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default AgentMonitoringPage;
