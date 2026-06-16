import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, Layers, Grid, Sliders, Puzzle, Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';
import IntegrationCard from './IntegrationCard';
import AvailableServiceCard from './AvailableServiceCard';
import { Skeleton } from '@/components/ui/skeleton';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  RefreshCw, 
  Layers, 
  Grid, 
  Sliders, 
  Puzzle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Activity, 
  BrainCircuit, 
  Cpu, 
  Globe, 
  Globe2,
  ChevronRight,
  Target,
  Database,
  Smartphone,
  Unplug
} from 'lucide-react';
import IntegrationCard from './IntegrationCard';
import AvailableServiceCard from './AvailableServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const IntegrationHub: React.FC = () => {
  const { data: providers, isLoading, refetch } = useQuery({
    queryKey: ['integration-providers'],
    queryFn: () => apiClient('/integrations/hub/providers'),
  });

  return (
    <div className="space-y-16">
      
      {/* High-Fidelity Gateway Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {[
            { label: 'Switch_Throughput', val: '99.98%', icon: Zap, color: 'text-indigo-400', sub: 'Low Latency Rails' },
            { label: 'Active_Identity_Bridges', val: providers?.filter((p: any) => p.is_active).length || 0, icon: Globe, color: 'text-emerald-400', sub: 'Verified Connectors' },
            { label: 'Neural_Handshakes_sec', val: '1.2k', icon: Activity, color: 'text-amber-400', sub: 'Payload Velocity' },
            { label: 'Gateway_Integrity', val: 'ENFORCED', icon: ShieldCheck, color: 'text-blue-400', sub: 'RSA-4096 Secure' },
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
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{isLoading ? '...' : stat.val}</h3>
                    <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic">{stat.sub}</p>
                </div>
            </HolographicCard>
        ))}
      </div>

      <div className="space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-4">
            <div className="flex items-center gap-6">
                <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                    <Layers className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Bridge Infrastructure</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Autonomous Gateway Orchestration</p>
                </div>
            </div>
            <div className="flex gap-6">
                <Button variant="outline" className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl" onClick={() => refetch()}>
                    <RefreshCw className={cn("w-5 h-5 text-indigo-400", isLoading && "animate-spin")} /> Sync_Nodes
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {isLoading ? (
                [1,2,3,4].map(i => <Skeleton key={i} className="h-96 w-full rounded-[48px] bg-white/5" />)
            ) : providers?.length > 0 ? (
                providers?.map((provider: any, idx: number) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={provider.id}>
                        <IntegrationCard provider={provider} />
                    </motion.div>
                ))
            ) : (
                <div className="lg:col-span-2 py-48 text-center border-4 border-dashed border-white/5 rounded-[64px] bg-white/[0.01]">
                    <Unplug className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                    <h4 className="text-4xl font-black text-slate-700 italic uppercase tracking-tighter">Bridges Offline</h4>
                    <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">Initialize external node handshakes to activate the gateway mesh.</p>
                </div>
            )}
        </div>

        <div className="p-16 rounded-[64px] bg-white/[0.01] border-4 border-dashed border-white/5 text-center space-y-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="bg-white/5 p-8 rounded-[40px] shadow-2xl inline-block border border-white/5 group-hover:rotate-12 transition-transform duration-700">
                <Sparkles className="h-12 w-12 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-4 max-w-2xl mx-auto relative z-10">
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Marketplace Expansion</h4>
                <p className="text-slate-400 font-medium uppercase text-xs tracking-widest leading-relaxed">
                    "Cognitive Hub identified 3 new Tier-1 corridors available for neural integration. Expand your banking rails to include **Standard Chartered Inter-bank** and **TeamApt POS Mesh**."
                </p>
            </div>
            <div className="flex justify-center gap-8 relative z-10">
                <Button className="h-16 px-12 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all flex items-center gap-4">
                    <LayoutTemplate className="w-5 h-5" /> Browse_Upcoming_Nodes
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationHub;
