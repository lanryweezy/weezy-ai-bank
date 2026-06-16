import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, UserPlus, MapPin, Wallet, Activity, Search, ShieldCheck, RefreshCw, TrendingUp, Network, Smartphone, Building2, User, CheckCircle2, ChevronRight, Globe, Cpu } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  UserPlus, 
  MapPin, 
  Wallet, 
  Activity, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  TrendingUp, 
  Network, 
  Smartphone, 
  Building2, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Globe, 
  Cpu,
  Zap,
  MoreVertical,
  Target,
  Compass,
  LayoutTemplate,
  FastForward,
  Plus
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AgentBankingPage = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // ... (state and queries remain the same)

  if (isLoading) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Network className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Scanning_Field_Infrastructure</div>
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
      
      <main className="max-w-7xl mx-auto px-8 pt-16 space-y-16 relative z-10">
        
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Mesh_Status_Nominal</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Mesh</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                SANEF Standard Distributed Nodes // Global Roster v2.4
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => navigate('/agent-earnings')}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Revenue_Lattice
              </button>
              <button 
                onClick={() => setIsRegistering(!isRegistering)} 
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <UserPlus className="w-5 h-5" /> {isRegistering ? 'Mesh_Intelligence' : 'Deploy_Node'}
              </button>
          </div>
        </section>

        {isRegistering ? (
          <HolographicCard className="max-w-4xl mx-auto p-16">
            <div className="space-y-12 relative z-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Node Provisioning</h2>
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] italic">Authorized Merchant Onboarding protocol</p>
                    </div>
                    <div className="bg-indigo-600/10 p-5 rounded-[28px] border border-indigo-500/20">
                        <Building2 className="h-8 w-8 text-indigo-400" />
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="space-y-6 relative group">
                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Identity_Handshake (Phone)</Label>
                        <div className="relative">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                            <Input 
                                placeholder="Scan customer identity pool..." 
                                className="h-24 pl-20 rounded-[32px] bg-white/[0.03] border-white/5 font-black text-3xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all" 
                                value={customerSearch}
                                onChange={e => setCustomerSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Form Layout Grid */}
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Business_Narrative</Label>
                            <Input placeholder="Zenith Ventures..." className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-8 font-black text-xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
                        </div>
                        <div className="space-y-6">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Hierarchy_Tier</Label>
                            <select 
                                className="w-full h-20 px-8 rounded-3xl bg-white/[0.03] border border-white/5 font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl uppercase text-xs appearance-none"
                                value={formData.tier}
                                onChange={e => setFormData({...formData, tier: e.target.value})}
                            >
                                <option value="RETAIL_AGENT" className="bg-slate-900">Retail Node</option>
                                <option value="SUPER_AGENT" className="bg-slate-900">Super Grid</option>
                                <option value="SOLE_DISTRIBUTOR" className="bg-slate-900">Sole Distributor</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-10 flex flex-col gap-6">
                        <Button 
                            onClick={() => registerMutation.mutate({...formData, customer_id: parseInt(formData.customer_id)})} 
                            disabled={registerMutation.isPending}
                            className="w-full bg-indigo-600 h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-[0_0_60px_rgba(99,102,241,0.4)] hover:bg-indigo-500 active:scale-95 transition-all text-white"
                        >
                            {registerMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-6" /> : <Zap className="h-8 w-8 mr-6 fill-white" />}
                            EXECUTE_PROVISIONING
                        </Button>
                        <button className="w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-rose-400 transition-colors font-bold" onClick={() => setIsRegistering(false)}>Abort_Protocol</button>
                    </div>
                </div>
            </div>
          </HolographicCard>
        ) : (
          <div className="space-y-16">
            {/* Global Mesh Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <HolographicCard className="p-10 min-h-[300px] flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className="p-5 rounded-[24px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-all shadow-2xl">
                            <Activity className="h-8 w-8" />
                         </div>
                         <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_15px_#10b981]" />
                    </div>
                    <div className="mt-12">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Active_Nodes</p>
                        <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">{agents?.length || '1,248'}</h3>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-6 h-[1px] bg-emerald-500" />
                            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">+12 Nodes Sync'd Today</p>
                        </div>
                    </div>
                </HolographicCard>

                <HolographicCard className="p-10 min-h-[300px] flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className="p-5 rounded-[24px] bg-purple-600/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-all shadow-2xl">
                            <Wallet className="h-8 w-8" />
                         </div>
                         <Cpu className="h-6 w-6 text-slate-700 animate-pulse" />
                    </div>
                    <div className="mt-12">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Mesh_Liquidity</p>
                        <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">₦45.2M</h3>
                        <p className="text-[9px] text-slate-500 font-bold mt-4 uppercase tracking-[0.3em] italic">Total Decentralized Float</p>
                    </div>
                </HolographicCard>

                <HolographicCard className="p-10 min-h-[300px] flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className="p-5 rounded-[24px] bg-amber-600/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-all shadow-2xl">
                            <TrendingUp className="h-8 w-8" />
                         </div>
                         <Badge className="bg-amber-600 text-white border-none font-black text-[9px] px-4 py-1 tracking-widest rounded-full uppercase">Live_Cycle</Badge>
                    </div>
                    <div className="mt-12">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Accrued_Fee_Pool</p>
                        <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">₦2.1M</h3>
                        <p className="text-[9px] text-indigo-400/80 font-black mt-4 uppercase tracking-widest">Pending Neural Split at 00:00</p>
                    </div>
                </HolographicCard>
            </div>

            {/* Grid Infrastructure */}
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-4">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                            <Network className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Grid Infrastructure</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Autonomous Field Node Operations</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-[450px] group">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                        <Input placeholder="SCAN_NODE_ID_OR_MERCHANT..." className="pl-20 h-20 rounded-[32px] bg-white/[0.02] border-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500/20 shadow-2xl font-black text-xs text-white placeholder:text-slate-800 italic tracking-[0.3em]" />
                    </div>
                </div>

                <HolographicCard className="p-0 overflow-hidden flex flex-col min-h-[700px]">
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-white/[0.03]">
                            {agents?.map((agent: any, idx: number) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={agent.id} 
                                    className="p-12 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-500"
                                >
                                    <div className="flex items-center gap-12 w-full md:w-auto">
                                        <div className="relative">
                                            <div className="bg-white/[0.03] p-8 rounded-[40px] text-indigo-400 border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 group-hover:shadow-indigo-500/40">
                                                <Smartphone className="h-10 w-10" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#050508] shadow-lg animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-6 mb-4">
                                                <p className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{agent.business_name}</p>
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">NODE_SYNCED</Badge>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-3">
                                                    <Cpu className="w-4 h-4 text-slate-600" />
                                                    <p className="text-[11px] text-slate-500 font-mono font-black uppercase tracking-[0.2em]">{agent.agent_code}</p>
                                                </div>
                                                <div className="w-px h-4 bg-white/5" />
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-3">
                                                    <MapPin className="h-4 w-4 text-indigo-500" /> {agent.lga} // {agent.state}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-20 mt-10 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right space-y-2">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Current_Float</p>
                                            <p className="text-4xl font-black text-white italic tracking-tighter transition-all group-hover:text-emerald-400">₦{parseFloat(agent.float_balance || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all shadow-2xl">
                                                <Activity className="h-6 w-6" />
                                            </button>
                                            <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all shadow-2xl">
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="p-12 border-t border-white/5 bg-white/[0.01] flex justify-center">
                        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-black/40 border border-white/5 shadow-2xl">
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Quantum_Mesh_Encrypted // Layer_04_Active</span>
                        </div>
                    </div>
                </HolographicCard>
            </div>
          </div>
        )}

        {/* Floating Mesh HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Network className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Mesh_Sync</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active nodes: {agents?.length || '0'}</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Target className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">SLA_Adherence</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">99.98% Field Uptime</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Neural_Field_v2.4</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default AgentBankingPage;
