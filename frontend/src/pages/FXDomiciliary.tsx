import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowRightLeft, TrendingUp, DollarSign, Euro, PoundSterling, Activity, RefreshCw, Plus, ShieldCheck } from 'lucide-react';
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
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                FX & Global Banking <Globe className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Manage domiciliary accounts and instant currency swaps.</p>
          </div>
          <Button onClick={() => setIsOpeningAccount(true)} className="bg-indigo-600">
            <Plus className="mr-2 h-4 w-4" /> Open Dom Account
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* DOM Accounts Column */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Domiciliary Balances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domAccounts?.length > 0 ? (
                    domAccounts.map((acc: any) => (
                        <Card key={acc.id} className="border-none shadow-sm ring-1 ring-gray-200 hover:scale-[1.02] transition-all overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                {currencyIcons[acc.currency]}
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-none font-mono">{acc.currency}</Badge>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Verified Dom</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
                                        {currencyIcons[acc.currency]}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Available Balance</p>
                                        <h3 className="text-2xl font-bold">{acc.currency === 'USD' ? '$' : acc.currency === 'EUR' ? '€' : '£'}{parseFloat(acc.balance).toLocaleString()}</h3>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t py-2">
                                <Button variant="link" className="p-0 h-auto text-[10px] text-indigo-600 font-bold">Transfer Abroad →</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="md:col-span-2 py-20 text-center border-2 border-dashed rounded-3xl bg-gray-50/50">
                        <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 italic">No domiciliary accounts active. Open one to save in USD/EUR/GBP.</p>
                    </div>
                )}
              </div>

              {/* FX Rates Table */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" /> Live Exchange Rates
                    </CardTitle>
                    <CardDescription>Weezy Bank competitive market rates (NGN Base).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {rates?.map((r: any) => (
                            <div key={r.target_currency} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                        {currencyIcons[r.target_currency]}
                                    </div>
                                    <p className="text-sm font-bold">{r.target_currency} / NGN</p>
                                </div>
                                <div className="flex gap-8 text-right">
                                    <div>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">We Buy</p>
                                        <p className="text-sm font-mono font-bold text-green-600">₦{parseFloat(r.buy_rate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">We Sell</p>
                                        <p className="text-sm font-mono font-bold text-red-600">₦{parseFloat(r.sell_rate).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Swap Column */}
           <div className="space-y-6">
              <Card className="border-none shadow-xl ring-1 ring-indigo-200 overflow-hidden">
                <div className="bg-indigo-600 p-4 text-white">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" /> Instant Currency Swap
                    </CardTitle>
                </div>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs uppercase text-gray-400">Sell</Label>
                        <div className="flex gap-2">
                            <Input value={swapData.amount} onChange={e => setSwapData({...swapData, amount: e.target.value})} placeholder="0.00" className="text-lg font-bold" />
                            <Badge className="h-10 px-4 bg-gray-100 text-gray-700 hover:bg-gray-100 border-none cursor-pointer">NGN</Badge>
                        </div>
                    </div>
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white p-2 rounded-full border shadow-sm cursor-pointer hover:rotate-180 transition-transform duration-500">
                            <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs uppercase text-gray-400">Receive (Estimated)</Label>
                        <div className="flex gap-2">
                            <Input value={swapData.amount ? (parseFloat(swapData.amount) / 1465).toFixed(2) : '0.00'} readOnly className="text-lg font-bold bg-gray-50" />
                            <Badge className="h-10 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none cursor-pointer">USD</Badge>
                        </div>
                    </div>
                    <div className="pt-4">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-4 px-1">
                            <span>Indicative Rate</span>
                            <span className="font-bold text-gray-600">1 USD = ₦1,465.00</span>
                        </div>
                        <Button className="w-full bg-indigo-600 h-12 shadow-lg shadow-indigo-100" onClick={() => swapMutation.mutate(swapData)} disabled={swapMutation.isPending || !swapData.amount}>
                            {swapMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />} Confirm Swap
                        </Button>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Compliance Note</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        "Dom account transactions are subject to CBN FX guidelines. Maximum daily cash withdrawal: $10,000. All inflows are instantly available for swap or transfer."
                    </p>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Open Account Modal Placeholder */}
        {isOpeningAccount && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle>Open Domiciliary Account</CardTitle>
                        <CardDescription>Start saving and transacting in foreign currency.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {['USD', 'EUR', 'GBP'].map(ccy => (
                                <Button 
                                    key={ccy}
                                    variant="outline" 
                                    className="h-24 flex flex-col gap-2 hover:border-indigo-600 hover:bg-indigo-50"
                                    onClick={() => openAccountMutation.mutate(ccy)}
                                    disabled={openAccountMutation.isPending}
                                >
                                    <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                        {currencyIcons[ccy]}
                                    </div>
                                    <span className="font-bold text-xs">{ccy} Account</span>
                                </Button>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full" onClick={() => setIsOpeningAccount(false)}>Cancel</Button>
                    </CardContent>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default FXDomiciliary;
