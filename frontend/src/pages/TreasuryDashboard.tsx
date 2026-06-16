import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, 
  Plus, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  LineChart, 
  Cpu, 
  DollarSign, 
  Wallet, 
  Globe, 
  Database, 
  Smartphone, 
  X,
  Target,
  Compass,
  LayoutTemplate,
  FastForward,
  Play,
  Scale,
  Zap,
  Globe2,
  BrainCircuit,
  Microscope,
  Gauge,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import ThinkingStream from '@/components/ui/ThinkingStream';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const TreasuryDashboard = () => {
  const [isBooking, setIsBooking] = useState(false);
  const [stressLevel, setStressLevel] = useState([0]);
  const [isStressing, setIsStressing] = useState(false);
  
  const [formData, setFormData] = useState({
      placement_type: 'LENDING',
      counterparty_bank_code: '',
      counterparty_bank_name: '',
      principal_amount: '',
      currency: 'NGN',
      interest_rate_pa: '12.50',
      tenor_days: '30',
      placement_date: format(new Date(), 'yyyy-MM-dd'),
      maturity_date: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
  });

  const { data: position, isLoading: loadingPos } = useQuery({
    queryKey: ['bankPosition'],
    queryFn: () => apiClient('/corebanking/treasury/position'),
  });

  const { data: investments, refetch: refetchInv } = useQuery({
    queryKey: ['activeInvestments'],
    queryFn: () => apiClient('/corebanking/treasury/investments'),
  });

  const { data: latestForecast } = useQuery({
    queryKey: ['liquidityForecast'],
    queryFn: () => apiClient('/corebanking/treasury/forecast/latest'),
  });

  const bookMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/treasury/placements/book', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Interbank placement booked and settled.');
      setIsBooking(false);
      refetchInv();
    },
    onError: (err: any) => toast.error(err.message || 'Booking failed'),
  });

  const forecastMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/treasury/forecast/generate', { method: 'POST' }),
    onSuccess: () => toast.success('AI Liquidity Forecast generated.'),
  });

  const handleBook = () => {
      bookMutation.mutate({
          ...formData,
          principal_amount: parseFloat(formData.principal_amount),
          interest_rate_pa: parseFloat(formData.interest_rate_pa),
          tenor_days: parseInt(formData.tenor_days)
      });
  };

  const simulatedRatio = useMemo(() => {
    const drain = stressLevel[0] / 100;
    const currentLiabilities = parseFloat(position?.customer_liabilities || 100000000);
    const drainAmount = currentLiabilities * drain;
    const currentAssets = parseFloat(position?.bank_liquid_assets || 30000000);
    const newAssets = Math.max(0, currentAssets - drainAmount);
    return ((newAssets / currentLiabilities) * 100).toFixed(2);
  }, [position, stressLevel]);

  if (loadingPos) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Landmark className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Synchronizing_Treasury_Lattice</div>
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Capital_Reserve_Secure</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Treasury <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Nexus</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Interbank Orchestration // High-Velocity Liquidity v4.8
            </p>
          </div>
          
          <div className="flex gap-6">
              <button 
                onClick={() => forecastMutation.mutate()}
                className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl"
              >
                  <Cpu className="w-5 h-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-700" /> Neural_Forecast
              </button>
              <button 
                onClick={() => setIsBooking(true)} 
                className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
              >
                  <Plus className="w-5 h-5" /> Execute_Asset_Placement
              </button>
          </div>
        </section>

        {/* Global Liquidity Nexus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <HolographicCard className={cn(
                "p-10 min-h-[300px] flex flex-col justify-between group relative overflow-hidden transition-all duration-700",
                parseFloat(simulatedRatio) < 30 ? "ring-2 ring-rose-500/50" : ""
            )}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                        <div className="p-5 rounded-[24px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-all shadow-2xl">
                        <Activity className="h-8 w-8" />
                        </div>
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full animate-ping shadow-[0_0_15px]",
                            parseFloat(simulatedRatio) < 30 ? "bg-rose-500 shadow-rose-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                        )} />
                </div>
                <div className="mt-12 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 italic">Liquidity_Ratio (LR)</p>
                    <h3 className={cn(
                        "text-7xl font-black italic tracking-tighter transition-all duration-700",
                        parseFloat(simulatedRatio) < 30 ? "text-rose-500" : "text-white"
                    )}>{simulatedRatio}%</h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-4 uppercase tracking-widest italic">CBN MIN: 30.0% // {parseFloat(simulatedRatio) < 30 ? 'CRITICAL_RATIO' : 'SYNCHRONIZED'}</p>
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
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 italic">Bank_Liquid_Assets</p>
                    <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">₦{parseFloat(position?.bank_liquid_assets || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-indigo-400 font-black mt-4 uppercase tracking-widest italic">Vault + Nostro + Reserve Nodes</p>
                </div>
            </HolographicCard>

            <HolographicCard className="p-10 min-h-[300px] flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                        <div className="p-5 rounded-[24px] bg-rose-600/10 border border-rose-500/20 text-rose-400 group-hover:scale-110 transition-all shadow-2xl">
                        <TrendingUp className="h-8 w-8 rotate-180" />
                        </div>
                        <Badge className="bg-rose-600 text-white border-none font-black text-[9px] px-4 py-1 tracking-widest rounded-full uppercase italic">LIABILITIES</Badge>
                </div>
                <div className="mt-12">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 italic">Net_Deposit_Exposure</p>
                    <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">₦{parseFloat(position?.customer_liabilities || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-4 uppercase tracking-widest italic">Current Demand Floor</p>
                </div>
            </HolographicCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Active Placements Matrix */}
            <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                            <LayoutTemplate className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Asset Allocation Matrix</h3>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Interbank Liquidity Nodes</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {investments?.interbank_placements?.map((plm: any, idx: number) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={plm.id}>
                            <HolographicCard className="p-10 flex flex-col h-full group hover:border-indigo-500/30">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-4">
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic">ASSET_BLOCK</Badge>
                                        <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">{plm.counterparty_bank_name}</h4>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Net_Yield</p>
                                        <p className="text-2xl font-black text-emerald-400 italic tracking-tighter leading-none">{plm.interest_rate_pa}%</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-10 mb-10">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Principal_Value</p>
                                        <p className="text-2xl font-black text-white tracking-tighter italic">₦{(parseFloat(plm.principal_amount) / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Maturity_Node</p>
                                        <p className="text-sm font-black text-slate-300 uppercase italic">{format(new Date(plm.maturity_date), 'MMM dd // yyyy')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{plm.status}</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-700 group-hover:text-indigo-400 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </HolographicCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* AI Strategic Area */}
            <div className="lg:col-span-4 space-y-12">
                <SentientFrame intent="risk" title="Liquidity Stress Nexus" subtitle="Modeling Extreme Withdrawal Scenarios">
                    <div className="space-y-10 p-2">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Microscope className="w-4 h-4 text-rose-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Mass_Withdrawal_Simulation</span>
                                </div>
                                <span className="text-[10px] font-black text-rose-500">{stressLevel}% Drain</span>
                            </div>
                            
                            <Slider 
                                value={stressLevel} 
                                onValueChange={(val) => { setStressLevel(val); setIsStressing(true); setTimeout(() => setIsStressing(false), 800); }}
                                max={50} 
                                step={1} 
                                className="py-4"
                            />
                        </div>
                        
                        <div className="p-8 bg-black/40 border border-white/5 rounded-[32px] space-y-4 shadow-2xl relative overflow-hidden">
                            {isStressing && <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none blur-3xl" />}
                            <div className="flex items-center gap-4">
                                <Gauge className="h-4 w-4 text-slate-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Projected_LR</span>
                            </div>
                            <h3 className={cn(
                                "text-4xl font-black italic tracking-tighter transition-all duration-500",
                                parseFloat(simulatedRatio) < 30 ? "text-rose-500 scale-105" : "text-white"
                            )}>{simulatedRatio}%</h3>
                            <p className="text-[9px] text-slate-500 font-bold italic leading-relaxed">
                                {parseFloat(simulatedRatio) < 30 ? 
                                    <span>"Warning: A {stressLevel}% deposit drain will <span className="text-rose-400">BREACH</span> the CBN 30.0% mandate."</span> : 
                                    <span>"Neural Engine: Ratio remains within regulatory bounds for a {stressLevel}% outflow scenario."</span>
                                }
                            </p>
                        </div>
                    </div>
                </SentientFrame>

                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural_Macro_Radar</span>
                        <Globe2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <HolographicCard className="p-10 space-y-10 bg-gradient-to-br from-indigo-900/10 to-transparent">
                        <div className="flex items-center gap-5">
                            <BrainCircuit className="h-6 w-6 text-indigo-400 animate-pulse" />
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Hedge Optimization</h4>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-400 italic">
                            "Lattice Intelligence: Proactive USD sweep initiated. ₦120M re-allocated to Nostro-Liquid-001 to offset projected MP de-anchoring."
                        </p>
                        <div className="p-6 bg-indigo-500/5 rounded-[24px] border border-indigo-500/10 flex items-center gap-5 shadow-2xl">
                             <TrendingUp className="h-5 w-5 text-indigo-400" />
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Capital Protection Enforced</span>
                        </div>
                    </HolographicCard>
                </div>
            </div>
        </div>

        {/* Deal Forge (Full-screen Overlay) */}
        <AnimatePresence>
            {isBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-[100] flex items-center justify-center p-8">
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
                        <HolographicCard className="w-full max-w-2xl p-16">
                            <div className="space-y-12 relative z-10">
                                <div className="flex items-center justify-between border-b border-white/5 pb-10">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Interbank Forge</h2>
                                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] italic">Liquidity Settlement & Asset Generation protocol</p>
                                    </div>
                                    <div className="bg-indigo-600/10 p-6 rounded-[32px] border border-indigo-500/20">
                                        <FastForward className="h-10 w-10 text-indigo-400" />
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Counterparty_Node</Label>
                                            <Input placeholder="Institution ID..." className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-8 font-black text-xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20" value={formData.counterparty_bank_name} onChange={e => setFormData({...formData, counterparty_bank_name: e.target.value})} />
                                        </div>
                                        <div className="space-y-6">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Asset_Yield (% P.A)</Label>
                                            <Input placeholder="12.50" className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-8 font-black text-2xl text-emerald-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20" value={formData.interest_rate_pa} onChange={e => setFormData({...formData, interest_rate_pa: e.target.value})} />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Principal_Lattice_Value (₦)</Label>
                                        <Input placeholder="0.00" className="h-24 rounded-[40px] bg-white/[0.03] border-white/5 px-12 font-black text-4xl text-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 tracking-tighter" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} />
                                    </div>

                                    <div className="pt-10 flex flex-col gap-6">
                                        <Button 
                                            className="w-full bg-indigo-600 h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 active:scale-95 transition-all text-white border-none" 
                                            onClick={handleBook} 
                                            disabled={bookMutation.isPending}
                                        >
                                            {bookMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-6" /> : <Zap className="h-8 w-8 mr-6 fill-white" />}
                                            EXECUTE_DEAL_SYNTHESIS
                                        </Button>
                                        <button className="w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-white transition-colors font-bold" onClick={() => setIsBooking(false)}>Abort_Negotiation</button>
                                    </div>
                                </div>
                            </div>
                        </HolographicCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Floating Treasury HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Macro_Stream</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Global Handshake Active</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Target className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Target_LR</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Maintain 32.5% CRR</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">CFO_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Treasury_Nexus_v4.8</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default TreasuryDashboard;
