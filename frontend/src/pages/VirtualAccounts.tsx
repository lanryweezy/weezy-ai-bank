import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Hash, Copy, Plus, ArrowDownLeft, Activity, Info, Landmark, ExternalLink, RefreshCw, ShieldCheck, User, Cpu, Zap, Globe, Sparkles, ChevronRight, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const VirtualAccounts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [vaData, setVaData] = useState({ account_name: '', label: '', parent_account_id: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => JSON.parse(localStorage.getItem('user') || '{}'),
  });

  const { data: myAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['vaDashboard'],
    queryFn: () => apiClient('/virtual-accounts/dashboard'),
  });

  const { data: vas } = useQuery({
    queryKey: ['myVAs'],
    queryFn: () => apiClient('/virtual-accounts/me'),
  });

  const createVAMutation = useMutation({
    mutationFn: (data: any) => apiClient('/virtual-accounts/create', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Virtual NUBAN synthesized successfully!');
      setIsCreating(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Provisioning failed'),
  });

  const simulateMutation = useMutation({
    mutationFn: (accNo: string) => apiClient('/virtual-accounts/simulate-payment', { 
        method: 'POST', 
        body: JSON.stringify({ account_number: accNo, amount: 25000, sender_name: "ADEYEMI OLUWASEUN" }) 
    }),
    onSuccess: () => {
      toast.success('Simulated ₦25,000 inbound liquidity vector.');
      refetch();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Node reference indexed.');
  };

  if (isLoading) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Initializing Collection Matrix...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Collection Nodes <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Landmark className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> Virtual NUBAN High-Velocity Inlets
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
            <Plus className="mr-3 h-5 w-5" /> Provision Node
          </Button>
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="obsidian-card p-10 flex flex-col justify-between group h-[250px]">
                <div className="flex justify-between items-start">
                     <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform shadow-xl">
                        <TrendingUp className="h-7 w-7" />
                     </div>
                     <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] px-3 tracking-widest uppercase rounded-lg">AUTO-SETTLED</Badge>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Total Collection Volume</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">₦{parseFloat(dashboard.total_collections).toLocaleString()}</h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-4 uppercase tracking-widest italic opacity-60">Synchronized with primary ledger nodes</p>
                </div>
            </Card>

            <Card className="obsidian-card p-10 flex flex-col justify-between group h-[250px]">
                <div className="flex justify-between items-start">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform shadow-xl">
                        <Activity className="h-7 w-7" />
                     </div>
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Active Inbound Inlets</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{dashboard.active_accounts_count} <span className="text-lg opacity-30 tracking-widest ml-4 italic">NODES</span></h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-4 uppercase tracking-widest italic opacity-60">Mapped to NIBSS Instant Settlement Rail</p>
                </div>
            </Card>

            <Card className="bg-slate-900 border-none shadow-2xl rounded-[40px] p-10 flex flex-col justify-between h-[250px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="h-40 w-40 text-indigo-400" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-indigo-400 shadow-2xl">
                        <Landmark className="h-7 w-7" />
                     </div>
                     <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] px-3 tracking-widest">VAULT NODE</Badge>
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Primary Payout NUBAN</p>
                    <h3 className="text-2xl font-mono font-black text-white tracking-[0.2em]">{myAccounts?.[0]?.account_number || '9990011223'}</h3>
                    <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic">All liquidity converges at this node</p>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Account List */}
           <div className="lg:col-span-2 space-y-10">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-white">Active Virtual Infrastructure</h3>
                <Badge variant="outline" className="text-[9px] font-black text-slate-600 border-white/5 uppercase tracking-widest italic px-4 py-1.5 rounded-lg">Live on National Switch</Badge>
              </div>
              <div className="space-y-6">
                {vas?.map((va: any) => (
                    <Card key={va.id} className="obsidian-card border-none hover:border-indigo-500/20 transition-all duration-700 overflow-hidden group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-10 flex-1">
                                <div className="flex justify-between items-start mb-8 gap-10">
                                    <div className="space-y-2 flex-1">
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black tracking-widest uppercase px-4 py-1 rounded-lg italic leading-none">{va.label || 'Standard Collection Point'}</Badge>
                                        <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none mt-4">{va.account_name}</h4>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">{va.bank_name || 'WEEZY AI BANK'}</p>
                                        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-white/5 shadow-2xl">
                                            <p className="text-[11px] font-black text-indigo-400 font-mono tracking-widest">CODE: {va.bank_code || '999'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-10 p-8 glass-dark rounded-[40px] border border-white/5 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] group-hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-transparent pointer-events-none" />
                                    <div className="flex-1 relative z-10">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic opacity-60">Allocated NUBAN Identifier</p>
                                        <p className="text-3xl font-mono font-black tracking-[0.25em] text-white italic">{va.account_number}</p>
                                    </div>
                                    <div className="flex gap-4 relative z-10">
                                        <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95" onClick={() => copyToClipboard(va.account_number)}>
                                            <Copy className="h-6 w-6" />
                                        </Button>
                                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-widest text-slate-300 shadow-2xl active:scale-95 transition-all" onClick={() => simulateMutation.mutate(va.account_number)}>
                                            {simulateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-3" /> : <Zap className="h-4 w-4 mr-3 text-yellow-400" />} Simulate Inflow
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-600 md:w-4 flex flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                    </Card>
                ))}
              </div>
           </div>

           {/* Recent Incoming Stream */}
           <div className="space-y-12">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white text-center">Live Payout Pulse</h3>
              <Card className="obsidian-card border-none overflow-hidden h-full flex flex-col min-h-[600px] shadow-2xl">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 py-8 px-10 flex flex-row items-center justify-between backdrop-blur-3xl">
                    <CardTitle className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] italic">Inbound Vector Stream</CardTitle>
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping shadow-[0_0_10px_#10b981]" />
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="divide-y divide-white/5">
                        {dashboard.recent_payments?.length > 0 ? (
                            dashboard.recent_payments.map((p: any) => (
                                <div key={p.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all group border-l-2 border-transparent hover:border-emerald-500">
                                    <div className="flex gap-6 items-center">
                                        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xl">
                                            <ArrowDownLeft className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white italic tracking-tight uppercase truncate max-w-[150px]">{p.sender_name || 'Autonomous Settlement'}</p>
                                            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{format(new Date(p.created_at), 'HH:mm:ss')}</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-black text-emerald-400 italic tracking-tighter leading-none">+₦{parseFloat(p.amount).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="py-48 text-center text-slate-700 flex flex-col items-center px-10">
                                <Activity className="h-16 w-16 text-slate-900 mb-8 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-40 leading-relaxed">Listening for inbound liquidity events across national gateway nodes...</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t border-white/5 p-8 bg-white/[0.01] justify-center">
                    <Button variant="link" className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] hover:no-underline hover:text-indigo-300 transition-colors flex items-center gap-4">
                        Download Node Log <ExternalLink className="h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
           </div>
        </div>

        {/* Create VA Modal (Luxury Overlay) */}
        {isCreating && (
             <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
                <Card className="w-full max-w-xl obsidian-card border-indigo-500/20 overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.1)] rounded-[60px]">
                    <CardHeader className="p-14 border-b border-white/5 bg-indigo-600 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-20 rotate-12">
                            <Landmark className="h-24 w-24" />
                        </div>
                        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
                        <CardTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">Provision Node</CardTitle>
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.5em] mt-4 italic opacity-80">NUBAN Infrastructure Protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-14 space-y-10">
                        <div className="space-y-8">
                            <div className="space-y-4 text-left">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Merchant Asset Label</Label>
                                <Input placeholder="e.g. LUXURY RETAIL NODE 01" className="h-20 rounded-[32px] bg-white/5 border-white/5 px-10 font-black text-2xl text-white italic focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all uppercase" value={vaData.account_name} onChange={e => setVaData({...vaData, account_name: e.target.value})} />
                            </div>
                            <div className="space-y-4 text-left">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Convergence Vault (Parent)</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all uppercase text-xs shadow-2xl"
                                    value={vaData.parent_account_id}
                                    onChange={e => setVaData({...vaData, parent_account_id: e.target.value})}
                                >
                                    <option value="" className="bg-slate-900">Select Liquidity Node...</option>
                                    {myAccounts?.map((acc: any) => (
                                        <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-8 glass-dark rounded-[32px] border border-indigo-500/20 flex gap-6 shadow-2xl">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shrink-0 h-fit mt-1">
                                <Info className="h-6 w-6" />
                            </div>
                            <p className="text-[12px] text-slate-400 leading-relaxed font-medium italic">
                                "Virtual NUBAN nodes are **collection-only**. All inbound liquidity is autonomously reconciled and settled to your primary vault in <span className="text-emerald-400 font-black">0.42ms</span>."
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-14 pt-0 flex gap-6">
                        <button className="flex-1 h-20 rounded-[32px] font-black text-[11px] uppercase tracking-widest text-slate-600 hover:text-white transition-all italic" onClick={() => setIsCreating(false)}>Abort Protocol</button>
                        <Button className="flex-[2] bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all text-white border-none" onClick={() => createVAMutation.mutate(vaData)} disabled={createVAMutation.isPending}>
                            {createVAMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                            SYNTHESIZE NODE
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
    </div>
  );
};

export default VirtualAccounts;
