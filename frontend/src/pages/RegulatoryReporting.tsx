import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Lock, 
  Landmark, 
  Globe, 
  ExternalLink,
  Search,
  Activity,
  Zap,
  Gavel,
  Cpu,
  Database,
  Clock
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

const RegulatoryReporting = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: logs, refetch } = useQuery({
    queryKey: ['regulatoryLogs'],
    queryFn: () => apiClient<any[]>('/compliance/reports/logs'),
  });

  const generateMutation = useMutation({
    mutationFn: (type: string) => apiClient('/compliance/reports/generate', { method: 'POST', body: JSON.stringify({ report_type: type }) }),
    onSuccess: () => {
        toast.success('Forensic payload generation synthesized.');
        refetch();
    }
  });

  const handleDownload = async (logId: number, fileName: string) => {
    try {
        const response = await fetch(`/api/compliance/reports/logs/${logId}/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        toast.error('Download protocol interrupted');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'GENERATED': return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] px-4 py-1 uppercase tracking-widest rounded-lg">CERTIFIED</Badge>;
        case 'FAILED': return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-black text-[9px] px-4 py-1 uppercase tracking-widest rounded-lg">REJECTED</Badge>;
        default: return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black text-[9px] px-4 py-1 uppercase tracking-widest animate-pulse rounded-lg">SYNTHESIZING</Badge>;
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Regulatory Core <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Gavel className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Globe className="h-4 w-4 text-indigo-500" /> CBN FinA, CRMS & NFIU Statutory Export Hub
            </p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/5 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                <Globe className="mr-3 h-5 w-5" /> Global Calendar
             </Button>
             <Button onClick={() => refetch()} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
                <RefreshCw className="mr-3 h-5 w-5" /> Sync Registry
             </Button>
          </div>
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
                { label: 'Compliance Index', value: '100.0%', icon: ShieldCheck, color: 'emerald' },
                { label: 'Flagged CTRs', value: '14', icon: AlertTriangle, color: 'orange' },
                { label: 'FinA Integrity', value: '99.9%', icon: Activity, color: 'indigo' },
                { label: 'Payload Signing', value: 'ACTIVE', icon: Lock, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="obsidian-card p-10 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl border border-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-7 w-7" />
                         </div>
                         <div className={`w-1.5 h-1.5 bg-${stat.color}-500 rounded-full animate-pulse shadow-[0_0_10px_currentColor]`} />
                    </div>
                    <div className="mt-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{stat.value}</h3>
                    </div>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Action Cards */}
            <div className="lg:col-span-1 space-y-10">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white text-center">Statutory Protocols</h3>
                <div className="space-y-6">
                    {[
                        { id: 'FINA_SCH_001', name: 'CBN FinA (SCH 001)', desc: 'Autonomous Monthly Trial Balance & GL Aggregation.' },
                        { id: 'CRMS_LOAD', name: 'CRMS Return 1', desc: 'Sovereign Credit Risk Management System Upload.' },
                        { id: 'NFIU_CTR', name: 'NFIU CTR (₦10M+)', desc: 'Real-time Currency Transaction Reporting Vector.' }
                    ].map((report) => (
                        <Card key={report.id} className="obsidian-card border-none hover:border-indigo-500/30 transition-all duration-700 group overflow-hidden shadow-2xl shadow-indigo-500/5">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:rotate-6">
                                        <FileText className="h-6 w-6 text-indigo-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-widest italic leading-none">{report.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">{report.id}</p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 italic mb-8 leading-relaxed font-medium">"{report.desc}"</p>
                                <Button 
                                    className="w-full bg-white/5 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-2xl transition-all shadow-2xl border border-white/5 group-hover:border-none"
                                    onClick={() => generateMutation.mutate(report.id)}
                                    disabled={generateMutation.isPending}
                                >
                                    {generateMutation.isPending ? 'Executing Synthesis...' : 'Initialize Export'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Audit History */}
            <div className="lg:col-span-2 space-y-10">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white">Forensic Export History</h3>
                <Card className="obsidian-card border-none overflow-hidden flex flex-col min-h-[600px]">
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {logs?.length > 0 ? (
                                logs.map((log: any) => (
                                    <div key={log.id} className="p-10 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-l-2 border-transparent hover:border-indigo-500 gap-10">
                                        <div className="flex items-center gap-10 flex-1">
                                            <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white">
                                                <ShieldCheck className={`h-8 w-8 ${log.status === 'GENERATED' ? 'text-emerald-400 group-hover:text-white' : 'text-slate-600'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-6 mb-3">
                                                    <p className="font-black text-white text-xl tracking-tight uppercase italic">{log.report_name}</p>
                                                    {getStatusBadge(log.status)}
                                                </div>
                                                <div className="flex items-center gap-10">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-3 italic">
                                                        <Clock className="h-4 w-4 text-indigo-500" /> Period: {format(new Date(log.reporting_period_end_date), 'MMM dd, yyyy')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 font-mono font-black uppercase tracking-widest">SHA-256: {log.id.toString().padStart(8, '0')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {log.status === 'GENERATED' && (
                                                <Button 
                                                    variant="ghost" 
                                                    className="h-12 px-6 rounded-xl border border-white/5 text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-300 transition-all shadow-2xl"
                                                    onClick={() => handleDownload(log.id, `${log.report_name}_${log.reporting_period_end_date}`)}
                                                >
                                                    <Download className="mr-3 h-4 w-4" /> Download
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-600 hover:text-indigo-400 hover:bg-white/5 transition-all">
                                                <Activity className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-48 text-center border-4 border-dashed border-white/5 m-12 rounded-[60px] bg-white/[0.01]">
                                    <Activity className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
                                    <h4 className="text-2xl font-black text-slate-700 italic uppercase tracking-tighter">Export Archive Empty</h4>
                                    <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-60">Initialize statutory generation cycles to begin archiving.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden group">
                    <CheckCircle2 className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-4 italic">
                        <Activity className="h-5 w-5 text-indigo-500" /> National Gateway Synchronization
                    </h4>
                    <p className="text-sm text-slate-400 italic leading-relaxed font-medium relative z-10">
                        "Regulatory nodes are cryptographically synced with the CBN NIBSS High-Resolution Gateway. Every SCH-001 payload is signed via RSA-4096 before T+0 transmission."
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default RegulatoryReporting;
