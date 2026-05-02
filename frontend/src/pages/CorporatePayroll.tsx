import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, Search, FileJson, Activity, AlertTriangle, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const CorporatePayroll = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);

  const { data: activeBatch, refetch: refetchBatch } = useQuery({
    queryKey: ['payrollBatch', activeBatchId],
    queryFn: () => apiClient(`/payroll/${activeBatchId}`),
    enabled: !!activeBatchId,
    refetchInterval: (data) => data?.status === 'AI_SCANNING' ? 3000 : false,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: any) => apiClient('/payroll/upload', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      toast.success('Payroll uploaded. AI scan initiated.');
      setActiveBatchId(data.id);
      setIsUploading(false);
    },
    onError: (err: any) => toast.error(err.message || 'Upload failed'),
  });

  const disburseMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/payroll/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Disbursement started!');
      refetchBatch();
    },
  });

  const handleDemoUpload = () => {
    const demoData = {
        corporate_customer_id: 1,
        items: [
            { recipient_name: "John Doe", recipient_account: "0011223344", recipient_bank_code: "058", amount: 150000 },
            { recipient_name: "Jane Smith", recipient_account: "9988776655", recipient_bank_code: "044", amount: 200000 },
            { recipient_name: "S. O. Adebayo", recipient_account: "0011223344", recipient_bank_code: "011", amount: 150000 } // Duplicate account check
        ]
    };
    uploadMutation.mutate(demoData);
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                PAYROLL <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Building2 className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Enterprise Disbursement Engine • AI Anomaly Auditing</p>
          </div>
          <Button onClick={() => setIsUploading(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Upload className="mr-2 h-4 w-4" /> Upload Salary Schedule
          </Button>
        </div>

        {isUploading ? (
          <Card className="max-w-2xl border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[32px] overflow-hidden mx-auto">
            <CardHeader className="p-10 text-center">
              <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <FileJson className="h-10 w-10 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Bulk Payment Initiation</CardTitle>
              <CardDescription className="font-medium px-10">Upload your staff payroll file. Supported formats: .CSV, .XLSX, .JSON</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">
                <div className="py-16 text-center border-4 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all cursor-pointer group">
                    <Sparkles className="h-12 w-12 text-slate-200 mx-auto mb-4 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                    <p className="text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">Drag and drop payroll file or click to browse</p>
                    <Button variant="outline" className="mt-8 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest h-10 px-6 bg-white hover:bg-slate-900 hover:text-white transition-all shadow-sm" onClick={handleDemoUpload} disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? 'Processing Engine...' : 'Run Demo Simulation'}
                    </Button>
                </div>
            </CardContent>
          </Card>
        ) : activeBatch ? (
          <div className="space-y-8">
            {/* Batch Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white group hover:shadow-xl transition-all duration-500">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instruction Reference</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="text-xl font-mono font-black text-slate-900 tracking-tighter">{activeBatch.batch_reference}</div>
                        <Badge className="mt-3 bg-indigo-50 text-indigo-700 border-none text-[9px] font-black tracking-widest">{activeBatch.status}</Badge>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white group hover:shadow-xl transition-all duration-500">
                    <CardHeader className="pb-2 px-6 pt-6">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Disbursement</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="text-2xl font-black text-slate-900 tracking-tight">₦{parseFloat(activeBatch.total_amount).toLocaleString()}</div>
                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase flex items-center gap-2"><Users className="h-3 w-3" /> {activeBatch.item_count} RECIPIENTS</p>
                    </CardContent>
                </Card>
                <Card className={`border-none shadow-xl rounded-3xl relative overflow-hidden group transition-all duration-500 ${activeBatch.ai_risk_score > 50 ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 px-6 pt-6 relative z-10">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Audit Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 relative z-10">
                        <div className="text-4xl font-black tracking-tighter">
                            {activeBatch.ai_risk_score || '00'}<span className="text-lg opacity-40">/100</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Activity className="h-3 w-3 text-indigo-400" /> SECURED BY WEEZY PRIME
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Report */}
            {activeBatch.ai_anomaly_report && (
              <Card className={`border-none shadow-2xl rounded-[32px] overflow-hidden ring-2 ${activeBatch.ai_risk_score > 50 ? 'ring-rose-500/20' : 'ring-emerald-500/20'} bg-white animate-in zoom-in-95 duration-500`}>
                <CardHeader className={`${activeBatch.ai_risk_score > 50 ? 'bg-rose-50' : 'bg-emerald-50'} border-b px-8 py-6`}>
                    <CardTitle className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${activeBatch.ai_risk_score > 50 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {activeBatch.ai_risk_score > 50 ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        AI AUDIT OBSERVATIONS
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Vectors</p>
                            <div className="space-y-2">
                                {activeBatch.ai_anomaly_report.anomalies?.map((a: string, i: number) => (
                                    <div key={i} className="text-xs text-slate-700 flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-sm" /> 
                                        <span className="font-medium leading-relaxed">{a}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-[24px] text-white flex flex-col justify-center relative overflow-hidden">
                            <Sparkles className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 opacity-10" />
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Automated Recommendation</p>
                            <p className="text-lg font-black italic tracking-tight">"{activeBatch.ai_anomaly_report.recommendation}"</p>
                            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                                Proceed with caution. Flagged anomalies may represent ghost workers or duplicate account instructions.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 justify-between py-6 px-8 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System ready for disbursement</p>
                    </div>
                    {activeBatch.status === 'AWAITING_APPROVAL' && (
                        <div className="flex gap-3">
                            <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-rose-600 hover:bg-rose-50">Cancel Batch</Button>
                            <Button className="rounded-xl px-8 bg-indigo-600 shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-widest text-white border-none" onClick={() => disburseMutation.mutate(activeBatch.id)} disabled={disburseMutation.isPending}>
                                {disburseMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Approve & Disburse
                            </Button>
                        </div>
                    )}
                </CardFooter>
              </Card>
            )}

            {/* Item List */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">Salary Distribution Schedule</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="space-y-2">
                        {activeBatch.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 tracking-tight">{item.recipient_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[8px] h-4 font-bold tracking-widest">NUBAN</Badge>
                                            <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest">{item.recipient_account}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 tracking-tight">₦{parseFloat(item.amount).toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        ) : (
           <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                <div className="bg-white p-8 rounded-[32px] shadow-sm inline-block mb-6 ring-1 ring-slate-100">
                    <Activity className="h-12 w-12 text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-900">No Active Payroll Sessions</h4>
                <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">Start a corporate disbursement session by uploading a salary instruction file.</p>
                <Button className="mt-10 bg-indigo-600 rounded-2xl px-10 h-12 text-white border-none shadow-xl shadow-indigo-100 font-bold" onClick={() => setIsUploading(true)}>Initiate Session</Button>
           </div>
        )}
      </div>
    </Layout>
  );
};

export default CorporatePayroll;
