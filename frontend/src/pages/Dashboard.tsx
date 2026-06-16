import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  Brain, 
  Smartphone,
  Activity,
  Zap,
  Lock,
  ChevronRight,
  ChevronLeft,
  Users,
  Target,
  Cpu,
  Compass,
  Plus,
  LayoutTemplate
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TransferModal from '@/components/TransferModal';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.full_name || user.username || 'User');
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning');
    else if (hour < 17) setGreeting('Afternoon');
    else setGreeting('Evening');
  }, []);

  const { data: accounts, refetch: refetchSummary } = useQuery({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const displayAccounts = accounts || [
    { id: 1, account_number: '9990011223', ledger_balance: '12450000.00', currency: 'NGN', account_name: 'GLOBAL SAVINGS' },
    { id: 2, account_number: '9991100224', ledger_balance: '4250.00', currency: 'USD', account_name: 'DOMICILIARY PLATINUM' }
  ];

  const getSymbol = (curr: string) => curr === 'USD' ? '$' : '₦';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Cockpit_Operational_State</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Command</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Executive Overview // {greeting}, {userName.split(' ')[0]} // v4.8
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <ArrowUpRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send_Assets
              </button>
              <button 
                onClick={() => navigate('/cognitive-core')}
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <Brain className="w-5 h-5" /> Execute_Prime
              </button>
          </div>
        </section>

        <TransferModal 
          isOpen={isTransferModalOpen} 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={() => refetchSummary()}
        />

        {/* Global Liquidity Mesh */}
        <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-6">
                    <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                        <Globe className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Liquidity Mesh</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Real-time Sovereign Node Status</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="h-12 w-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><ChevronLeft className="h-5 w-5" /></button>
                    <button className="h-12 w-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><ChevronRight className="h-5 w-5" /></button>
                </div>
            </div>
            
            <div className="flex overflow-x-auto pb-10 gap-10 no-scrollbar snap-x snap-mandatory">
                {/* Aggregated Insight Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <HolographicCard className="min-w-[420px] p-12 flex flex-col justify-between h-[320px] snap-center">
                        <div className="flex justify-between items-start">
                             <div className="p-5 rounded-[24px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                                <TrendingUp className="h-8 w-8" />
                             </div>
                             <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] px-4 py-1.5 tracking-widest uppercase">Aggregated_Net</Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Total_Lattice_Value</p>
                            <h3 className="text-6xl font-black italic tracking-tighter text-white">₦22.4M</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">3 COGNITIVE NODES ACTIVE</span>
                        </div>
                    </HolographicCard>
                </motion.div>

                {displayAccounts.map((acc, i) => (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.1) }} key={i}>
                        <HolographicCard className="min-w-[420px] p-12 flex flex-col justify-between h-[320px] snap-center group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{acc.account_name}</p>
                                    <Badge className="bg-white/5 text-slate-400 border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">{acc.currency}_PROTOCOL</Badge>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-white/40 group-hover:text-indigo-400 transition-colors">
                                    <CreditCard className="h-7 w-7" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Available_Liquidity</p>
                                <h3 className="text-5xl font-black tracking-tighter italic text-white">
                                    {getSymbol(acc.currency)}{parseFloat(acc.ledger_balance).toLocaleString()}
                                </h3>
                            </div>

                            <div className="flex items-end justify-between border-t border-white/5 pt-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Sovereign_NUBAN</p>
                                    <p className="text-xl font-mono font-black tracking-[0.3em] text-indigo-400/80">{acc.account_number}</p>
                                </div>
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            </div>
                        </HolographicCard>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Autonomic Module Tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
                { label: 'Fraud Shield', desc: 'Neural Perimeter Secure', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10', path: '/fraud-shield', status: 'PROTECTED' },
                { label: 'Weezy Prime', desc: 'Sentient Core Architecture', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-600/10', path: '/cognitive-core', status: 'SENTIENT' },
                { label: 'Agent Mesh', desc: 'Real-time SANEF Nodes', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', path: '/agent-banking', status: 'ACTIVE_MESH' },
            ].map((module, i) => (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={i}>
                    <HolographicCard className="p-12 flex flex-col justify-between group cursor-pointer hover:border-indigo-500/30 h-[350px]" onClick={() => navigate(module.path)}>
                        <div className="flex justify-between items-start">
                            <div className={cn("p-6 rounded-[32px] border shadow-2xl transition-all duration-700 group-hover:rotate-12", module.bg, `border-${module.color.split('-')[1]}-500/20`, module.color)}>
                                <module.icon className="h-10 w-10" />
                            </div>
                            <div className="bg-white/5 backdrop-blur-3xl px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase text-white/40 border border-white/5">
                                {module.status}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-3xl font-black italic tracking-tighter text-white uppercase group-hover:text-indigo-400 transition-colors">{module.label}</h4>
                            <div className="flex items-center gap-4">
                                <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">{module.desc}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-500">Node_Protocol_v4.8</span>
                            <ChevronRight className="h-5 w-5 text-indigo-400" />
                        </div>
                    </HolographicCard>
                </motion.div>
            ))}
        </div>

        {/* Floating Cockpit HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System_Engine</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Autonomous Orchestration Active</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Audit_Finality</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">100% Lattice Integrity</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Target className="w-5 h-5 text-amber-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Network_Load</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Low Latency Pulse</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Dashboard;
