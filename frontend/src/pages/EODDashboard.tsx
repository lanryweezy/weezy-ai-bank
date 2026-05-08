import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, ShieldCheck, Activity, AlertTriangle, CheckCircle2, Clock, Brain, Calculator, Database, Cpu, Zap, Sparkles, ChevronRight, Gavel, ArrowUpRight } from 'lucide-react';
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
      toast.success('System Heartbeat synchronization successful.');
      refetchDate();
      refetchLogs();
    },
    onError: (err: any) => toast.error(err.message || 'EOD Execution Interrupted'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'COMPLETED': return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] px-4 py-1 uppercase tracking-widest rounded-lg italic">SYNCHRONIZED</Badge>;
        case 'FAILED': return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[9px] px-4 py-1 uppercase tracking-widest rounded-lg italic">INTERRUPTED</Badge>;
        case 'IN_PROGRESS': return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black text-[9px] px-4 py-1 uppercase tracking-widest animate-pulse rounded-lg italic">ORCHESTRATING</Badge>;
        default: return <Badge variant="outline" className="border-white/10 text-slate-500 italic">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                System Heartbeat <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Activity className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> Business Date Orchestration & Batch Lifecycle
            </p>
          </div>
          <Button 
            onClick={() => runEodMutation.mutate()} 
            className="rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none italic"
            disabled={runEodMutation.isPending}
          >
            {runEodMutation.isPending ? <RefreshCw className="mr-4 h-5 w-5 animate-spin" /> : <Zap className="mr-4 h-5 w-5" />}
            Execute EOD Protocol
          </Button>
        </div>

        {/* System Date Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="obsidian-card p-10 flex flex-col justify-between h-[280px] group relative overflow-hidden ring-1 ring-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="flex justify-between items-start relative z-10">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                        <Calendar className="h-8 w-8" />
                     </div>
                     <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] px-3 tracking-widest">OPEN NODE</Badge>
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Current Business Cycle</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        {sysDate ? format(new Date(sysDate.current_business_date), 'MMMM dd, yyyy') : 'LOADING...'}
                    </h3>
                </div>
            </Card>

            <Card className="obsidian-card p-10 flex flex-col justify-between h-[280px] group">
                <div className="flex justify-between items-start">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-500 group-hover:scale-110 transition-transform">
                        <Clock className="h-8 w-8" />
                     </div>
                     <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_#6366f1]" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Last Cycle Cutoff</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        {sysDate?.last_eod_at ? format(new Date(sysDate.last_eod_at), 'HH:mm:ss') : 'NEVER'}
                    </h3>
                    <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic opacity-60 px-1">Automatic national settlement sync</p>
                </div>
            </Card>

            <Card className="bg-slate-900 border-none shadow-2xl rounded-[40px] p-10 flex flex-col justify-between h-[280px] group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <ShieldCheck className="h-40 w-40 text-emerald-500" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                     <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                        <Gavel className="h-7 w-7" />
                     </div>
                     <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] px-3 tracking-widest">VERIFIED</Badge>
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Ledger Integrity</p>
                    <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">CORE_LOCKED</h3>
                    <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-widest italic opacity-60">Double-entry constraints active</p>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Batch Logs */}
            <div className="lg:col-span-3 space-y-10">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Historical Heartbeat Registry</h3>
                <div className="space-y-6">
                    {logs?.map((log: any) => (
                        <Card key={log.id} className="obsidian-card border-none hover:border-indigo-500/20 transition-all duration-700 overflow-hidden group border-l-2 border-transparent hover:border-indigo-500 shadow-2xl">
                            <div className="p-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10 gap-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-6 mb-3">
                                            <p className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{format(new Date(log.business_date), 'MMMM dd, yyyy')}</p>
                                            {getStatusBadge(log.status)}
                                        </div>
                                        <p className="text-[9px] text-slate-600 font-mono font-black uppercase tracking-widest italic">BATCH_ID: EOD-{log.id.toString().padStart(6, '0')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black italic tracking-tighter ${parseFloat(log.imbalance_amount) !== 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                                            ₦{parseFloat(log.imbalance_amount).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">Net Variance</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-white/5 pb-10 mb-10">
                                    {[
                                        { label: 'Interest', active: log.interest_accrued, icon: Calculator },
                                        { label: 'Loans', active: log.loan_maturities_processed, icon: Database },
                                        { label: 'Trial Bal', active: log.trial_balance_generated, icon: CheckCircle2 },
                                        { label: 'AI Auditor', active: !!log.ai_audit_summary, icon: Brain }
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group/step">
                                            <div className={`p-2.5 rounded-xl border transition-all ${step.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover/step:scale-110' : 'bg-white/5 border-white/5 text-slate-700'}`}>
                                                <step.icon className="h-4 w-4" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest italic ${step.active ? 'text-slate-300' : 'text-slate-700'}`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {log.ai_audit_summary && (
                                    <div className="p-8 glass-dark rounded-[32px] border border-indigo-500/20 relative group/audit overflow-hidden">
                                        <Sparkles className="absolute top-0 right-0 h-32 w-32 -mr-10 -mt-10 opacity-[0.03] text-indigo-400 rotate-12 transition-transform duration-1000 group-hover/audit:rotate-0 group-hover/audit:scale-110" />
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-4 italic">
                                            <Brain className="h-4 w-4" /> Cognitive Auditor Rationale
                                        </p>
                                        <p className="text-[13px] text-slate-400 leading-relaxed font-medium italic relative z-10">
                                            "{log.ai_audit_summary}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                    
                    {(!logs || logs.length === 0) && (
                        <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                            <Activity className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
                            <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">History Dormant</h4>
                            <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-60">No automated heartbeat cycles detected in the current node cycle.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Pre-Batch Protocol</h3>
                <Card className="obsidian-card border-none overflow-hidden ring-1 ring-white/5 shadow-2xl">
                    <CardHeader className="bg-slate-900 p-8 border-b border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent pointer-events-none" />
                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-red-400 flex items-center gap-4 italic leading-none relative z-10">
                            <ShieldCheck className="h-5 w-5" /> Safety Vetoes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 relative z-10 space-y-8">
                        {[
                            { id: '01', text: "All Teller Tills must be synchronized and physical cash vaulted." },
                            { id: '02', text: "NIBSS NIP settlement packets for the cycle must be ACK'd." },
                            { id: '03', text: "High-value bulk payroll payloads must be in FINAL state." }
                        ].map((rule) => (
                            <div key={rule.id} className="flex items-start gap-6 group cursor-default">
                                <div className="h-8 w-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">{rule.id}</div>
                                <p className="text-[12px] text-slate-400 leading-relaxed font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">"{rule.text}"</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="p-10 bg-red-950/20 border border-red-500/20 rounded-[40px] relative overflow-hidden group shadow-2xl">
                    <AlertTriangle className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-red-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    <h4 className="text-[11px] font-black text-red-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4 italic">
                        <RefreshCw className="h-5 w-5 animate-spin-slow" /> Disaster Protocol
                    </h4>
                    <p className="text-sm text-slate-400 italic leading-relaxed font-medium relative z-10">
                        "Variance detection above ₦0.01 triggers an immediate system halt. Do not attempt manual bypass without L3 security handshake."
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EODDashboard;
