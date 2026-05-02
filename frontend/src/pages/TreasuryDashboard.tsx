import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plus, ArrowUpRight, TrendingUp, ShieldCheck, RefreshCw, Activity, AlertTriangle, LineChart, Cpu, DollarSign, Wallet } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

  if (loadingPos) return <Layout><div className="p-10 text-center font-bold text-slate-400">Syncing Treasury Core...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                TREASURY CORE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Landmark className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Liquidity Management, Interbank Placements & AI Forecasting.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => forecastMutation.mutate()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <Cpu className="mr-2 h-4 w-4" /> AI Forecast
            </Button>
            <Button onClick={() => setIsBooking(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <Plus className="mr-2 h-4 w-4" /> New Placement
            </Button>
          </div>
        </div>

        {/* Global Liquidity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`border-none shadow-xl ring-1 rounded-[32px] overflow-hidden group transition-all duration-500 ${position?.is_compliant ? 'bg-emerald-600 ring-emerald-500/20' : 'bg-rose-600 ring-rose-500/20'} text-white`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Activity className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 p-8 relative z-10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80">Liquidity Ratio (LR)</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="text-5xl font-black tracking-tighter drop-shadow-md">
                        {position?.liquidity_ratio}%
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-2 opacity-60">CBN MIN: 30.0% • {position?.is_compliant ? 'COMPLIANT' : 'CRITICAL'}</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liquid Assets</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-black text-slate-900">₦{parseFloat(position?.bank_liquid_assets || 0).toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <Wallet className="h-3 w-3 text-indigo-500" />
                        <p className="text-[10px] text-slate-400 font-medium italic">Vault + CBN + Nostro</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cust. Deposits</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-black text-slate-900">₦{parseFloat(position?.customer_liabilities || 0).toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="h-3 w-3 text-rose-500" />
                        <p className="text-[10px] text-slate-400 font-medium italic">Demand Liabilities</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Active Placements */}
            <div className="lg:col-span-3 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Allocation (Placements)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {investments?.interbank_placements?.map((plm: any) => (
                        <Card key={plm.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Badge className="bg-indigo-50 text-indigo-700 border-none text-[8px] font-black tracking-widest uppercase mb-2">INTERBANK DEPOSIT</Badge>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{plm.counterparty_bank_name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Rate</p>
                                        <p className="text-sm font-black text-emerald-600">{plm.interest_rate_pa}% P.A.</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-end border-b border-slate-50 pb-6 mb-6">
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Principal</p>
                                        <p className="text-2xl font-black text-slate-900">₦{parseFloat(plm.principal_amount).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Due</p>
                                        <p className="text-xs font-bold text-slate-600">{format(new Date(plm.maturity_date), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{plm.status}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-mono font-bold">{plm.deal_reference}</p>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {investments?.interbank_placements?.length === 0 && (
                        <div className="md:col-span-2 py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">No Placements Found</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2">The bank has not placed liquidity with other institutions yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Strategic Side */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Treasury Intelligence</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <Cpu className="h-4 w-4" /> Liquidity Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white space-y-6">
                        {latestForecast ? (
                            <>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Confidence Score</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full" style={{ width: `${latestForecast.confidence_score * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-black">{Math.round(latestForecast.confidence_score * 100)}%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Strategy</p>
                                    <p className="text-sm font-black italic text-indigo-300">"{latestForecast.ai_report_json?.recommendation}"</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-slate-500 italic">No forecast generated today.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Market Pulse
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "MPC just raised interest rates. We recommend adjusting interbank lending rates to 14.5% for 30-day tenors to maintain alpha."
                    </p>
                </div>
            </div>
        </div>

        {/* Booking Modal */}
        {isBooking && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <LineChart className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Placement Deal</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Interbank Asset Swap Protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Bank Code</Label>
                                    <Input placeholder="e.g. 058" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" value={formData.counterparty_bank_code} onChange={e => setFormData({...formData, counterparty_bank_code: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Name</Label>
                                    <Input placeholder="GTBank" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" value={formData.counterparty_bank_name} onChange={e => setFormData({...formData, counterparty_bank_name: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Principal Amount (₦)</Label>
                                <Input placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-indigo-600 text-xl" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rate (% P.A)</Label>
                                    <Input placeholder="12.50" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" value={formData.interest_rate_pa} onChange={e => setFormData({...formData, interest_rate_pa: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tenor (Days)</Label>
                                    <Input placeholder="30" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" value={formData.tenor_days} onChange={e => setFormData({...formData, tenor_days: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsBooking(false)}>Cancel Deal</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none" onClick={handleBook} disabled={bookMutation.isPending}>
                            {bookMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm & Settle'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default TreasuryDashboard;
