import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Lock, Unlock, Plus, Activity, Eye, EyeOff, Sparkles, ShieldCheck, RefreshCw, Cpu, Zap, Globe, Globe2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const CardCenter = () => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [formData, setFormData] = useState({
      card_type: 'VIRTUAL',
      card_scheme: 'VERVE',
      account_id: ''
  });

  const { data: myAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const { data: cards, isLoading, refetch } = useQuery({
    queryKey: ['myCards'],
    queryFn: () => apiClient('/wallets/cards/me'),
  });

  const requestCardMutation = useMutation({
    mutationFn: (data: any) => apiClient('/wallets/cards/request', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Card issued successfully!');
      setIsIssuing(false);
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
      case 'ACTIVE': return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 font-black text-[9px] tracking-widest uppercase rounded-lg">ACTIVE</Badge>;
      case 'INACTIVE': return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 font-black text-[9px] tracking-widest uppercase rounded-lg">INACTIVE</Badge>;
      case 'BLOCKED_PERM': return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 font-black text-[9px] tracking-widest uppercase rounded-lg">BLOCKED</Badge>;
      default: return <Badge variant="outline" className="border-white/10 text-slate-500">{status}</Badge>;
    }
  };

  const handleRequest = () => {
    if (!formData.account_id) {
        toast.error('Please select an account to link.');
        return;
    }
    requestCardMutation.mutate({
        ...formData,
        account_id: parseInt(formData.account_id),
        cardholder_name: 'WEEZY PREMIUM CLIENT'
    });
  };

  if (isLoading) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing with Card Switch...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Card Vault <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><CreditCard className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-indigo-500" /> Virtual & Physical Card Provisioning
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setIsIssuing(true)} 
              className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none"
            >
              <Plus className="mr-3 h-5 w-5" /> Issue Asset
            </Button>
          </div>
        </div>

        {/* Issuance Modal (Overlay) */}
        {isIssuing && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
                <Card className="w-full max-w-lg border-indigo-500/20 obsidian-card overflow-hidden">
                    <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                            <CreditCard className="h-24 w-24" />
                        </div>
                        <CardTitle className="text-4xl font-black italic tracking-tighter text-white uppercase">New Asset</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4">Secure Provisioning Protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Class</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-2xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs"
                                    value={formData.card_type}
                                    onChange={e => setFormData({...formData, card_type: e.target.value})}
                                >
                                    <option value="VIRTUAL" className="bg-slate-900">Virtual (Instant Node)</option>
                                    <option value="PHYSICAL" className="bg-slate-900">Physical (Plastic Asset)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Network Infrastructure</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-2xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs"
                                    value={formData.card_scheme}
                                    onChange={e => setFormData({...formData, card_scheme: e.target.value})}
                                >
                                    <option value="VERVE" className="bg-slate-900">Verve (Domestic Rail)</option>
                                    <option value="MASTERCARD" className="bg-slate-900">Mastercard (Global Rail)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Funding Node</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-2xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs"
                                    value={formData.account_id}
                                    onChange={e => setFormData({...formData, account_id: e.target.value})}
                                >
                                    <option value="" className="bg-slate-900">Select NUBAN...</option>
                                    {myAccounts?.map((acc: any) => (
                                        <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-12 pt-0 flex gap-4">
                        <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black text-slate-600 uppercase tracking-widest text-[10px] hover:text-white" onClick={() => setIsIssuing(false)}>Cancel</Button>
                        <Button 
                            className="flex-[2] bg-indigo-600 h-16 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/20 border-none active:scale-95 transition-all" 
                            onClick={handleRequest}
                            disabled={requestCardMutation.isPending || !formData.account_id}
                        >
                            {requestCardMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                            Authorize
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Visual Card Roster */}
           <div className="space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Asset Roster</h3>
              <div className="space-y-8">
              {cards?.length > 0 ? (
                cards.map((card: any) => (
                  <Card key={card.id} className={`group border-none shadow-2xl relative overflow-hidden text-white transition-all duration-700 rounded-[40px] h-[280px] ${card.status === 'BLOCKED_PERM' ? 'grayscale opacity-40' : 'hover:-translate-y-2 hover:shadow-indigo-500/30'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.card_scheme === 'VERVE' ? 'from-emerald-600 to-slate-900' : 'from-indigo-600 to-slate-900'}`} />
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <CreditCard className="h-64 w-64" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 pointer-events-none" />
                    
                    <CardHeader className="relative z-10 p-10 pb-0">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col gap-3">
                             <div className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase w-fit text-white border border-white/10 shadow-2xl">
                                {card.card_type} • {card.card_scheme}
                             </div>
                             <p className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase italic">Weezy High-Net-Worth</p>
                         </div>
                         {getStatusBadge(card.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-10 pt-10 pb-12">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-4xl font-mono tracking-[0.3em] font-black drop-shadow-2xl text-white">
                                {showFullDetails ? card.card_number_masked.replace(/\*/g, '•') : card.card_number_masked}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowFullDetails(!showFullDetails)} className="text-white/40 hover:text-white hover:bg-white/10 rounded-2xl h-12 w-12 border border-white/5">
                                {showFullDetails ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </Button>
                        </div>
                        <div className="flex gap-16 items-end">
                            <div className="space-y-1 text-white">
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Valid Thru</p>
                                <p className="font-black text-xl tracking-[0.2em]">{card.expiry_date}</p>
                            </div>
                            <div className="space-y-1 text-white">
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Sec. Code</p>
                                <p className="font-black text-xl tracking-[0.2em]">{showFullDetails ? '774' : '•••'}</p>
                            </div>
                            <div className="ml-auto opacity-80 group-hover:opacity-100 transition-opacity">
                                {card.card_scheme === 'VERVE' ? (
                                    <div className="w-20 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-sm tracking-tighter text-white border border-white/10">Verve</div>
                                ) : (
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-red-600 shadow-2xl border border-white/5" />
                                        <div className="w-12 h-12 rounded-full bg-amber-500 shadow-2xl border border-white/5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    
                    <div className="absolute bottom-0 left-0 w-full p-10 bg-slate-950/40 backdrop-blur-2xl flex justify-between items-center border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <p className="text-[13px] font-black tracking-widest uppercase text-white italic">{card.cardholder_name}</p>
                        <div className="flex gap-4">
                            {card.status === 'ACTIVE' ? (
                                <Button size="sm" variant="ghost" className="h-10 px-6 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 border border-white/10" onClick={() => statusMutation.mutate({ id: card.id, status: 'BLOCKED_PERM' })}>
                                    <Lock className="h-4 w-4 mr-3 text-red-400" /> Freeze
                                </Button>
                            ) : (
                                <Button size="sm" variant="ghost" className="h-10 px-6 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 border border-white/10" onClick={() => statusMutation.mutate({ id: card.id, status: 'ACTIVE' })}>
                                    <Unlock className="h-4 w-4 mr-3 text-emerald-400" /> Unfreeze
                                </Button>
                            )}
                        </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                    <CreditCard className="h-24 w-24 text-slate-900 mx-auto mb-10 animate-pulse" />
                    <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Vault Empty</h4>
                    <p className="text-sm text-slate-500 font-bold mt-3 uppercase tracking-widest opacity-60">Authorize new physical or digital nodes to begin.</p>
                </div>
              )}
              </div>
           </div>

           {/* Security Orchestration */}
           <div className="space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Security Overrides</h3>
              <Card className="obsidian-card border-white/5 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 p-10">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 text-indigo-400">
                        <Shield className="h-5 w-5" /> Protocol Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                    {[
                        { label: 'Web Terminal', desc: 'Enable E-commerce settlement', active: true, icon: Globe },
                        { label: 'Global Corridor', desc: 'FX/Cross-border liquidity', active: false, icon: Globe2 },
                        { label: 'Cash Exit', desc: 'Permit physical ATM withdrawals', active: true, icon: Zap },
                        { label: 'NFC Proximity', desc: 'Allow tap-to-pay sensing', active: false, icon: Smartphone },
                    ].map((ctrl, i) => (
                        <div key={i} className="group flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className={`p-3 rounded-2xl ${ctrl.active ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-600'}`}>
                                    <ctrl.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase italic tracking-tight">{ctrl.label}</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{ctrl.desc}</p>
                                </div>
                            </div>
                            <div className={`w-14 h-7 rounded-full relative transition-all duration-500 ${ctrl.active ? 'bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/10'}`}>
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-2xl transition-all duration-500 ${ctrl.active ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    ))}
                </CardContent>
              </Card>

              <Card className="obsidian-card bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/10">
                <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-4">
                        <Sparkles className="h-5 w-5 text-indigo-400" /> Sentinel Advice
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-12 relative z-10">
                    <p className="text-[13px] font-medium leading-relaxed text-slate-400 italic">
                        "Cognitive Core analyzed your ISO-8583 message stream. Your **Verve Node** is primarily utilized for domestic SANEF POS cash-outs. We recommend maintaining the **Global Corridor** lock to achieve a <span className="text-emerald-400 font-black">99.9% Security Confidence Score</span>."
                    </p>
                    <div className="mt-10 flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                         <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Identity Trust Rating</span>
                            <span className="text-xl font-black text-white italic tracking-tighter uppercase">PLATINUM LEVEL</span>
                         </div>
                         <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                            <span className="text-[10px] font-black text-emerald-400">9.8</span>
                         </div>
                    </div>
                </CardContent>
              </Card>
           </div>
        </div>
    </div>
  );
};

export default CardCenter;
