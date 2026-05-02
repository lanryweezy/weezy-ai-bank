import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Lock, Unlock, Plus, Activity, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const CardCenter = () => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  const { data: cards, isLoading, refetch } = useQuery({
    queryKey: ['myCards'],
    queryFn: () => apiClient('/wallets/cards/me'),
  });

  const requestCardMutation = useMutation({
    mutationFn: (data: any) => apiClient('/wallets/cards/request', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Card issued successfully!');
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Card request failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiClient(`/wallets/cards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ new_status: status }) }),
    onSuccess: () => {
      toast.success('Card status updated');
      refetch();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 font-black text-[9px] tracking-widest uppercase">ACTIVE</Badge>;
      case 'INACTIVE': return <Badge className="bg-amber-100 text-amber-700 border-none px-3 font-black text-[9px] tracking-widest uppercase">INACTIVE</Badge>;
      case 'BLOCKED_PERM': return <Badge className="bg-rose-100 text-rose-700 border-none px-3 font-black text-[9px] tracking-widest uppercase">BLOCKED</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-center font-bold text-slate-400">Syncing with Card Switch...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                CARD VAULT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><CreditCard className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Provision and manage high-security Verve & Mastercard assets.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => requestCardMutation.mutate({ 
                card_type: 'VIRTUAL', 
                card_scheme: 'VERVE', 
                cardholder_name: 'WEEZY CUSTOMER',
                account_id: 1
              })} 
              className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none"
              disabled={requestCardMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" /> Issue Virtual Card
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Card Display */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Your Physical & Digital Assets</h3>
              {cards?.length > 0 ? (
                cards.map((card: any) => (
                  <Card key={card.id} className={`group border-none shadow-2xl relative overflow-hidden text-white transition-all duration-700 rounded-[32px] ${card.status === 'BLOCKED_PERM' ? 'grayscale opacity-60' : 'hover:-translate-y-2 hover:shadow-indigo-500/20'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.card_scheme === 'VERVE' ? 'from-emerald-600 to-teal-900' : 'from-indigo-600 to-blue-900'}`} />
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <CreditCard className="h-56 w-56" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    
                    <CardHeader className="relative z-10 p-8 pb-0">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col gap-2">
                             <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase w-fit text-white">
                                {card.card_type} • {card.card_scheme}
                             </div>
                             <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Weezy Premium Debit</p>
                         </div>
                         {getStatusBadge(card.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-8 pt-10 pb-12">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-3xl font-mono tracking-[0.25em] font-black drop-shadow-lg text-white">
                                {showFullDetails ? card.card_number_masked.replace(/\*/g, '•') : card.card_number_masked}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowFullDetails(!showFullDetails)} className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-10 w-10">
                                {showFullDetails ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
                        <div className="flex gap-16">
                            <div className="space-y-1 text-white">
                                <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">Valid Thru</p>
                                <p className="font-black text-lg tracking-widest">{card.expiry_date}</p>
                            </div>
                            <div className="space-y-1 text-white">
                                <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">Sec. Code</p>
                                <p className="font-black text-lg tracking-widest">{showFullDetails ? '774' : '•••'}</p>
                            </div>
                            <div className="ml-auto">
                                {card.card_scheme === 'VERVE' ? (
                                    <div className="w-16 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black italic text-xs tracking-tighter text-white border border-white/5">Verve</div>
                                ) : (
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-500/80 ring-2 ring-white/10" />
                                        <div className="w-10 h-10 rounded-full bg-amber-500/80 ring-2 ring-white/10" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="relative z-10 bg-slate-950/30 backdrop-blur-xl flex justify-between p-6 px-8">
                        <p className="text-xs font-black tracking-[0.15em] uppercase text-white/90">{card.cardholder_name}</p>
                        <div className="flex gap-3">
                            {card.status === 'ACTIVE' ? (
                                <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-white font-black text-[9px] uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-200 transition-all border border-white/10" onClick={() => statusMutation.mutate({ id: card.id, status: 'BLOCKED_PERM' })}>
                                    <Lock className="h-3 w-3 mr-2" /> Freeze Card
                                </Button>
                            ) : (
                                <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-white font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500/20 hover:text-emerald-200 transition-all border border-white/10" onClick={() => statusMutation.mutate({ id: card.id, status: 'ACTIVE' })}>
                                    <Unlock className="h-3 w-3 mr-2" /> Unfreeze
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm inline-block mb-6 ring-1 ring-slate-100">
                        <CreditCard className="h-12 w-12 text-slate-200" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">No Active Card Assets</h4>
                    <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">Instant provisioning for virtual and physical Verve/Mastercard nodes.</p>
                </div>
              )}
           </div>

           {/* Controls & Security */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security & Governance</h3>
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden text-slate-900">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                        <Shield className="h-5 w-5 text-indigo-600" /> Protocol Overrides
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                    {[
                        { label: 'Web Terminal Access', desc: 'Enable for e-commerce transactions', active: true },
                        { label: 'International Corridor', desc: 'Allow FX/Cross-border settlements', active: false },
                        { label: 'ATM Cash Exit', desc: 'Permit physical cash withdrawals', active: true },
                        { label: 'Contactless NFC', desc: 'Allow tap-to-pay proximity sensing', active: false },
                    ].map((ctrl, i) => (
                        <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer">
                            <div>
                                <p className="text-sm font-black text-slate-800">{ctrl.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{ctrl.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${ctrl.active ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-500 ${ctrl.active ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[32px] overflow-hidden relative group">
                <Activity className="absolute bottom-[-10px] left-[-10px] h-32 w-32 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Intelligence Tip
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 relative z-10 text-white">
                    <p className="text-sm font-medium leading-relaxed text-slate-300">
                        Weezy AI has analyzed your spending. Your **Verve Card** is primarily used for **NQR Merchant payments**. We recommend keeping 'International Access' disabled to maximize your security score.
                    </p>
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Card Security Rating</span>
                         <Badge className="bg-emerald-500 text-white border-none font-black text-[10px]">9.8 / 10</Badge>
                    </div>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardCenter;
