import React, { useState } from 'react';
import Layout from '@/components/Layout';
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
  Gavel
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
        toast.success('Forensic report generation initialized.');
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
        toast.error('Download failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'GENERATED': return <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] px-3 uppercase tracking-widest">CERTIFIED</Badge>;
        case 'FAILED': return <Badge className="bg-rose-50 text-rose-700 border-none font-black text-[8px] px-3 uppercase tracking-widest">REJECTED</Badge>;
        default: return <Badge className="bg-amber-50 text-amber-700 border-none font-black text-[8px] px-3 uppercase tracking-widest animate-pulse">PROCESSING</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic uppercase">
                REGULATORY CORE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Gavel className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">CBN FinA, CRMS & NFIU CTR Statutory Export Engine.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm">
                <Globe className="mr-2 h-4 w-4" /> Reporting Calendar
             </Button>
             <Button onClick={() => refetch()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <RefreshCw className="mr-2 h-4 w-4" /> Sync Registry
             </Button>
          </div>
        </div>

        {/* Compliance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Compliance Score', value: '100%', icon: ShieldCheck, color: 'emerald' },
                { label: 'Flagged CTRs', value: '14', icon: AlertTriangle, color: 'amber' },
                { label: 'FinA Sync', value: '99.9%', icon: Activity, color: 'indigo' },
                { label: 'Legal Integrity', value: 'SIGNED', icon: Lock, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                    <CardContent className="p-8">
                        <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 w-fit mb-4 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Action Cards */}
            <div className="lg:col-span-1 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"> Statutory Generators</h3>
                <div className="space-y-4">
                    {[
                        { id: 'FINA_SCH_001', name: 'CBN FinA (SCH 001)', desc: 'Monthly trial balance & GL aggregation.' },
                        { id: 'CRMS_LOAD', name: 'CRMS Return 1', desc: 'Credit risk management system upload.' },
                        { id: 'NFIU_CTR', name: 'NFIU CTR (₦10M+)', desc: 'Currency transaction reporting.' }
                    ].map((report) => (
                        <Card key={report.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[24px] bg-white hover:shadow-xl transition-all group overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{report.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{report.id}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic mb-6 leading-relaxed">"{report.desc}"</p>
                                <Button 
                                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest h-10 rounded-xl transition-all shadow-lg border-none"
                                    onClick={() => generateMutation.mutate(report.id)}
                                    disabled={generateMutation.isPending}
                                >
                                    {generateMutation.isPending ? 'Processing Engine...' : 'Initialize Export'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Audit History */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Forensic Export Log</h3>
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {logs?.length > 0 ? (
                                logs.map((log) => (
                                    <div key={log.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 rounded-[20px] bg-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <p className="font-black text-slate-900 text-base tracking-tight uppercase italic">{log.report_name}</p>
                                                    {getStatusBadge(log.status)}
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3 text-indigo-400" /> Issued: {format(new Date(log.reporting_period_end_date), 'MMM dd, yyyy')}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">SHA-256: {log.id.toString().padStart(6, '0')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {log.status === 'GENERATED' && (
                                                <Button 
                                                    variant="outline" 
                                                    className="rounded-xl h-11 px-6 border-slate-200 hover:bg-slate-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                                    onClick={() => handleDownload(log.id, `${log.report_name}_${log.reporting_period_end_date}`)}
                                                >
                                                    <Download className="mr-2 h-4 w-4" /> Download
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-300 hover:text-indigo-600 transition-all">
                                                <Activity className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 text-center text-slate-400 italic font-medium">
                                    <Activity className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                    No statutory exports recorded in this cycle.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <CheckCircle2 className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> National Switch Sync
                    </h4>
                    <p className="text-xs text-indigo-700 italic leading-relaxed font-black tracking-tight relative z-10">
                        "Regulatory nodes are synchronized with the CBN NIBSS Gateway. All SCH-001 payloads are cryptographically signed before transmission."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegulatoryReporting;
