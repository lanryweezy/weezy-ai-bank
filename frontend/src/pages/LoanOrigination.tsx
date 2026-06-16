import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, ArrowRight, ShieldCheck, RefreshCw, Activity, AlertTriangle, Upload, CheckCircle2, UserCheck, Briefcase, Cpu, Zap, Globe, Smartphone, Database, ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  Upload, 
  CheckCircle2, 
  UserCheck, 
  Briefcase, 
  Cpu, 
  Zap, 
  Globe, 
  Smartphone, 
  Database, 
  ChevronRight,
  TrendingDown,
  Target,
  Scale,
  BrainCircuit,
  FastForward,
  Play
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import GenerativeLifePath from '@/components/GenerativeLifePath';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoanOrigination = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      product_id: 1,
      amount: '',
      tenor_months: '12',
      purpose: '',
      monthly_income: '',
      disbursement_account_number: ''
  });

  const previewAmount = useMemo(() => parseFloat(formData.amount) || 0, [formData.amount]);

  // ... (queries and mutations remain the same)

  if (isLoadingProducts) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Scale className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Initializing_Risk_Core</div>
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
                className="h-[2px] bg-indigo-500" 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Credit_Protocol_Active</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Credit <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Nexus</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                AI-Native Origination // Real-time Risk Modeling v4.2
            </p>
          </div>
          
          <Button 
            onClick={() => setStep(1)}
            className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
          >
              <Plus className="w-5 h-5" /> New_Credit_Request
          </Button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Strategic Area */}
            <div className="lg:col-span-8 space-y-12">
                {step === 1 && (
                    <HolographicCard className="p-16">
                        <div className="space-y-12 relative z-10">
                            <div className="flex items-center justify-between border-b border-white/5 pb-10">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Financial Declaration</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] italic">Authorized asset allocation handshake</p>
                                </div>
                                <div className="bg-indigo-600/10 p-5 rounded-[28px] border border-indigo-500/20">
                                    <FileText className="h-8 w-8 text-indigo-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Asset_Product</Label>
                                    <select 
                                        className="w-full h-20 px-8 rounded-3xl bg-white/[0.03] border border-white/5 font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xl uppercase text-xs appearance-none"
                                        value={formData.product_id}
                                        onChange={e => setFormData({...formData, product_id: parseInt(e.target.value)})}
                                    >
                                        {products?.map((p: any) => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-6">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Requested_Capital (₦)</Label>
                                    <Input placeholder="0.00" className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-8 font-black text-3xl text-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                                </div>
                                <div className="space-y-6">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Maturity_Horizon (Months)</Label>
                                    <Input placeholder="12" className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-8 font-black text-xl text-white italic" value={formData.tenor_months} onChange={e => setFormData({...formData, tenor_months: e.target.value})} />
                                </div>
                                <div className="space-y-6">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Verified_Monthly_Inflow (₦)</Label>
                                    <Input placeholder="Net Revenue" className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-8 font-black text-xl text-white italic" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="pt-10 flex flex-col gap-6">
                                <Button 
                                    className="w-full bg-indigo-600 h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-[0_0_60px_rgba(99,102,241,0.4)] hover:bg-indigo-500 active:scale-95 transition-all text-white border-none" 
                                    onClick={() => setStep(2)}
                                    disabled={!formData.disbursement_account_number || !formData.amount}
                                >
                                    PROCEED_TO_IDENTITY_HANDSHAKE <ArrowRight className="ml-6 h-8 w-8" />
                                </Button>
                            </div>
                        </div>
                    </HolographicCard>
                )}

                {step === 2 && (
                    <HolographicCard className="p-24 text-center">
                        <div className="relative z-10 space-y-12">
                            <div className="bg-indigo-600/10 w-32 h-32 rounded-[48px] border border-indigo-500/20 flex items-center justify-center mx-auto shadow-2xl relative group">
                                <Upload className="h-12 w-12 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 rounded-[48px] border-2 border-indigo-500 animate-ping opacity-20" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Identity Handshake</h2>
                                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] mt-4 italic leading-relaxed max-w-md mx-auto">
                                    Synchronizing NIN Lattice and 6-Month Liquidity Stream for Neural Appraisal.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl mx-auto">
                                <div className="p-10 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px] hover:border-indigo-500/30 transition-all cursor-pointer group">
                                    <UserCheck className="h-10 w-10 text-slate-700 mx-auto mb-6 group-hover:text-indigo-400" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white">NIN_IDENTITY</p>
                                </div>
                                <div className="p-10 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[40px] hover:border-indigo-500/30 transition-all cursor-pointer group">
                                    <Database className="h-10 w-10 text-slate-700 mx-auto mb-6 group-hover:text-indigo-400" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white">LEDGER_DUMP</p>
                                </div>
                            </div>

                            <div className="pt-10 space-y-6">
                                <Button 
                                    className="w-full bg-indigo-600 h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
                                    onClick={handleApply}
                                    disabled={applyMutation.isPending}
                                >
                                    {applyMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-6" /> : <ShieldCheck className="h-8 w-8 mr-6" />}
                                    INITIATE_NEURAL_SCAN
                                </Button>
                                <button className="w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-rose-400 transition-colors font-bold" onClick={() => setStep(1)}>Abort_Sequence</button>
                            </div>
                        </div>
                    </HolographicCard>
                )}

                {step === 3 && (
                    <div className="space-y-12">
                        <div className="flex items-center gap-6 px-4">
                            <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                                <Briefcase className="w-6 h-6 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Allocation Pipeline</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Active Credit Node Status</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                        {applications?.map((app: any, idx: number) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={app.id}
                            >
                                <HolographicCard className="p-10 flex flex-col md:flex-row group border-l-4 border-transparent hover:border-indigo-500">
                                    <div className="flex-1 flex flex-col justify-between pr-10">
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <Badge className="bg-white/5 text-slate-500 border border-white/10 text-[9px] font-black tracking-[0.4em] uppercase mb-4 px-4 py-1.5 rounded-full italic">NODE_REF: {app.application_reference}</Badge>
                                                <h4 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">₦{parseFloat(app.requested_amount).toLocaleString()}</h4>
                                            </div>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                            <div className="space-y-2">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] italic">Horizon</p>
                                                <p className="text-xl font-black text-white italic">{app.requested_tenor_months} Months</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] italic">Probability</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <p className="text-xl font-black text-emerald-400 italic">High</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] italic">Handshake</p>
                                                <p className="text-sm font-black text-slate-400 italic">{format(new Date(app.submitted_at), 'MMM dd // HH:mm')}</p>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                 <button className="h-16 w-16 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all shadow-2xl">
                                                    <ChevronRight className="h-8 w-8" />
                                                 </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "md:w-3 flex-shrink-0 rounded-full opacity-60 group-hover:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                                        app.status === 'REJECTED' ? 'bg-rose-600' : app.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-indigo-600 animate-pulse'
                                    )} />
                                </HolographicCard>
                            </motion.div>
                        ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Strategic Area */}
            <div className="lg:col-span-4 space-y-12">
                <SentientFrame intent="neutral" title="Neural Life Path" subtitle="Cognitive Credit Impact Analysis">
                    <GenerativeLifePath previewAmount={previewAmount} />
                </SentientFrame>

                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Mandatory_Thresholds</span>
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    </div>
                    <HolographicCard className="p-10 space-y-10">
                        <div className="space-y-6">
                            <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Max_Exposure (DTI)</p>
                                <p className="text-3xl font-black text-white italic tracking-tighter uppercase">33.3% <span className="text-[10px] text-slate-700 font-bold ml-2">CBN_LIMIT</span></p>
                            </div>
                            <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Min_Repayment_Prob</p>
                                <p className="text-3xl font-black text-white italic tracking-tighter uppercase">0.92 <span className="text-[10px] text-slate-700 font-bold ml-2">LATTICE_SCORE</span></p>
                            </div>
                        </div>
                        <div className="p-6 bg-emerald-500/5 rounded-[24px] border border-emerald-500/10 flex items-center gap-5">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-[0.2em] italic">Cognitive_Shield_Active</p>
                        </div>
                    </HolographicCard>
                </div>
            </div>
        </div>

        {/* Floating Credit HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Appraisal_Load</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">142 Active Sessions</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Target className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Approval_Velocity</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">4.2ms Node Latency</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Neural_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Credit_OS_v4.2</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default LoanOrigination;
