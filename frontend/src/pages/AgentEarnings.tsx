import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, History, Landmark, ShieldCheck, ArrowUpRight, CheckCircle2, RefreshCw, Activity, DollarSign } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AgentEarnings = () => {
  const { data: wallet, isLoading: loadingWallet, refetch: refetchWallet } = useQuery({
    queryKey: ['agentWallet'],
    queryFn: () => apiClient('/corebanking/agent-commissions/me/wallet'),
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['commissionLogs'],
    queryFn: () => apiClient('/corebanking/agent-commissions/me/logs'),
  });

  const settleMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/agent-commissions/admin/settle-batch', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Batch settlement triggered!');
      refetchWallet();
    },
  });

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                REVENUE HUB <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><TrendingUp className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Agent Commissions, Revenue Splits & Automated Settlements.</p>
          </div>
          <Button onClick={() => settleMutation.mutate()} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <RefreshCw className="mr-2 h-4 w-4" /> Trigger Settlement
          </Button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl ring-1 ring-emerald-500/20 rounded-[32px] bg-emerald-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Wallet className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10 p-8">
                    <CardTitle className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Available for Payout</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter drop-shadow-md">
                        ₦{parseFloat(wallet?.current_balance || 0).toLocaleString()}
                    </div>
                    <p className="text-[10px] text-emerald-100/60 mt-2 font-bold uppercase tracking-widest">Wallet: {wallet?.wallet_account_number}</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Earnings</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-black text-slate-900">₦{parseFloat(wallet?.total_lifetime_earned || 0).toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <p className="text-[10px] text-slate-400 font-medium">Aggregated across all transaction types</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Landmark className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 px-8 pt-8 relative z-10">
                    <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Payout</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 relative z-10">
                    <div className="text-xl font-black text-indigo-400">
                        {wallet?.last_payout_at ? format(new Date(wallet.last_payout_at), 'MMM dd, yyyy') : 'NO PAYOUT YET'}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Settled to Primary Account</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Logs Column */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Earning Stream</h3>
                <div className="space-y-4">
                    {logs?.map((log: any) => (
                        <Card key={log.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[24px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-50 p-4 rounded-[20px] text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm tracking-tight">Comm: {log.financial_transaction_id.slice(-8)}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            Total Fee: ₦{parseFloat(log.total_fee_collected).toLocaleString()} • {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-emerald-600 tracking-tighter">+₦{parseFloat(log.agent_amount).toLocaleString()}</p>
                                    <Badge className={`mt-1 border-none text-[8px] font-black uppercase tracking-widest ${log.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {log.status}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {logs?.length === 0 && (
                        <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">No Earnings Recorded</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2">Start performing agent transactions to earn commissions.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Config Sidebar */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Revenue Policy</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> System Split Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10">
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Agent Share</span>
                                    <span className="text-sm font-black text-white">50%</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full" style={{ width: '50%' }} />
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Bank Share</span>
                                    <span className="text-sm font-black text-white">40%</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: '40%' }} />
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Super Agent</span>
                                    <span className="text-sm font-black text-white">10%</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full" style={{ width: '10%' }} />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-6 leading-relaxed italic">
                            *Split rules are applied at point of transaction and settled during EOD processing.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentEarnings;
