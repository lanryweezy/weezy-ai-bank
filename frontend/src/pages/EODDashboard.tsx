import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, ShieldCheck, Activity, AlertTriangle, CheckCircle2, Clock, Brain, Calculator, Database } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const EODDashboard = () => {
  const { data: sysDate, refetch: refetchDate } = useQuery({
    queryKey: ['systemDate'],
    queryFn: () => apiClient('/corebanking/eod/system-date'),
  });

  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ['eodLogs'],
    queryFn: () => apiClient('/corebanking/eod/job-logs'),
  });

  const runEodMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/eod/run-eod', { method: 'POST' }),
    onSuccess: () => {
      toast.success('End of Day batch completed successfully!');
      refetchDate();
      refetchLogs();
    },
    onError: (err: any) => toast.error(err.message || 'EOD Failed'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'COMPLETED': return <Badge className="bg-emerald-50 text-emerald-700 border-none">COMPLETED</Badge>;
        case 'FAILED': return <Badge className="bg-rose-50 text-rose-700 border-none">FAILED</Badge>;
        case 'IN_PROGRESS': return <Badge className="bg-amber-50 text-amber-700 border-none animate-pulse">PROCESSING</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                SYSTEM HEARTBEAT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Activity className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Business Date Orchestration & Automated Batch Lifecycle.</p>
          </div>
          <Button 
            onClick={() => runEodMutation.mutate()} 
            className="rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 font-black text-sm uppercase tracking-widest transition-all active:scale-95 text-white border-none"
            disabled={runEodMutation.isPending}
          >
            {runEodMutation.isPending ? <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> : <Play className="mr-3 h-5 w-5" />}
            Execute EOD Batch
          </Button>
        </div>

        {/* System Date Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl ring-1 ring-indigo-500/20 rounded-[32px] bg-indigo-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Calendar className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 p-8 relative z-10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80">Current Business Date</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="text-4xl font-black tracking-tighter drop-shadow-md">
                        {sysDate ? format(new Date(sysDate.current_business_date), 'MMMM dd, yyyy') : 'LOADING...'}
                    </div>
                    <p className="text-[10px] font-bold uppercase mt-2 opacity-60">Status: {sysDate?.is_open ? 'OPEN FOR POSTING' : 'CLOSED'}</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last EOD Execution</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-black text-slate-900">
                        {sysDate?.last_eod_at ? format(new Date(sysDate.last_eod_at), 'HH:mm:ss WAT') : 'NEVER'}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        <p className="text-[10px] text-slate-400 font-medium">Automatic daily cutoff</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-slate-50">
                <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Check</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-2xl font-black text-emerald-600 flex items-center gap-3">
                        LOCKED <ShieldCheck className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">Double-Entry Core Validated</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Batch Logs */}
            <div className="lg:col-span-3 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Historical Heartbeats</h3>
                <div className="space-y-4">
                    {logs?.map((log: any) => (
                        <Card key={log.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[24px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-0 flex flex-col md:flex-row">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{format(new Date(log.business_date), 'MMMM dd, yyyy')}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Job ID: EOD-{log.id}</p>
                                        </div>
                                        {getStatusBadge(log.status)}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${log.interest_accrued ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Calculator className="h-3 w-3" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interest</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${log.loan_maturities_processed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Database className="h-3 w-3" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loans</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${log.trial_balance_generated ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <CheckCircle2 className="h-3 w-3" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ledger</span>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-black uppercase mb-1">Imbalance</p>
                                            <p className={`text-xs font-mono font-bold ${parseFloat(log.imbalance_amount) !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₦{parseFloat(log.imbalance_amount).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {log.ai_audit_summary && (
                                        <div className="mt-8 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 relative group">
                                            <Brain className="absolute top-4 right-4 h-4 w-4 text-indigo-200" />
                                            <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Sparkles className="h-3 w-3" /> Chief Auditor Opinion
                                            </p>
                                            <p className="text-[11px] text-indigo-600 leading-relaxed font-medium italic">
                                                "{log.ai_audit_summary}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className={`bg-indigo-600 md:w-2 flex-shrink-0 ${log.status === 'FAILED' ? 'bg-rose-500' : ''}`} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pre-Batch Checklist</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Hard Cutoff Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0">01</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">Ensure all **Teller Tills** are closed and physical cash vaulted.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0">02</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">Verify that all **NIP Inter-bank** settlements for the day have been reconciled.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0">03</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">Check for any un-disbursed bulk payroll batches.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-rose-50 border border-rose-100 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-rose-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Disaster Recovery
                    </h4>
                    <p className="text-xs text-rose-600 italic leading-relaxed font-medium relative z-10">
                        "If EOD fails due to an imbalance, DO NOT re-run. Contact IT support and use the Trial Balance Export to perform a manual audit."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

const Play = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);

export default EODDashboard;
