import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Monitor, ArrowUpRight, BarChart3, Clock, CheckCircle2, AlertCircle, RefreshCw, Terminal, Building2, ShieldCheck, Activity, Smartphone, TrendingUp } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const MerchantConsole = () => {
  const merchantId = 1; // Demo merchant

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['merchantDashboard', merchantId],
    queryFn: () => apiClient<any>(`/merchant/${merchantId}/dashboard`),
  });

  const settlementMutation = useMutation({
    mutationFn: () => apiClient('/merchant/settlement/run-daily', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Daily T+1 Settlement Processed');
      refetch();
    },
  });

  if (isLoading) return <Layout><div className="p-10 text-center font-bold text-slate-400">Syncing Merchant Core...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                MERCHANT OPS <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Store className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Acquiring Governance, POS Management & T+1 Settlement Core.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => settlementMutation.mutate()} disabled={settlementMutation.isPending} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
              <RefreshCw className={`mr-2 h-4 w-4 ${settlementMutation.isPending ? 'animate-spin' : ''}`} /> Force Settlement
            </Button>
          </div>
        </div>

        {/* High-Fidelity Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2 p-8">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Identity</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{dashboard.business_name}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-mono text-[9px] uppercase">MID: {dashboard.merchant_id_code}</Badge>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2 p-8">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquiring Nodes</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        {dashboard.active_terminals} <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-widest flex items-center gap-2"><Monitor className="h-3.3" /> Active Terminals</p>
                </CardContent>
            </Card>
            <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Clock className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 p-8 relative z-10">
                    <CardTitle className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pending Payout (T+1)</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 relative z-10">
                    <div className="text-3xl font-black tracking-tighter drop-shadow-md">₦128,450.00</div>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter flex items-center gap-2"><Activity className="h-3 w-3" /> Processing for tomorrow</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Settlement History */}
           <div className="lg:col-span-2 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payout Ledger</h3>
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-3">
                             <TrendingUp className="h-5 w-5 text-indigo-600" /> RECENT SETTLEMENTS
                        </CardTitle>
                        <CardDescription className="font-medium">Funds transferred to your primary NUBAN.</CardDescription>
                    </div>
                    <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />)}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        {dashboard.recent_settlements?.length > 0 ? (
                            dashboard.recent_settlements.map((s: any) => (
                                <div key={s.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-emerald-50 p-4 rounded-[20px] text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <ArrowUpRight className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg tracking-tight">₦{parseFloat(s.net_amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(s.settlement_date), 'MMMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">{s.status}</Badge>
                                        <p className="text-[9px] text-slate-400 mt-2 font-mono font-bold">{s.settlement_reference}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No settlement cycles recorded</div>
                        )}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Terminal Activity */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Acquiring Pulse</h3>
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                 <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                        <Terminal className="h-5 w-5 text-indigo-600" /> POS FLEET
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:border-indigo-100 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Terminal ID</p>
                                <p className="text-sm font-black text-slate-900 font-mono">20459871</p>
                            </div>
                            <Badge className="bg-emerald-500 h-2 w-2 rounded-full p-0 min-w-0" />
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                            <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Model: PAX S90 • FIRMWARE v4.1</p>
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Today's Gross</p>
                                <p className="text-xl font-black text-indigo-600 tracking-tight">₦45,000.00</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-10 px-4 rounded-xl text-indigo-600 font-black text-[9px] uppercase tracking-widest hover:bg-indigo-50">Manage</Button>
                        </div>
                    </div>
                    
                    <Button variant="outline" className="w-full h-14 border-dashed border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-indigo-200 transition-all font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">
                        + Deploy New Node
                    </Button>
                 </CardContent>
              </Card>

              <div className="p-8 bg-orange-50 border border-orange-100 rounded-[40px] relative overflow-hidden group">
                    <AlertCircle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-orange-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Clearing Protocol
                    </h4>
                    <p className="text-xs text-orange-700 italic leading-relaxed font-medium relative z-10">
                        "Merchant funds are settled on a T+1 basis. For weekend transactions, settlement is initiated on the following Monday at 10:00 AM WAT."
                    </p>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantConsole;
