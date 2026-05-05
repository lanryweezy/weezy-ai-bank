import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plus, ArrowUpRight, TrendingUp, ShieldCheck, RefreshCw, Activity, AlertTriangle, LineChart, Cpu, DollarSign, Wallet, Globe, Database, Smartphone, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const TreasuryDashboard = () => {
  const [isBooking, setIsBooking] = useState(false);
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

  if (loadingPos) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Treasury Core...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Treasury Core <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Landmark className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> High-Performance Liquidity & Interbank Orchestration
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => forecastMutation.mutate()} className="rounded-2xl h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                <Cpu className="mr-3 h-5 w-5 text-indigo-400" /> Neural Forecast
            </Button>
            <Button onClick={() => setIsBooking(true)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
                <Plus className="mr-3 h-5 w-5" /> New Asset Placement
            </Button>
          </div>
        </div>

        {/* Global Liquidity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`border-none shadow-2xl rounded-[40px] overflow-hidden group transition-all duration-700 relative p-10 flex flex-col justify-between h-[280px] ${position?.is_compliant ? 'bg-emerald-600/20 ring-1 ring-emerald-500/40' : 'bg-red-600/20 ring-1 ring-red-500/40'}`}>
                <div className="absolute inset-0 shimmer opacity-10 pointer-events-none" />
                <div className="flex justify-between items-start relative z-10">
                    <div className={`p-4 rounded-2xl border ${position?.is_compliant ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
                         <Activity className="h-8 w-8" />
                    </div>
                    <Badge className="bg-white text-black border-none font-black text-[9px] px-3 tracking-widest uppercase">Ratio (LR)</Badge>
                </div>
                <div className="relative z-10">
                    <h3 className="text-6xl font-black italic tracking-tighter text-white">{position?.liquidity_ratio}%</h3>
                    <p className="text-[10px] font-black uppercase mt-3 tracking-[0.3em] text-slate-400">CBN MIN: 30.0% • {position?.is_compliant ? 'COMPLIANT' : 'CRITICAL'}</p>
                </div>
            </Card>

            <Card className="obsidian-card p-10 flex flex-col justify-between h-[280px] group">
                <div className="flex justify-between items-start">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                        <Wallet className="h-8 w-8" />
                     </div>
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Liquid Assets</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">₦{parseFloat(position?.bank_liquid_assets || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-3 uppercase tracking-widest italic">Vault + CBN + Nostro Nodes</p>
                </div>
            </Card>

            <Card className="obsidian-card p-10 flex flex-col justify-between h-[280px] group">
                <div className="flex justify-between items-start">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-400 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-8 w-8 text-red-400" />
                     </div>
                     <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[9px] px-3 tracking-widest">LIABILITIES</Badge>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Customer Deposits</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">₦{parseFloat(position?.customer_liabilities || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-3 uppercase tracking-widest italic">Net Demand Flow</p>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Active Placements */}
            <div className="lg:col-span-3 space-y-10">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Asset Allocation Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {investments?.interbank_placements?.map((plm: any) => (
                        <Card key={plm.id} className="obsidian-card border-none hover:border-indigo-500/30 transition-all duration-700 overflow-hidden group shadow-2xl">
                            <div className="p-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">INTERBANK ASSET</Badge>
                                        <h4 className="text-2xl font-black text-white tracking-tighter italic uppercase">{plm.counterparty_bank_name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 font-black uppercase mb-1 italic">Yield</p>
                                        <p className="text-lg font-black text-emerald-400 italic tracking-tighter">{plm.interest_rate_pa}% P.A.</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-8 mb-8">
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic opacity-60">Principal</p>
                                        <p className="text-xl font-black text-white tracking-tighter italic">₦{parseFloat(plm.principal_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic opacity-60">Maturity</p>
                                        <p className="text-sm font-black text-slate-300 uppercase italic">{format(new Date(plm.maturity_date), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plm.status}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-mono font-black tracking-widest italic">{plm.deal_reference}</p>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {(!investments?.interbank_placements || investments.interbank_placements.length === 0) && (
                        <div className="md:col-span-2 py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                            <Activity className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
                            <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Inventory Dry</h4>
                            <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-60 max-w-sm mx-auto">No interbank liquidity placements detected in the current node cycle.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Strategic Side */}
            <div className="space-y-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Treasury Intel</h3>
                <Card className="obsidian-card bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/10 overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 flex items-center gap-4 italic">
                            <Cpu className="h-5 w-5" /> Neural Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-10 pb-12 relative z-10 text-white space-y-10">
                        {latestForecast ? (
                            <>
                                <div className="p-6 glass-dark rounded-[32px] border border-white/5">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-3 italic">Confidence Model</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                            <div className="bg-indigo-600 h-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" style={{ width: `${latestForecast.confidence_score * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-black italic">{Math.round(latestForecast.confidence_score * 100)}%</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[9px] text-slate-500 font-black uppercase italic tracking-widest">Active Recommendation</p>
                                    <p className="text-lg font-medium italic text-slate-300 leading-tight">"{latestForecast.ai_report_json?.recommendation || 'Diversify interbank placements to Tier-2 nodes to capture 14.2% spread.'}"</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-600 italic font-medium">Core awaiting liquidity stream to generate predictive forecast.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-red-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-4 italic">
                        <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin-slow" /> Market Vector
                    </h4>
                    <p className="text-sm text-slate-400 italic leading-relaxed font-medium relative z-10">
                        "MPC increased MPR by 50bps. Adjusting interbank corridors to 14.50% to maintain net interest margin alpha."
                    </p>
                </div>
            </div>
        </div>

        {/* Booking Modal (Luxury Overlay) */}
        {isBooking && (
             <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
                <Card className="w-full max-w-xl obsidian-card border-indigo-500/20 overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.1)] rounded-[60px]">
                    <CardHeader className="p-14 border-b border-white/5 bg-indigo-600 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-20 rotate-12">
                            <LineChart className="h-24 w-24" />
                        </div>
                        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
                        <CardTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">Book Placement</CardTitle>
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.5em] mt-4 italic opacity-80">Interbank Liquidity Settlement</CardDescription>
                    </CardHeader>
                    <CardContent className="p-14 space-y-10">
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Counterparty Code</Label>
                                    <Input placeholder="e.g. 058" className="h-16 rounded-3xl bg-white/5 border border-white/5 px-8 font-black text-white italic focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all uppercase text-lg shadow-2xl" value={formData.counterparty_bank_code} onChange={e => setFormData({...formData, counterparty_bank_code: e.target.value})} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Institution Name</Label>
                                    <Input placeholder="GTBank" className="h-16 rounded-3xl bg-white/5 border border-white/5 px-8 font-black text-white italic focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all uppercase text-lg shadow-2xl" value={formData.counterparty_bank_name} onChange={e => setFormData({...formData, counterparty_bank_name: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-3 text-left">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Principal Value (₦)</Label>
                                <Input placeholder="0.00" className="h-20 rounded-[32px] bg-white/5 border border-white/5 px-10 font-black text-indigo-400 text-3xl shadow-2xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 tracking-tighter italic" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-3 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Yield Rate (% P.A)</Label>
                                    <Input placeholder="12.50" className="h-16 rounded-3xl bg-white/5 border border-white/5 px-8 font-black text-emerald-400 italic text-xl shadow-2xl" value={formData.interest_rate_pa} onChange={e => setFormData({...formData, interest_rate_pa: e.target.value})} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Tenor (Days)</Label>
                                    <Input placeholder="30" className="h-16 rounded-3xl bg-white/5 border border-white/5 px-8 font-black text-white italic text-xl shadow-2xl" value={formData.tenor_days} onChange={e => setFormData({...formData, tenor_days: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 flex gap-6">
                            <button className="flex-1 h-20 rounded-[32px] font-black text-[11px] uppercase tracking-widest text-slate-600 hover:text-white transition-all italic" onClick={() => setIsBooking(false)}>Abort Deal</button>
                            <Button className="flex-[2] bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all text-white border-none" onClick={handleBook} disabled={bookMutation.isPending}>
                                {bookMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                                EXECUTE DEAL
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}
    </div>
  );
};

export default TreasuryDashboard;
