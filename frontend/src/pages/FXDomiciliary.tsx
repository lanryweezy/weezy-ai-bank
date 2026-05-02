import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowRightLeft, TrendingUp, DollarSign, Euro, PoundSterling, Activity, RefreshCw, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const currencyIcons: any = {
    'USD': <DollarSign className="h-5 w-5" />,
    'EUR': <Euro className="h-5 w-5" />,
    'GBP': <PoundSterling className="h-5 w-5" />,
    'NGN': <span className="font-bold text-lg">₦</span>
};

const FXDomiciliary = () => {
  const [isOpeningAccount, setIsOpeningAccount] = useState(false);
  const [swapData, setSwapData] = useState({ source: 'NGN', target: 'USD', amount: '' });

  const { data: rates, isLoading: loadingRates } = useQuery({
    queryKey: ['fxRates'],
    queryFn: () => apiClient('/fx/rates'),
    refetchInterval: 60000,
  });

  const { data: domAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['myDomAccounts'],
    queryFn: () => apiClient('/fx/accounts/me'),
  });

  const openAccountMutation = useMutation({
    mutationFn: (currency: string) => apiClient('/fx/accounts/open', { method: 'POST', body: JSON.stringify({ currency }) }),
    onSuccess: () => {
      toast.success('Domiciliary account opened successfully!');
      setIsOpeningAccount(false);
      refetchAccounts();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to open account'),
  });

  const swapMutation = useMutation({
    mutationFn: (data: any) => apiClient('/fx/swap', { 
        method: 'POST', 
        body: JSON.stringify({ 
            source_currency: data.source, 
            target_currency: data.target, 
            amount: parseFloat(data.amount) 
        }) 
    }),
    onSuccess: () => {
      toast.success('Currency swap completed instantly!');
      setSwapData({ ...swapData, amount: '' });
      refetchAccounts();
    },
    onError: (err: any) => toast.error(err.message || 'Swap failed'),
  });

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                GLOBAL VAULT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Globe className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Multi-currency Domiciliary Accounts & Instant FX Settlement.</p>
          </div>
          <Button onClick={() => setIsOpeningAccount(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Open New Dom Account
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* DOM Accounts Column */}
           <div className="lg:col-span-2 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">International Balances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {domAccounts?.length > 0 ? (
                    domAccounts.map((acc: any) => (
                        <Card key={acc.id} className="group border-none shadow-2xl ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity group-hover:scale-110 duration-700">
                                {currencyIcons[acc.currency]}
                            </div>
                            <CardHeader className="pb-2 p-8">
                                <div className="flex justify-between items-center">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase">{acc.currency}</Badge>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Verified</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-slate-50 rounded-[24px] text-slate-400 border border-slate-100/60 shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-500">
                                        {currencyIcons[acc.currency]}
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Account Balance</p>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{acc.currency === 'USD' ? '$' : acc.currency === 'EUR' ? '€' : '£'}{parseFloat(acc.balance).toLocaleString()}</h3>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t border-slate-100/60 py-3 px-8">
                                <Button variant="link" className="p-0 h-auto text-[10px] text-indigo-600 font-black uppercase tracking-widest hover:no-underline">International Transfer →</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="md:col-span-2 py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm inline-block mb-6 ring-1 ring-slate-100">
                            <Globe className="h-12 w-12 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">No Global Assets Found</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">Open a domiciliary account to save and transact in foreign currencies.</p>
                    </div>
                )}
              </div>

              {/* FX Rates Table */}
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 pt-4">Market Liquidity</h3>
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-emerald-500" /> Live Exchange Grid
                    </CardTitle>
                    <CardDescription className="font-medium">Indicative market rates (Base: NGN).</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="space-y-4">
                        {rates?.map((r: any) => (
                            <div key={r.target_currency} className="group flex items-center justify-between p-5 rounded-[24px] border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {currencyIcons[r.target_currency]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 tracking-tight">{r.target_currency} <span className="text-slate-300 font-normal mx-1">/</span> NGN</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time Spot</p>
                                    </div>
                                </div>
                                <div className="flex gap-12 text-right">
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Buy at</p>
                                        <p className="text-lg font-mono font-black text-emerald-600">₦{parseFloat(r.buy_rate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Sell at</p>
                                        <p className="text-lg font-mono font-black text-rose-600">₦{parseFloat(r.sell_rate).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Swap Column */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Settlement Engine</h3>
              <Card className="border-none shadow-2xl ring-1 ring-indigo-500/20 rounded-[32px] overflow-hidden bg-white">
                <div className="bg-indigo-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                        <ArrowRightLeft className="h-20 w-20" />
                    </div>
                    <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                        <ArrowRightLeft className="h-5 w-5" /> CURRENCY SWAP
                    </CardTitle>
                    <CardDescription className="text-indigo-100 font-medium opacity-80 mt-1 uppercase text-[9px] tracking-widest">Instant Liquidity Bridge</CardDescription>
                </div>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Source (Sell)</Label>
                        <div className="relative">
                            <Input value={swapData.amount} onChange={e => setSwapData({...swapData, amount: e.target.value})} placeholder="0.00" className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-xl font-black text-slate-900 shadow-inner" />
                            <Badge className="absolute right-4 top-4 h-8 px-4 bg-white text-slate-900 border border-slate-100 font-black text-[10px]">NGN</Badge>
                        </div>
                    </div>
                    
                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-200 cursor-pointer hover:rotate-180 transition-transform duration-700 active:scale-90">
                            <ArrowRightLeft className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target (Receive)</Label>
                        <div className="relative">
                            <Input value={swapData.amount ? (parseFloat(swapData.amount) / 1465).toFixed(2) : '0.00'} readOnly className="h-16 rounded-2xl bg-indigo-50/30 border-none px-6 text-xl font-black text-indigo-600 shadow-inner" />
                            <Badge className="absolute right-4 top-4 h-8 px-4 bg-indigo-600 text-white border-none font-black text-[10px]">USD</Badge>
                        </div>
                    </div>
                    
                    <div className="pt-6">
                        <div className="flex justify-between items-center mb-6 px-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exchange Rate</span>
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg">1 USD = ₦1,465.00</span>
                        </div>
                        <Button className="w-full bg-indigo-600 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 active:scale-95 transition-all text-white border-none" onClick={() => swapMutation.mutate(swapData)} disabled={swapMutation.isPending || !swapData.amount}>
                            {swapMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3 text-white" /> : <ShieldCheck className="h-5 w-5 mr-3 text-white" />} 
                            Execute Swap
                        </Button>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                 <CardHeader className="p-8 pb-4 relative z-10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Compliance Protocol</CardTitle>
                 </CardHeader>
                 <CardContent className="px-8 pb-8 relative z-10 text-white">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        "Domiciliary inflows are processed via SWIFT/NIP. Max daily cash withdrawal: $10,000. All FX transactions are reported to CBN daily."
                    </p>
                    <div className="mt-6 flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 mr-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Regulatory Guard Active</span>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Open Account Modal Placeholder */}
        {isOpeningAccount && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center justify-center gap-3">
                            <Globe className="h-7 w-7" /> OPEN DOM ACCOUNT
                        </CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 uppercase text-[9px] tracking-widest">Multi-currency Provisioning</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {['USD', 'EUR', 'GBP'].map(ccy => (
                                <Button 
                                    key={ccy}
                                    variant="outline" 
                                    className="h-28 flex flex-col gap-3 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                                    onClick={() => openAccountMutation.mutate(ccy)}
                                    disabled={openAccountMutation.isPending}
                                >
                                    <div className="p-3 bg-slate-50 rounded-full text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {currencyIcons[ccy]}
                                    </div>
                                    <span className="font-black text-[10px] uppercase tracking-widest">{ccy}</span>
                                </Button>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-slate-400 mt-4" onClick={() => setIsOpeningAccount(false)}>Cancel Request</Button>
                    </CardContent>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default FXDomiciliary;
