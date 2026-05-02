import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, FileText, Download, Play, RefreshCw, Clock, AlertTriangle, Building2, Landmark, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const RegulatoryReporting = () => {
  const [selectedReport, setSelectedReport] = useState('CBN_FINA');
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ['reportLogs'],
    queryFn: () => apiClient('/compliance/reports/logs'),
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiClient('/compliance/reports/generate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Report generation instruction sent to core.');
      refetchLogs();
    },
    onError: (err: any) => toast.error(err.message || 'Generation failed'),
  });

  const handleGenerate = () => {
      generateMutation.mutate({
          report_name: selectedReport,
          reporting_period_start_date: period, // Simplified for demo
          reporting_period_end_date: period
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'GENERATED': return <Badge className="bg-emerald-100 text-emerald-700 border-none">GENERATED</Badge>;
        case 'FAILED_GENERATION': return <Badge className="bg-rose-100 text-rose-700 border-none">FAILED</Badge>;
        case 'PENDING_GENERATION': return <Badge className="bg-amber-100 text-amber-700 border-none animate-pulse">PROCESSING</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                REGULATORY CORE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Building2 className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">CBN FinA, CRMS & NFIU automated reporting interface.</p>
          </div>
          <Badge className="bg-slate-900 text-indigo-400 border-indigo-500/30 px-4 py-1.5 font-black text-[9px] tracking-widest uppercase">Verified CBN Gateway</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Report Config */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Export Generator</h3>
                <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Manual Trigger</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Regulator Schedule</Label>
                            <select 
                                className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                value={selectedReport}
                                onChange={e => setSelectedReport(e.target.value)}
                            >
                                <option value="CBN_FINA">CBN FinA (Financial Analysis)</option>
                                <option value="CBN_CRMS">CBN CRMS (Credit Risk)</option>
                                <option value="NFIU_CTR">NFIU CTR (Cash Transaction)</option>
                                <option value="NDIC_RETURNS">NDIC Returns</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reporting Date</Label>
                            <Input type="date" value={period} onChange={e => setPeriod(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" />
                        </div>
                        <Button className="w-full bg-indigo-600 h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 text-white border-none" onClick={handleGenerate} disabled={generateMutation.isPending}>
                            {generateMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <Play className="h-5 w-5 mr-3" />}
                            Generate Export
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Automated Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Next Daily Batch</span>
                                <span className="text-xs font-mono font-bold text-indigo-300">00:00 WAT</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">FinA-2 Integration</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ACTIVE</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Logs */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Generation Audit Trail</h3>
                <div className="space-y-4">
                    {logs?.map((log: any) => (
                        <Card key={log.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="p-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-50 p-4 rounded-[24px] text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{log.report_name.replace('_', ' ')}</p>
                                            {getStatusBadge(log.status)}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Period End: {format(new Date(log.reporting_period_end_date), 'MMM dd, yyyy')}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                                Format: {log.file_format || 'XML'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {log.status === 'GENERATED' && (
                                    <Button variant="outline" className="rounded-xl h-11 px-6 border-slate-200 hover:bg-slate-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}

                    {logs?.length === 0 && (
                        <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">No Export Logs Found</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2">Trigger a manual export to see the results here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegulatoryReporting;
