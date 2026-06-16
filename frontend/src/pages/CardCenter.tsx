import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Lock, Unlock, Plus, Activity, Eye, EyeOff, Sparkles, ShieldCheck, RefreshCw, Cpu, Zap, Globe, Globe2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  Unlock, 
  Plus, 
  Activity, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  Zap, 
  Globe, 
  Globe2,
  Smartphone,
  MoreVertical,
  Target,
  Compass,
  LayoutTemplate,
  FastForward,
  Play,
  Hammer
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

const CardCenter = () => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  
  // ... (state and queries remain the same)

  if (isLoading) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <CreditCard className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Syncing_with_Card_Switch</div>
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
                className="h-[2px] bg-indigo-500" 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Card_Vault_Secure</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Vault</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Virtual & Physical Node Provisioning // Tier-0 Rail v4.8
            </p>
          </div>
          
          <Button 
            onClick={() => setIsIssuing(true)}
            className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300 group"
          >
              <Hammer className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" /> Forge_New_Asset
          </Button>
        </section>

        {/* Issuance Overlay */}
        <AnimatePresence>
            {isIssuing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                        <HolographicCard className="w-full max-w-xl p-16">
                            <div className="space-y-12 relative z-10">
                                <div className="text-center space-y-2">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Secure_Forge</span>
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Neural Forge</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] italic">Synthesizing Card-Node Infrastructure</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Asset_Class</Label>
                                        <select className="w-full h-20 px-8 rounded-3xl bg-white/[0.03] border border-white/5 font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl appearance-none uppercase text-xs" value={formData.card_type} onChange={e => setFormData({...formData, card_type: e.target.value})}>
                                            <option value="VIRTUAL" className="bg-slate-900">Virtual (Neural Node)</option>
                                            <option value="PHYSICAL" className="bg-slate-900">Physical (Plastic Mesh)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Network_Rail</Label>
                                        <select className="w-full h-20 px-8 rounded-3xl bg-white/[0.03] border border-white/5 font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl appearance-none uppercase text-xs" value={formData.card_scheme} onChange={e => setFormData({...formData, card_scheme: e.target.value})}>
                                            <option value="VERVE" className="bg-slate-900">Verve (Domestic)</option>
                                            <option value="MASTERCARD" className="bg-slate-900">Mastercard (Global)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Funding_NUBAN</Label>
                                        <select className="w-full h-20 px-8 rounded-3xl bg-white/[0.03] border border-white/5 font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl appearance-none uppercase text-xs" value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})}>
                                            <option value="" className="bg-slate-900">Select source account...</option>
                                            {myAccounts?.map((acc: any) => <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col gap-6">
                                    <Button className="w-full bg-indigo-600 h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all text-white border-none" onClick={handleRequest} disabled={requestCardMutation.isPending || !formData.account_id}>
                                        {requestCardMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <Zap className="h-8 w-8 mr-4 fill-white" />}
                                        AUTHORIZE_SYNTHESIS
                                    </Button>
                                    <button className="w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-white transition-colors font-bold" onClick={() => setIsIssuing(false)}>Abort_Protocol</button>
                                </div>
                            </div>
                        </HolographicCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Asset Roster */}
            <div className="space-y-12">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                            <CreditCard className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Asset Roster</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Active Node Handshakes</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                {cards?.length > 0 ? (
                    cards.map((card: any, idx: number) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <HolographicCard className="min-h-[300px] p-0 group">
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-1000 group-hover:opacity-60",
                                    card.card_scheme === 'VERVE' ? 'from-emerald-900/60 to-slate-900' : 'from-indigo-900/60 to-slate-900'
                                )} />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                
                                <div className="relative z-10 p-12 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="bg-white/10 backdrop-blur-3xl px-6 py-2 rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase text-white border border-white/10 shadow-2xl">
                                                {card.card_type} // {card.card_scheme}
                                            </div>
                                            <p className="text-[11px] font-black text-white/40 tracking-[0.3em] uppercase italic">WEEZY_ELITE_SYNTHETIC</p>
                                        </div>
                                        {getStatusBadge(card.status)}
                                    </div>

                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-5xl font-mono tracking-[0.25em] font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                                {showFullDetails ? card.card_number_masked.replace(/\*/g, '•') : card.card_number_masked}
                                            </h3>
                                            <button onClick={() => setShowFullDetails(!showFullDetails)} className="h-16 w-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all shadow-2xl backdrop-blur-xl">
                                                {showFullDetails ? <EyeOff className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
                                            </button>
                                        </div>

                                        <div className="flex gap-20 items-end">
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Valid_Through</p>
                                                <p className="font-black text-2xl tracking-[0.2em]">{card.expiry_date}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">CVC_Lattice</p>
                                                <p className="font-black text-2xl tracking-[0.2em]">{showFullDetails ? '774' : '•••'}</p>
                                            </div>
                                            <div className="ml-auto">
                                                {card.card_scheme === 'VERVE' ? (
                                                    <div className="w-24 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-base tracking-tighter text-white border border-white/10 backdrop-blur-3xl shadow-2xl">Verve</div>
                                                ) : (
                                                    <div className="flex -space-x-6">
                                                        <div className="w-16 h-16 rounded-full bg-rose-600 shadow-2xl border-4 border-[#ffffff10] backdrop-blur-md" />
                                                        <div className="w-16 h-16 rounded-full bg-amber-500 shadow-2xl border-4 border-[#ffffff10] backdrop-blur-md" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-10 bg-black/80 backdrop-blur-3xl flex justify-between items-center border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                    <p className="text-sm font-black tracking-[0.3em] uppercase text-white italic">{card.cardholder_name}</p>
                                    <div className="flex gap-6">
                                        <button className="h-12 px-8 rounded-xl bg-white/5 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 text-white border border-white/10 transition-all" onClick={() => statusMutation.mutate({ id: card.id, status: 'BLOCKED_PERM' })}>
                                            <Lock className="h-4 w-4 mr-3" /> Freeze_Node
                                        </button>
                                    </div>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                        <Activity className="h-20 w-20 text-slate-900 mx-auto mb-10 animate-pulse" />
                        <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Vault Empty</h4>
                        <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">Initialize Field Nodes to begin synthesis.</p>
                    </div>
                )}
                </div>
            </div>

            {/* Security Architecture */}
            <div className="space-y-16">
                <SentientFrame intent="risk" title="Security Architecture" subtitle="Neural Intercept Overrides">
                    <div className="space-y-8">
                        {[
                            { label: 'Web_Terminal', desc: 'E-commerce lattice gate', active: true, icon: Globe },
                            { label: 'Global_Corridor', desc: 'Cross-border bridge', active: false, icon: Globe2 },
                            { label: 'Cash_Exit', desc: 'Physical ATM tunnel', active: true, icon: Zap },
                            { label: 'NFC_Proximity', desc: 'Contactless sensing', active: false, icon: Smartphone },
                        ].map((ctrl, i) => (
                            <div key={i} className="group flex items-center justify-between p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                                <div className="flex items-center gap-8">
                                    <div className={cn(
                                        "p-4 rounded-2xl transition-all duration-700",
                                        ctrl.active ? "bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white" : "bg-white/5 text-slate-600"
                                    )}>
                                        <ctrl.icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-black text-white uppercase italic tracking-tight">{ctrl.label}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ctrl.desc}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-16 h-8 rounded-full relative transition-all duration-700",
                                    ctrl.active ? "bg-indigo-600 shadow-2xl shadow-indigo-500/40" : "bg-white/5"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-700 shadow-2xl",
                                        ctrl.active ? "right-1" : "left-1"
                                    )} />
                                </div>
                            </div>
                        ))}
                    </div>
                </SentientFrame>

                <div className="p-12 bg-white/[0.01] border border-indigo-500/10 rounded-[48px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Shield className="w-32 h-32 text-indigo-400 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    </div>
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Sentinel Intelligence</h4>
                        </div>
                        <p className="text-base font-medium leading-relaxed text-slate-400 italic">
                            "Cognitive Core analyzed your ISO-8583 message stream. Your **Verve Node** is primarily utilized for domestic SANEF POS cash-outs. We recommend maintaining the **Global Corridor** lock to achieve a <span className="text-emerald-400 font-black">99.9% Security Confidence Score</span>."
                        </p>
                        <div className="p-8 bg-black/40 border border-white/5 rounded-[32px] flex items-center justify-between shadow-2xl">
                             <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Trust Rating</span>
                                <span className="text-2xl font-black text-white italic tracking-tighter uppercase">PLATINUM_LEVEL</span>
                             </div>
                             <div className="h-20 w-20 rounded-full border-4 border-emerald-500/10 flex items-center justify-center relative">
                                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin duration-1000" />
                                <span className="text-sm font-black text-emerald-400">9.8</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Floating Card HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <ShieldCheck className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">ISO_8583_Sync</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Rail Handshake</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Asset_Health</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Nodes Operational</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Switch_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Card_Forge_v4.8</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default CardCenter;
