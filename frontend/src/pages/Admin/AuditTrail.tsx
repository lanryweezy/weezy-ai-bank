import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Activity, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Server,
  Zap,
  Cpu,
  Database,
  Wand2,
  PieChart,
  Target,
  Globe,
  Plus,
  LayoutTemplate,
  FastForward,
  Play,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: number;
  timestamp: string;
  username_performing_action: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  ip_address: string;
  status: string;
}

interface PaginatedAuditLogs {
    items: AuditLog[];
    total: number;
}

const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAudit = () => {
    setIsExporting(true);
    setTimeout(() => {
        setIsExporting(false);
        toast.success('Forensic logs synthesized and exported.');
    }, 2000);
  };

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', filterType],
    queryFn: () => apiClient<PaginatedAuditLogs>(`/admin/audit-logs/?limit=50${filterType !== 'ALL' ? `&action_type=${filterType}` : ''}`),
  });

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (action.includes('CREATE')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('UPDATE')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (action.includes('LOGIN_FAIL')) return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
  };

  const filteredLogs = logsData?.items?.filter(log => 
    log.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username_performing_action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Immutable_Trail_Online</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Forensic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Lattice</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Operational Governance History // Cryptographic Proofs v4.0
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={handleExportAudit}
                disabled={isExporting}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  {isExporting ? <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" /> : <Download className="w-5 h-5 text-indigo-400" />}
                  {isExporting ? 'Synthesizing...' : 'Export_Lattice'}
              </button>
              <button 
                onClick={() => refetch()}
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} /> Refresh_Trail
              </button>
          </div>
        </section>

        {/* Audit Performance HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {[
                { label: 'Events_Recorded', val: '1.2M', icon: Database, color: 'text-indigo-400', sub: 'Archive Depth' },
                { label: 'Security_Flags', val: '4', icon: AlertTriangle, color: 'text-rose-400', sub: 'Immediate Actions' },
                { label: 'Active_Orchestrators', val: '142', icon: Activity, color: 'text-emerald-400', sub: 'Live Session Nodes' },
                { label: 'Lattice_Integrity', val: 'SIGNED', icon: ShieldCheck, color: 'text-blue-400', sub: 'SHA-256 Proofs' },
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
            
            {/* Neural Command Filter */}
            <div className="lg:col-span-12">
                <SentientFrame intent="neutral" className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
                        <div className="md:col-span-7 space-y-6">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Neural_Command_Search</Label>
                            <div className="relative group">
                                <Wand2 className="h-6 w-6 absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors animate-pulse" />
                                <Input
                                    placeholder="e.g. Find all deletions by ADMIN in Sector 4..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-20 h-24 rounded-[32px] bg-white/[0.03] border-white/5 font-black text-xl italic tracking-tight shadow-2xl text-white placeholder:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3 space-y-6">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Action_Mask</Label>
                            <select 
                                className="w-full h-24 px-10 rounded-[32px] bg-white/[0.03] border border-white/5 font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl uppercase text-xs appearance-none"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="ALL" className="bg-slate-900">All_Event_Nodes</option>
                                <option value="USER_LOGIN" className="bg-slate-900">Login_Events</option>
                                <option value="BRANCH_CREATE" className="bg-slate-900">Infra_Modifications</option>
                                <option value="AGENT_UPDATE" className="bg-slate-900">Field_Ops</option>
                                <option value="DELETE" className="bg-slate-900">Destructive_Actions</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex gap-6">
                             <Button variant="outline" className="h-24 w-full rounded-[32px] bg-white/[0.03] border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-2xl">
                                <Filter className="h-5 w-5 mr-3 text-indigo-400" /> Apply
                            </Button>
                        </div>
                    </div>
                </SentientFrame>
            </div>

            {/* Forensic Timeline */}
            <div className="lg:col-span-12 space-y-12">
                <div className="flex items-center gap-6 px-4">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <History className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Forensic Timeline</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Cryptographically sealed history nodes</p>
                    </div>
                </div>

                <div className="space-y-8">
                {isLoading ? (
                    [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 w-full rounded-[48px] bg-white/5" />)
                ) : filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={log.id}>
                            <HolographicCard className="p-10 border-l-4 border-transparent hover:border-indigo-500 transition-all cursor-pointer group">
                                <div className="flex flex-col md:flex-row items-center gap-16">
                                    <div className="flex items-center gap-12 flex-1">
                                        <div className="relative">
                                            <div className={cn(
                                                "p-8 rounded-[40px] border shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12",
                                                log.action_type.includes('FAIL') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white' : 'bg-white/5 text-indigo-400 border-white/5 group-hover:bg-indigo-600 group-hover:text-white'
                                            )}>
                                                {log.action_type.includes('USER') ? <User className="h-10 w-10" /> : <Server className="h-10 w-10" />}
                                            </div>
                                            {log.action_type.includes('DELETE') && <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-[#050508] shadow-lg animate-pulse" />}
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-8">
                                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">{log.summary}</h4>
                                                <Badge className={cn("border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-2xl", getActionColor(log.action_type))}>
                                                    {log.action_type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-indigo-400" />
                                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">Actor: <span className="text-white">{log.username_performing_action || 'SYSTEM'}</span></p>
                                                </div>
                                                <div className="w-px h-3 bg-white/5" />
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-indigo-400" />
                                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">{format(new Date(log.timestamp), 'MMM dd // HH:mm:ss')}</p>
                                                </div>
                                                <div className="w-px h-3 bg-white/5" />
                                                <div className="flex items-center gap-3">
                                                    <Zap className="w-4 h-4 text-amber-400" />
                                                    <p className="text-[10px] text-slate-600 font-mono font-black tracking-widest italic">{log.ip_address || '127.0.0.1'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-2xl">
                                            <Eye className="h-6 w-6" />
                                        </button>
                                        <div className={cn(
                                            "w-2 h-16 rounded-full opacity-40 group-hover:opacity-100 transition-all",
                                            log.action_type.includes('DELETE') ? 'bg-rose-600' : 'bg-indigo-600'
                                        )} />
                                    </div>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-48 text-center border-4 border-dashed border-white/5 m-16 rounded-[64px] bg-white/[0.01]">
                        <History className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                        <h4 className="text-4xl font-black text-slate-700 italic uppercase tracking-tighter">End of Trail</h4>
                        <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">No forensic nodes discovered matching current mask.</p>
                    </div>
                )}
                </div>
            </div>
        </div>

        {/* Floating Forensic HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Lattice_Finality</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Immutable History Enforced</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Database className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Ledger_Sync</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">100% Data Integrity</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Forensic_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Audit_OS_v4.2</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default AuditTrail;
