import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, User, Lock, Unlock, ArrowDownLeft, ArrowUpRight, ShieldCheck, RefreshCw, Activity, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  User, 
  Lock, 
  Unlock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw, 
  Activity, 
  AlertTriangle,
  Zap,
  MoreVertical,
  Target,
  Compass,
  LayoutTemplate,
  FastForward,
  Play,
  Cpu,
  Globe,
  Smartphone,
  Database,
  ChevronRight,
  TrendingUp,
  Scale
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import ThinkingStream from '@/components/ui/ThinkingStream';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TellerOperations = () => {
  const [activeTab, setActiveTab] = useState('DEPOSIT');
  const [validatedAccount, setValidatedAccount] = useState<any>(null);
  
  // ... (state and queries remain the same)

  if (loadingStatus) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Store className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Synchronizing_Branch_Lattice</div>
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
      <ThinkingStream />
      
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Branch_Operations_Authenticated</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Teller <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Nexus</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Real-time Cash Management // OTC Handshake v4.2
            </p>
          </div>
          
          {tillStatus && (
            <div className="flex gap-6">
                {isTillOpen ? (
                    <button 
                      onClick={() => closeTillMutation.mutate()}
                      className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500/20 hover:text-rose-400 transition-all flex items-center gap-4 group shadow-2xl"
                    >
                        <Lock className="w-5 h-5" /> End_Shift
                    </button>
                ) : (
                    <button 
                      onClick={() => openTillMutation.mutate()}
                      className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
                    >
                        <Unlock className="w-5 h-5" /> Start_Shift
                    </button>
                )}
            </div>
          )}
        </section>

        {/* Global Mesh Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <HolographicCard className="p-10 min-h-[250px] flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                        <div className="p-5 rounded-[24px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-all shadow-2xl">
                        <Store className="h-8 w-8" />
                        </div>
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full animate-ping shadow-[0_0_15px]",
                            isTillOpen ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50"
                        )} />
                </div>
                <div className="mt-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Till_Identification</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{isTillOpen ? 'SYNC_ACTIVE' : 'DORMANT'}</h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-4 uppercase tracking-widest">{tillStatus?.branch_name || 'NEURAL_NODE_882'}</p>
                </div>
            </HolographicCard>

            <HolographicCard className="p-10 min-h-[250px] flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                        <div className="p-5 rounded-[24px] bg-purple-600/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-all shadow-2xl">
                        <Activity className="h-8 w-8" />
                        </div>
                        <Cpu className="h-6 w-6 text-slate-700 animate-pulse" />
                </div>
                <div className="mt-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Physical_Cash_Float</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">₦{parseFloat(tillStatus?.current_cash_balance || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-indigo-400 font-black mt-4 uppercase tracking-widest italic">Live OTC Liquidity</p>
                </div>
            </HolographicCard>

            <HolographicCard className="p-10 min-h-[250px] flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                        <div className="p-5 rounded-[24px] bg-amber-600/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-all shadow-2xl">
                        <Scale className="h-8 w-8" />
                        </div>
                        <Badge className="bg-amber-600 text-white border-none font-black text-[9px] px-4 py-1 tracking-widest rounded-full uppercase">Compliance</Badge>
                </div>
                <div className="mt-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Holding_Pressure</p>
                    <div className="flex items-end gap-4">
                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                            {Math.round((parseFloat(tillStatus?.current_cash_balance || 0) / parseFloat(tillStatus?.max_holding_limit || 1)) * 100)}%
                        </h3>
                        <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-widest italic">Limit: ₦{parseFloat(tillStatus?.max_holding_limit || 5000000).toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 mt-4 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((parseFloat(tillStatus?.current_cash_balance || 0) / parseFloat(tillStatus?.max_holding_limit || 1)) * 100, 100)}%` }}
                            transition={{ duration: 2, ease: "circOut" }}
                            className={cn(
                                "h-full shadow-[0_0_10px]",
                                parseFloat(tillStatus?.current_cash_balance) > parseFloat(tillStatus?.max_holding_limit) * 0.8 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-indigo-500 shadow-indigo-500/50'
                            )}
                        />
                    </div>
                </div>
            </HolographicCard>
        </div>

        {isTillOpen ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Actions Panel */}
                <div className="lg:col-span-8">
                    <HolographicCard className="p-0 overflow-hidden min-h-[650px]">
                        <div className="flex border-b border-white/5 bg-white/[0.01]">
                            {['DEPOSIT', 'WITHDRAWAL', 'VAULT'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "flex-1 py-8 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative group/tab",
                                        activeTab === tab ? "text-white bg-white/[0.03]" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-16 space-y-12">
                            {(activeTab === 'DEPOSIT' || activeTab === 'WITHDRAWAL') && (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Customer_NUBAN</Label>
                                            <div className="relative group">
                                                <Input 
                                                    value={formData.customer_account_number}
                                                    onChange={e => setFormData({...formData, customer_account_number: e.target.value})}
                                                    onBlur={handleAccountBlur}
                                                    placeholder="e.g. 0011223344" 
                                                    className="h-24 rounded-[32px] bg-white/[0.03] border-white/5 px-12 font-black text-3xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20 placeholder:text-white/5 transition-all" 
                                                />
                                                <div className="absolute right-8 top-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform"><User className="h-6 w-6" /></div>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {validatedAccount && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="flex items-center gap-6 p-6 bg-indigo-600/10 rounded-[32px] border border-indigo-500/20 shadow-2xl"
                                                    >
                                                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
                                                            <User className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xl font-black text-white italic uppercase tracking-tight">{validatedAccount.account_name}</p>
                                                            <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest mt-1">AVAILABLE_NODE: ₦{parseFloat(validatedAccount.ledger_balance).toLocaleString()}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] uppercase px-4 py-1.5 rounded-full">IDENTITY_VERIFIED</Badge>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="space-y-6">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Value_Quantity (₦)</Label>
                                            <Input 
                                                type="number"
                                                value={formData.amount}
                                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                                placeholder="0.00" 
                                                className="h-24 rounded-[32px] bg-white/[0.03] border-white/5 px-12 font-black text-4xl text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Transaction_Narration</Label>
                                        <Input 
                                            value={formData.narration}
                                            onChange={e => setFormData({...formData, narration: e.target.value})}
                                            placeholder={`CASH ${activeTab} BY ...`} 
                                            className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-10 font-bold text-xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20" 
                                        />
                                    </div>

                                    {activeTab === 'DEPOSIT' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-white/[0.01] rounded-[40px] border border-white/5 shadow-inner">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Depositor_Identity</Label>
                                                <Input 
                                                    value={formData.depositor_name}
                                                    onChange={e => setFormData({...formData, depositor_name: e.target.value})}
                                                    placeholder="Third-party name" 
                                                    className="h-16 rounded-2xl bg-black/40 border-white/5 px-8 font-bold text-white placeholder:text-slate-700" 
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact_Handshake</Label>
                                                <Input 
                                                    value={formData.depositor_phone}
                                                    onChange={e => setFormData({...formData, depositor_phone: e.target.value})}
                                                    placeholder="080..." 
                                                    className="h-16 rounded-2xl bg-black/40 border-white/5 px-8 font-bold text-white placeholder:text-slate-700" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        className={cn(
                                            "w-full h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-2xl transition-all text-white border-none",
                                            activeTab === 'DEPOSIT' 
                                                ? 'bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-500' 
                                                : 'bg-rose-600 shadow-rose-500/30 hover:bg-rose-500'
                                        )}
                                        onClick={handlePost}
                                        disabled={postTxnMutation.isPending}
                                    >
                                        {postTxnMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-6" /> : <Zap className="h-8 w-8 mr-6 fill-white" />}
                                        EXECUTE_SYNTHESIS ({activeTab})
                                    </Button>
                                </div>
                            )}
                            
                            {activeTab === 'VAULT' && (
                                <div className="py-24 text-center border-4 border-dashed border-white/5 rounded-[56px] bg-white/[0.01]">
                                    <ShieldCheck className="h-20 w-20 text-slate-800 mx-auto mb-10 animate-pulse" />
                                    <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase">Vault Handshake</h4>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] mt-6 italic max-w-sm mx-auto">Authorized branch-to-vault liquidity synchronization protocol.</p>
                                    <div className="flex justify-center gap-8 mt-16">
                                        <button className="h-16 px-10 rounded-2xl bg-white/5 border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Request_Provision</button>
                                        <button className="h-16 px-10 rounded-2xl bg-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 transition-all">Retire_Excess</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </HolographicCard>
                </div>

                {/* Compliance Radar */}
                <div className="lg:col-span-4 space-y-12">
                    <SentientFrame intent="compliance" title="Compliance Radar" subtitle="Real-time AML/CFT Surveillance">
                        <div className="space-y-8 h-full flex flex-col justify-center">
                            <p className="text-[13px] text-slate-400 leading-relaxed italic font-medium">
                                "Lattice Analysis: All over-the-counter deposits exceeding <span className="text-indigo-400 font-black">₦5,000,000</span> for individuals and <span className="text-indigo-400 font-black">₦10,000,000</span> for corporate entities are automatically flagged for NFIU mandatory reporting."
                            </p>
                            <div className="p-8 bg-black/40 border border-white/5 rounded-[32px] flex items-center justify-between shadow-2xl">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Surveillance_State</span>
                                    <span className="text-xl font-black text-emerald-400 italic tracking-tighter uppercase">NOMINAL</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </SentientFrame>

                    <HolographicCard className="p-10 bg-gradient-to-br from-rose-900/10 to-transparent">
                        <div className="flex items-center gap-5 mb-8">
                            <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Risk Intelligence</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed italic">
                            "Suspicious behavioral patterns detected in Sector 4 (Ikeja). Tellers advised to perform enhanced KYC (Tier 3) for all walk-in non-customers."
                        </p>
                    </HolographicCard>
                </div>
            </div>
        ) : (
            <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[64px] bg-white/[0.01]">
                <div className="bg-white/5 p-12 rounded-[48px] border border-white/5 shadow-2xl inline-block mb-10 group relative">
                    <div className="absolute inset-0 rounded-[48px] border-2 border-indigo-500 animate-ping opacity-10" />
                    <Lock className="h-16 w-16 text-slate-800 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h4 className="text-4xl font-black text-white italic tracking-tighter uppercase">Lattice Dormant</h4>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] mt-6 max-w-sm mx-auto">Authorize shift initiation to activate OTC Handshaking protocols.</p>
                <button 
                  onClick={() => openTillMutation.mutate()} 
                  className="mt-12 h-20 px-12 rounded-[32px] bg-indigo-600 shadow-[0_0_60px_rgba(99,102,241,0.4)] font-black text-sm uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all active:scale-95 duration-500"
                >
                    Start_Shift_Protocol
                </button>
            </div>
        )}

        {/* Floating Branch HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Database className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Vault_Sync</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Connected to Main Hub</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Compliance_Seal</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">FIRS/CBN Handshake Verified</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Ops_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Branch_Lattice_v4.2</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default TellerOperations;
