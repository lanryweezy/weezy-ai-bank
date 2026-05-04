import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Hash, Copy, Plus, ArrowDownLeft, Activity, Info, Landmark, ExternalLink, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

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
      toast.success('Virtual Account generated!');
      setIsCreating(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Creation failed'),
  });

  const simulateMutation = useMutation({
    mutationFn: (accNo: string) => apiClient('/virtual-accounts/simulate-payment', { 
        method: 'POST', 
        body: JSON.stringify({ account_number: accNo, amount: 25000, sender_name: "ADEYEMI OLUWASEUN" }) 
    }),
    onSuccess: () => {
      toast.success('Simulated ₦25,000 incoming transfer');
      refetch();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) return <Layout><div className="p-8 text-center">Loading Collections Dashboard...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                COLLECTIONS <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Landmark className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Enterprise Virtual NUBAN Infrastructure • Real-time Settlement</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> New Collection Account
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-slate-900">₦{parseFloat(dashboard.total_collections).toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black px-2">AUTO-SETTLED</Badge>
                        <p className="text-[10px] text-slate-400 font-medium">Syncing with primary ledger</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Identifiers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-indigo-600 flex items-center gap-3">
                        {dashboard.active_accounts_count} <Activity className="h-5 w-5 text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Mapped to NIBSS Instant Payments</p>
                </CardContent>
            </Card>
            <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Settlement Vault</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-indigo-400" />
                        <div className="text-xl font-mono font-black text-white tracking-[0.1em]">{myAccounts?.[0]?.account_number || '9990011223'}</div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter italic">Primary Settlement Node</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Account List */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Virtual Assets</h3>
                <Badge variant="outline" className="text-[9px] font-black text-slate-400 border-slate-200 uppercase">Live on NIP</Badge>
              </div>
              <div className="space-y-4">
                {vas?.map((va: any) => (
                    <Card key={va.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white group">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <Badge className="bg-indigo-50 text-indigo-700 border-none text-[9px] font-black tracking-widest uppercase mb-2">{va.label || 'Collection Point'}</Badge>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{va.account_name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{va.bank_name}</p>
                                        <div className="bg-slate-900 px-3 py-1 rounded-lg">
                                            <p className="text-[10px] font-black text-indigo-400 font-mono">CODE: {va.bank_code}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 bg-slate-50 p-5 rounded-[24px] border border-slate-100/60 shadow-inner group-hover:bg-indigo-50/30 transition-colors">
                                    <div className="flex-1">
                                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">NUBAN ACCOUNT NUMBER</p>
                                        <p className="text-2xl font-mono font-black tracking-[0.15em] text-slate-900">{va.account_number}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200 bg-white hover:bg-indigo-600 hover:text-white transition-all shadow-sm" onClick={() => copyToClipboard(va.account_number)}>
                                            <Copy className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm" onClick={() => simulateMutation.mutate(va.account_number)}>
                                            {simulateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownLeft className="h-4 w-4 mr-2" />} Test Inflow
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-600 md:w-3 flex flex-shrink-0" />
                        </div>
                    </Card>
                ))}
              </div>
           </div>

           {/* Recent Incoming */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white h-full flex flex-col overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                    <CardTitle className="text-sm font-black uppercase text-slate-500 tracking-widest">Live Payout Stream</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-5">
                        {dashboard.recent_payments?.length > 0 ? (
                            dashboard.recent_payments.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-emerald-50/50 hover:border-emerald-100 transition-all group">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                                            <ArrowDownLeft className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{p.sender_name || 'Anonymous Transfer'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(p.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-emerald-600 tracking-tight">+₦{parseFloat(p.amount).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground italic text-xs flex flex-col items-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Activity className="h-6 w-6 text-slate-200" />
                                </div>
                                Awaiting incoming transfers...
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t border-slate-50 p-6 bg-slate-50/30">
                    <Button variant="link" className="w-full text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:no-underline hover:text-indigo-700">
                        Download Transaction Log <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                </CardFooter>
              </Card>
           </div>
        </div>

        {/* Create VA Modal */}
        {isCreating && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Landmark className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Infrastructure Setup</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">NUBAN Provisioning Protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Merchant Display Name</Label>
                                <Input placeholder="e.g. ADE'S FASHION STORE" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" value={vaData.account_name} onChange={e => setVaData({...vaData, account_name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Settlement Account (Vault)</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-inner"
                                    value={vaData.parent_account_id}
                                    onChange={e => setVaData({...vaData, parent_account_id: e.target.value})}
                                >
                                    <option value="">Select account...</option>
                                    {myAccounts?.map((acc: any) => (
                                        <option key={acc.id} value={acc.id}>{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4">
                            <Info className="h-6 w-6 text-indigo-600 shrink-0" />
                            <p className="text-[10px] text-indigo-800 leading-relaxed font-medium italic">
                                Virtual NUBANs are collection-only. All received funds settle to your selected vault in real-time.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100" onClick={() => createVAMutation.mutate(vaData)} disabled={createVAMutation.isPending}>
                            {createVAMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Provisioning'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default VirtualAccounts;
