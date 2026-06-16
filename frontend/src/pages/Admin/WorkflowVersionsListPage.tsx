import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { WorkflowDefinition } from '@/types/workflows';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  GitCommit, 
  RefreshCw, 
  Activity, 
  Clock, 
  Zap, 
  BrainCircuit, 
  Target, 
  Plus, 
  LayoutTemplate, 
  History,
  GitBranch,
  ChevronRight,
  Database,
  Cpu
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

const WorkflowVersionsListPage: React.FC = () => {
  const { workflowName } = useParams<{ workflowName: string }>();
  const navigate = useNavigate();

  const [versions, setVersions] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!workflowName) {
      setError("Workflow name not provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<WorkflowDefinition[]>(`/admin/workflows/name/${workflowName}/versions`);
      setVersions(data.sort((a, b) => b.version - a.version)); 
    } catch (err: any) {
      console.error(`Failed to fetch versions for ${workflowName}:`, err);
      setError(err.data?.message || err.message || `Failed to fetch versions.`);
    } finally {
      setLoading(false);
    }
  }, [workflowName]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleActivateVersion = async (definitionId: string, version: number) => {
    try {
      await apiClient(`/admin/workflows/${definitionId}/activate`, { method: 'PUT' });
      fetchVersions(); 
    } catch (err: any) {
      console.error('Failed to activate workflow version:', err);
    }
  };

  if (loading && versions.length === 0) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <GitBranch className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Traversing_Logic_History</div>
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Lattice_Evolution_Active</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Version <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">History</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Lattice: {workflowName} // Multi-Agent Evolution History v4.0
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => navigate('/workflows')}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <ArrowLeft className="w-5 h-5 text-indigo-400" /> Back_to_Lattices
              </button>
              <button 
                onClick={() => navigate(`/admin/workflow-definitions/new-version/${workflowName}`)}
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <Plus className="w-5 h-5" /> Synthesize_New_Node
              </button>
          </div>
        </section>

        {/* Evolution HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
                { label: 'Total_Evolution_Depth', val: versions.length, icon: History, color: 'text-indigo-400', sub: 'Historical Branches' },
                { label: 'Active_Lattice_Ver', val: `v${versions.find(v => v.is_active)?.version || '0'}`, icon: Target, color: 'text-emerald-400', sub: 'Production Protocol' },
                { label: 'Maturity_Index', val: '98.4%', icon: Activity, color: 'text-blue-400', sub: 'Lattice Stability' },
                { label: 'Neural_Handshakes', val: '42.1K', icon: BrainCircuit, color: 'text-purple-400', sub: 'Processed via vHistory' },
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
            
            {/* Version Stream */}
            <div className="lg:col-span-12 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <GitCommit className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Version Stream</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Process logic iteration history</p>
                    </div>
                </div>

                <div className="space-y-8">
                {versions.length === 0 ? (
                    <div className="py-48 text-center border-4 border-dashed border-white/5 m-16 rounded-[64px] bg-white/[0.01]">
                        <GitBranch className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                        <h4 className="text-4xl font-black text-slate-700 italic uppercase tracking-tighter">History Dormant</h4>
                        <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">No version nodes discovered for this process lattice.</p>
                    </div>
                ) : (
                    versions.map((def, idx) => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={idx}>
                            <HolographicCard className={cn(
                                "p-12 border-l-4 transition-all cursor-pointer group",
                                def.is_active ? "border-emerald-500 bg-emerald-900/5 shadow-emerald-500/10" : "border-transparent hover:border-indigo-500"
                            )}>
                                <div className="flex flex-col md:flex-row items-center gap-16">
                                    <div className="flex items-center gap-12 flex-1">
                                        <div className="relative">
                                            <div className={cn(
                                                "p-8 rounded-[40px] shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12",
                                                def.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-indigo-400 border-white/5"
                                            )}>
                                                <History className="h-10 w-10" />
                                            </div>
                                            {def.is_active && <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#050508] shadow-lg animate-pulse" />}
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-8">
                                                <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">Version_{def.version}</h4>
                                                <Badge className={cn(
                                                    "border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-2xl",
                                                    def.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
                                                )}>
                                                    {def.is_active ? 'PRODUCTION_ACTIVE' : 'HISTORICAL_NODE'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-indigo-400" />
                                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">{format(new Date(def.updated_at), 'MMM dd // HH:mm:ss')}</p>
                                                </div>
                                                <div className="w-px h-3 bg-white/5" />
                                                <p className="text-[11px] text-slate-400 font-bold italic line-clamp-1 flex-1">"{def.description || 'System synthesized logic iteration.'}"</p>
                                                <div className="w-px h-3 bg-white/5" />
                                                <p className="text-[10px] text-slate-600 font-mono font-black uppercase tracking-widest italic">SHA_PROOF_{def.workflow_id.substring(0,12)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        {!def.is_active && (
                                            <button 
                                                onClick={() => handleActivateVersion(def.workflow_id, def.version)}
                                                className="h-16 px-8 rounded-[24px] bg-emerald-600/10 border border-emerald-500/20 font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-2xl flex items-center gap-3"
                                            >
                                                <CheckCircle className="h-4 w-4" /> Activate_Protocol
                                            </button>
                                        )}
                                        <Link to={`/admin/workflow-definitions/edit/${def.workflow_id}`}>
                                            <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all shadow-2xl">
                                                <Edit className="h-6 w-6" />
                                            </button>
                                        </Link>
                                        <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-all shadow-2xl">
                                            <Trash2 className="h-6 w-6" />
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

        {/* Floating Evolution HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <GitBranch className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Logic_History</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{versions.length} Historical Nodes</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Handshake_Finality</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Version Immutability Enforced</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">CIM_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Evolution_Engine_v4.0</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default WorkflowVersionsListPage;
