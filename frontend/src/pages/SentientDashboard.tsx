import React from 'react';
import Layout from '@/components/Layout';
import SentientFrame from '@/components/ui/SentientFrame';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ForensicLedger from '@/components/ui/ForensicLedger';
import NeuralIntegrityChart from '@/components/ui/NeuralIntegrityChart';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  ArrowRight,
  Plus,
  Compass
} from 'lucide-react';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import NeuralHandshake from '@/components/ui/NeuralHandshake';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import HolographicCard from '@/components/ui/HolographicCard';
import ThinkingStream from '@/components/ui/ThinkingStream';

const SentientDashboard: React.FC = () => {
  const [isHandshakeOpen, setIsHandshakeOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(20px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen text-white selection:bg-indigo-500/30 overflow-x-hidden"
    >
      <NeuralBackdrop />
      <SentientNavigation />
      <ThinkingStream />
      
      <main className="pl-32 pr-12 py-12 space-y-12 relative z-10">
        {/* Executive Header */}
        <section className="flex items-end justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                className="h-[2px] bg-gradient-to-r from-indigo-500 to-transparent" 
              />
              <span className="text-[12px] font-black uppercase tracking-[0.6em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Lattice_Primary_Executive</span>
            </div>
            <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-2">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Nexus</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1 max-w-md leading-relaxed">
                Autonomous Financial Orchestration Layer // Weezy CBS v4.0.8
            </p>
          </motion.div>

          <div className="flex items-center gap-6">
            <button className="h-20 px-12 rounded-[32px] bg-white/[0.01] backdrop-blur-3xl border border-white/5 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white/5 transition-all flex items-center gap-6 group shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Compass className="w-6 h-6 text-indigo-400 group-hover:rotate-180 transition-transform duration-1000" /> Insight_Lattice
            </button>
            <button 
              onClick={() => setIsHandshakeOpen(true)}
              className="h-20 px-12 rounded-[32px] bg-indigo-600 shadow-[0_0_60px_rgba(99,102,241,0.4)] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all flex items-center gap-6 hover:scale-[1.02] active:scale-95 duration-500 group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" /> Neural_Handshake
            </button>
          </div>
        </section>

        <AnimatePresence>
            {isHandshakeOpen && (
                <NeuralHandshake 
                    amount={12500000} 
                    onSuccess={() => setIsHandshakeOpen(false)} 
                    onCancel={() => setIsHandshakeOpen(false)} 
                />
            )}
        </AnimatePresence>

        {/* Neural Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Liquidity Matrix */}
          <div className="lg:col-span-8 space-y-10">
            <HolographicCard className="p-12 min-h-[550px]">
              <div className="relative z-10">
                  <div className="flex items-center justify-between mb-16">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">Liquidity Matrix</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time reserve orchestration across 12 nodes</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-12 mb-16">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available_Capital</p>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white">₦12.4B</h2>
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                            <Plus className="w-3 h-3" /> +14.2% <span className="text-slate-600">Growth</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">FX_Reserve_USD</p>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white">$4.2M</h2>
                        <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold">
                            <Globe className="w-3 h-3" /> HEDGED <span className="text-slate-600">15% Sweep</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lattice_Health</p>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white">100%</h2>
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> ENFORCED <span className="text-slate-600">PQC Active</span>
                        </div>
                    </div>
                  </div>

                  <NeuralIntegrityChart />
              </div>
            </HolographicCard>

            <div className="grid grid-cols-2 gap-10">
                <HolographicCard className="p-10">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-xs font-black uppercase tracking-[0.3em]">Regulatory_Pulse</h4>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: 'AML Threshold Check', status: 'ACTIVE', color: 'bg-emerald-500' },
                                { label: 'NDIC Premium Audit', status: 'SYNCHRONIZING', color: 'bg-indigo-500 animate-pulse' },
                                { label: 'NIP Settlement Forensic', status: 'WAITING', color: 'bg-slate-700' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[8px] font-bold text-slate-700">{item.status}</span>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </HolographicCard>
                
                <HolographicCard className="p-10">
                    <div className="flex items-center gap-8 h-full">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-rose-500/10 flex items-center justify-center relative">
                                <div className="absolute inset-0 border-t-4 border-rose-500 rounded-full animate-spin duration-1000" />
                                <Zap className="w-10 h-10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-black italic text-white uppercase tracking-[0.2em]">Neural_Shield</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                                Zero anomalies in last 10k transactions. Behavioral Governor nominal.
                            </p>
                        </div>
                    </div>
                </HolographicCard>
            </div>
          </div>

          {/* Forensic Sidebar */}
          <div className="lg:col-span-4">
            <HolographicCard className="h-full p-10">
                <ForensicLedger />
            </HolographicCard>
          </div>

        </div>
      </main>
    </motion.div>
  );
};

export default SentientDashboard;
