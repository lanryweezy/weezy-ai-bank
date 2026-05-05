import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Plus, ArrowUpRight, TrendingUp, Clock, ShieldCheck, RefreshCw, AlertTriangle, Wallet, FileText, Eye, Cpu, Zap, Activity, Globe, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import InvestmentCertificateModal from '@/components/InvestmentCertificateModal';

const FixedDeposits = () => {
  const [isBooking, setIsCreating] = useState(false);
  const [selectedCertFd, setSelectedCertFd] = useState<any>(null);
  const [formData, setFormData] = useState({
      product_id: 0,
      principal_amount: '',
      linked_savings_account: '',
      rollover_instruction: 'LIQUIDATE'
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => JSON.parse(localStorage.getItem('user') || '{}'),
  });

  const { data: myAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
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
      toast.success('Capital secured in Fixed Vault.');
      setIsCreating(false);
      refetchMyFds();
    },
    onError: (err: any) => toast.error(err.message || 'Booking failed'),
  });

  const liquidateMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/corebanking/investments/fd/${id}/liquidate`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Early liquidation synchronized.');
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

  if (loadingProducts) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Yield Protocols...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Fixed Vault <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><PiggyBank className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Authorized High-Yield Provisioning
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
            <Plus className="mr-3 h-5 w-5" /> Secure Capital
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Active Investments */}
           <div className="lg:col-span-2 space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Asset Portfolio</h3>
              <div className="space-y-8">
                {myFds?.length > 0 ? (
                    myFds.map((fd: any) => (
                        <Card key={fd.id} className="obsidian-card border-none hover:-translate-y-1 transition-all duration-700 group overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-10 flex-1">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="space-y-1">
                                            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1 font-black text-[9px] uppercase tracking-widest rounded-lg">ACTIVE NODE</Badge>
                                            <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase">{fd.fd_account_number}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Sovereign Yield</p>
                                            <div className="bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                                                <p className="text-lg font-black text-emerald-400 tracking-tighter">{fd.interest_rate_applied}% P.A.</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Principal</p>
                                            <p className="text-xl font-black text-white tracking-tighter">₦{parseFloat(fd.principal_amount).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Accrued</p>
                                            <p className="text-xl font-black text-indigo-400 tracking-tighter">+₦{parseFloat(fd.accrued_interest).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Booked</p>
                                            <p className="text-sm font-black text-slate-300 uppercase tracking-tight">{format(new Date(fd.booking_date), 'MMM dd, yyyy')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Maturity</p>
                                            <p className="text-sm font-black text-slate-300 uppercase tracking-tight">{format(new Date(fd.maturity_date), 'MMM dd, yyyy')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 glass-dark rounded-[32px] border border-white/5 shadow-2xl">
                                        <div className="flex items-center gap-4">
                                            <Clock className="h-5 w-5 text-slate-600" />
                                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">Instruction: {fd.rollover_instruction.replace('_', ' ')}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button variant="ghost" className="h-10 px-6 rounded-xl text-indigo-400 font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all" onClick={() => setSelectedCertFd(fd)}>
                                                <Eye className="mr-3 h-4 w-4" /> Certificate
                                            </Button>
                                            <Button variant="ghost" className="h-10 px-6 rounded-xl text-red-400 font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-red-500/10 transition-all" onClick={() => liquidateMutation.mutate(fd.id)} disabled={liquidateMutation.isPending}>
                                                Liquidate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-indigo-600 md:w-4 flex flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                        <Activity className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
                        <h4 className="text-2xl font-black text-slate-700 italic uppercase tracking-tighter">Vault Empty</h4>
                        <p className="text-sm text-slate-500 font-bold mt-3 uppercase tracking-widest opacity-60 max-w-sm mx-auto">Authorize new capital nodes to outpace inflation.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Market Sidebar */}
           <div className="space-y-12">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Yield Protocols</h3>
              <div className="space-y-6">
                  {products?.map((prod: any) => (
                      <Card key={prod.id} className="obsidian-card border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all cursor-pointer shadow-2xl">
                          <CardContent className="p-8">
                              <div className="flex justify-between items-center mb-6">
                                  <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                                      <TrendingUp className="h-6 w-6" />
                                  </div>
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] px-3 tracking-widest rounded-lg">{prod.interest_rate_pa}% P.A.</Badge>
                              </div>
                              <h5 className="text-xl font-black text-white tracking-tighter uppercase italic">{prod.name}</h5>
                              <div className="flex items-center gap-3 mt-3">
                                  <Clock className="h-4 w-4 text-slate-600" />
                                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic">{prod.tenor_days} DAYS LOCK</p>
                              </div>
                              <Button variant="ghost" className="w-full mt-8 h-14 rounded-2xl border border-white/5 font-black text-[10px] uppercase tracking-widest text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-none transition-all shadow-2xl" onClick={() => { setFormData({...formData, product_id: prod.id}); setIsCreating(true); }}>
                                Initiate Investment
                              </Button>
                          </CardContent>
                      </Card>
                  ))}
              </div>

              <Card className="bg-slate-900 border-none shadow-2xl rounded-[40px] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent" />
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="h-32 w-32" />
                </div>
                <CardHeader className="p-10 pb-4 relative z-10 text-white">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Sovereign Protection</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-12 relative z-10 text-white">
                    <p className="text-[13px] text-slate-400 leading-relaxed font-medium italic">
                        "Term deposits are NDIC insured. Early liquidation triggers a 50% yield penalty. Principal value remains atomic and guaranteed."
                    </p>
                    <div className="mt-8 flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">NDIC SECURED</span>
                    </div>
                </CardContent>
              </Card>
           </div>
        </div>

        {/* Booking Modal (Luxury Overlay) */}
        {isBooking && (
             <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
                <Card className="w-full max-w-xl border-indigo-500/20 obsidian-card overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.1)] rounded-[60px]">
                    <CardHeader className="p-14 border-b border-white/5 bg-indigo-600 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-20 rotate-12">
                            <PiggyBank className="h-24 w-24" />
                        </div>
                        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
                        <CardTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">Vault Capital</CardTitle>
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[9px] tracking-[0.5em] mt-4 italic opacity-80">Authorized Provisioning Sequence</CardDescription>
                    </CardHeader>
                    <CardContent className="p-14 space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-3 text-left">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Liquidity Source (NUBAN)</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs shadow-2xl"
                                    value={formData.linked_savings_account}
                                    onChange={e => setFormData({...formData, linked_savings_account: e.target.value})}
                                >
                                    <option value="" className="bg-slate-900">Select Liquidity Node...</option>
                                    {myAccounts?.map((acc: any) => (
                                        <option key={acc.account_number} value={acc.account_number} className="bg-slate-900">
                                            {acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3 text-left">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Capital Protocol</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs shadow-2xl"
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({...formData, product_id: parseInt(e.target.value)})}
                                >
                                    <option value={0} className="bg-slate-900">Select Plan...</option>
                                    {products?.map((p: any) => <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({p.interest_rate_pa}%)</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Payload (₦)</Label>
                                    <Input placeholder="Min 100,000" className="h-16 rounded-3xl bg-white/5 border-white/5 px-8 font-black text-indigo-400 text-2xl shadow-2xl focus-visible:ring-1 focus-visible:ring-indigo-500/50" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})} />
                                </div>
                                <div className="space-y-3 text-left">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Maturity Instructions</Label>
                                    <select 
                                        className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs shadow-2xl shadow-indigo-500/5"
                                        value={formData.rollover_instruction}
                                        onChange={(e) => setFormData({...formData, rollover_instruction: e.target.value})}
                                    >
                                        <option value="LIQUIDATE" className="bg-slate-900">Liquidate Node</option>
                                        <option value="ROLLOVER_PRINCIPAL" className="bg-slate-900">Rollover Base</option>
                                        <option value="ROLLOVER_PRINCIPAL_INTEREST" className="bg-slate-900">Compound Total</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 flex gap-6">
                            <Button variant="ghost" className="flex-1 h-20 rounded-[32px] font-black text-[11px] uppercase tracking-widest text-slate-600 hover:text-white" onClick={() => setIsCreating(false)}>Abort</Button>
                            <Button className="flex-[2] bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all text-white border-none" onClick={handleBook} disabled={bookFdMutation.isPending}>
                                {bookFdMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                                SECURE ASSET
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}

        {selectedCertFd && (
            <InvestmentCertificateModal 
                fd={selectedCertFd} 
                customerName={user?.full_name || 'Valued Client'} 
                onClose={() => setSelectedCertFd(null)} 
            />
        )}
    </div>
  );
};

export default FixedDeposits;
