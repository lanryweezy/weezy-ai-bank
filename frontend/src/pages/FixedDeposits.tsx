import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Plus, ArrowUpRight, TrendingUp, Clock, ShieldCheck, RefreshCw, AlertTriangle, Wallet } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const FixedDeposits = () => {
  const [isBooking, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
      product_id: 0,
      principal_amount: '',
      linked_savings_account: '9990011223', // Demo
      rollover_instruction: 'LIQUIDATE'
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['fdProducts'],
    queryFn: () => apiClient('/corebanking/investments/fd/products'),
  });

  const { data: myFds, refetch: refetchMyFds } = useQuery({
    queryKey: ['myFixedDeposits'],
    queryFn: () => apiClient('/corebanking/investments/fd/me'),
  });

  const bookFdMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/investments/fd/book', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Fixed Deposit booked successfully!');
      setIsCreating(false);
      refetchMyFds();
    },
    onError: (err: any) => toast.error(err.message || 'Booking failed'),
  });

  const liquidateMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/corebanking/investments/fd/${id}/liquidate`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Early liquidation processed. Funds sent to savings.');
      refetchMyFds();
    },
  });

  const handleBook = () => {
      if(!formData.product_id || !formData.principal_amount) {
          toast.error("Please select a product and enter an amount.");
          return;
      }
      bookFdMutation.mutate({
          ...formData,
          principal_amount: parseFloat(formData.principal_amount)
      });
  };

  if (loadingProducts) return <Layout><div className="p-10 text-center font-bold text-slate-400">Syncing Investment Core...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                FIXED VAULT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><PiggyBank className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">High-Yield Term Deposits & Automated Wealth Accumulation.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Book New Investment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Active Investments */}
           <div className="lg:col-span-2 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Portfolio</h3>
              <div className="space-y-6">
                {myFds?.length > 0 ? (
                    myFds.map((fd: any) => (
                        <Card key={fd.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <Badge className="bg-indigo-50 text-indigo-700 border-none text-[9px] font-black tracking-widest uppercase mb-2">ACTIVE INVESTMENT</Badge>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{fd.fd_account_number}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Yield Rate</p>
                                            <div className="bg-emerald-50 px-3 py-1 rounded-lg">
                                                <p className="text-sm font-black text-emerald-600">{fd.interest_rate_applied}% P.A.</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Principal</p>
                                            <p className="text-lg font-black text-slate-900">₦{parseFloat(fd.principal_amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Accrued</p>
                                            <p className="text-lg font-black text-indigo-600">+₦{parseFloat(fd.accrued_interest).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Booked</p>
                                            <p className="text-sm font-bold text-slate-700">{format(new Date(fd.booking_date), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Maturity</p>
                                            <p className="text-sm font-bold text-slate-700">{format(new Date(fd.maturity_date), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/60">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            <p className="text-[10px] text-slate-500 font-medium">Automatic {fd.rollover_instruction.replace('_', ' ')} on maturity.</p>
                                        </div>
                                        <Button variant="ghost" className="h-9 px-4 rounded-xl text-rose-600 font-black text-[9px] uppercase tracking-widest hover:bg-rose-50" onClick={() => liquidateMutation.mutate(fd.id)} disabled={liquidateMutation.isPending}>
                                            Terminate Early
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-indigo-600 md:w-3 flex flex-shrink-0" />
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm inline-block mb-6 ring-1 ring-slate-100">
                            <TrendingUp className="h-12 w-12 text-slate-200" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">No Active Investments</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">Lock your idle funds into high-interest fixed deposits to outpace inflation.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Products & Booking Sidebar */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Market Opportunities</h3>
              <div className="space-y-4">
                  {products?.map((prod: any) => (
                      <Card key={prod.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group hover:ring-indigo-600/30 transition-all">
                          <CardContent className="p-6">
                              <div className="flex justify-between items-center mb-4">
                                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                      <TrendingUp className="h-5 w-5" />
                                  </div>
                                  <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px]">{prod.interest_rate_pa}% P.A.</Badge>
                              </div>
                              <h5 className="font-black text-slate-900 tracking-tight">{prod.name}</h5>
                              <div className="flex items-center gap-2 mt-2">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{prod.tenor_days} DAYS TENOR</p>
                              </div>
                              <Button variant="ghost" className="w-full mt-6 h-11 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:border-none transition-all" onClick={() => { setFormData({...formData, product_id: prod.id}); setIsCreating(true); }}>
                                Invest Now
                              </Button>
                          </CardContent>
                      </Card>
                  ))}
              </div>

              <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <CardHeader className="p-8 pb-4 relative z-10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Vault Security</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 relative z-10">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">
                        "Fixed deposits are NDIC insured. Early liquidation attracts a 50% penalty on the accrued interest. All principal is always guaranteed."
                    </p>
                    <div className="mt-6 flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 mr-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">NDIC PROTECTED</span>
                    </div>
                </CardContent>
              </Card>
           </div>
        </div>

        {/* Booking Modal */}
        {isBooking && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <PiggyBank className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Invest Capital</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Provisioning Term Deposit</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Investment Product</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({...formData, product_id: parseInt(e.target.value)})}
                                >
                                    <option value={0}>Select a plan...</option>
                                    {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.interest_rate_pa}%)</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Booking Amount (₦)</Label>
                                <Input placeholder="Min 100,000" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-indigo-600 text-xl" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Maturity Instruction</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    value={formData.rollover_instruction}
                                    onChange={(e) => setFormData({...formData, rollover_instruction: e.target.value})}
                                >
                                    <option value="LIQUIDATE">Liquidate to Savings</option>
                                    <option value="ROLLOVER_PRINCIPAL">Rollover Principal Only</option>
                                    <option value="ROLLOVER_PRINCIPAL_INTEREST">Rollover Principal + Interest</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none" onClick={handleBook} disabled={bookFdMutation.isPending}>
                            {bookFdMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Booking'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default FixedDeposits;
