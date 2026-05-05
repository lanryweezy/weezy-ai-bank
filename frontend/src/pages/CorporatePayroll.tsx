import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, Search, FileJson, Activity, AlertTriangle, CheckCircle2, ShieldCheck, Users, Sparkles, RefreshCw, Cpu, Database, ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const CorporatePayroll = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [fundingAccount, setFundingAccount] = useState('');
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => JSON.parse(localStorage.getItem('user') || '{}'),
  });

  const { data: myAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const { data: activeBatch, refetch: refetchBatch } = useQuery({
    queryKey: ['payrollBatch', activeBatchId],
    queryFn: () => apiClient(`/payroll/${activeBatchId}`),
    enabled: !!activeBatchId,
    refetchInterval: (data: any) => data?.status === 'AI_SCANNING' ? 3000 : false,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: any) => apiClient('/payroll/upload', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data: any) => {
      toast.success('Payroll uploaded. AI scan initiated.');
      setActiveBatchId(data.id);
      setIsUploading(false);
    },
    onError: (err: any) => toast.error(err.message || 'Upload failed'),
  });

  const disburseMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/payroll/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Disbursement triggered!');
      refetchBatch();
    },
  });

  const handleDemoUpload = () => {
    if (!fundingAccount) {
        toast.error('Please select a funding account.');
        return;
    }
    const demoData = {
        corporate_customer_id: user?.id || 1,
        source_account_number: fundingAccount,
        items: [
            { recipient_name: "John Doe", recipient_account: "0011223344", recipient_bank_code: "058", amount: 150000 },
            { recipient_name: "Jane Smith", recipient_account: "9988776655", recipient_bank_code: "044", amount: 200000 },
            { recipient_name: "S. O. Adebayo", recipient_account: "0011223344", recipient_bank_code: "011", amount: 150000 }
        ]
    };
    uploadMutation.mutate(demoData);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Enterprise Payroll <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Building2 className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> High-Velocity Bulk Disbursement Engine
            </p>
          </div>
          <Button onClick={() => setIsUploading(true)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
            <Upload className="mr-3 h-5 w-5" /> Initialize Schedule
          </Button>
        </div>

        {isUploading ? (
          <Card className="max-w-3xl obsidian-card overflow-hidden mx-auto border-indigo-500/20">
            <CardHeader className="p-12 text-center border-b border-white/5 bg-white/[0.02]">
              <div className="bg-indigo-500/10 w-24 h-24 rounded-[32px] border border-indigo-500/30 flex items-center justify-center mx-auto mb-8 rotate-3 shadow-2xl">
                <FileJson className="h-12 w-12 text-indigo-400" />
              </div>
              <CardTitle className="text-4xl font-black text-white italic tracking-tighter uppercase">Disbursement Protocol</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4">Identity & Payload Verification Required</CardDescription>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
                <div className="space-y-4 max-w-md mx-auto">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Corporate Funding Node</Label>
                    <select 
                        className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-2xl uppercase text-xs"
                        value={fundingAccount}
                        onChange={e => setFundingAccount(e.target.value)}
                    >
                        <option value="" className="bg-slate-900">Select Liquidity Node...</option>
                        {myAccounts?.map((acc: any) => (
                            <option key={acc.account_number} value={acc.account_number} className="bg-slate-900">{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>
                        ))}
                    </select>
                </div>
                
                <div className="py-24 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01] hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 shimmer opacity-5 pointer-events-none" />
                    <Sparkles className="h-16 w-16 text-slate-800 mx-auto mb-8 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-700" />
                    <p className="text-sm font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-[0.3em] italic">Drop Payload JSON/CSV or Browser Assets</p>
                    <Button variant="outline" className="mt-12 rounded-2xl border-white/10 font-black text-[10px] uppercase tracking-widest h-12 px-8 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white transition-all shadow-2xl" onClick={handleDemoUpload} disabled={uploadMutation.isPending || !fundingAccount}>
                        {uploadMutation.isPending ? 'Executing Neural Scan...' : 'Trigger Demo Simulation'}
                    </Button>
                </div>
            </CardContent>
          </Card>
        ) : activeBatch ? (
          <div className="space-y-12">
            {/* Batch Intelligence Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="obsidian-card p-10 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                             <Database className="h-7 w-7" />
                        </div>
                        <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] px-3 tracking-widest">{activeBatch.status}</Badge>
                    </div>
                    <div className="mt-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Instruction Reference</p>
                        <h3 className="text-2xl font-mono font-black text-white italic tracking-tighter uppercase">{activeBatch.batch_reference}</h3>
                    </div>
                </Card>

                <Card className="obsidian-card p-10 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                             <Users className="h-7 w-7" />
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    </div>
                    <div className="mt-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Disbursement Payload</p>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">₦{parseFloat(activeBatch.total_amount).toLocaleString()}</h3>
                        <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-widest">{activeBatch.item_count} Recipient Nodes Identified</p>
                    </div>
                </Card>

                <Card className={`border-none shadow-2xl rounded-[40px] p-10 flex flex-col justify-between group relative overflow-hidden transition-all duration-700 ${activeBatch.ai_risk_score > 50 ? 'bg-red-600/20 ring-1 ring-red-500/40' : 'bg-slate-900 ring-1 ring-white/5'}`}>
                    <div className="absolute inset-0 shimmer opacity-10 pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className={`p-4 rounded-2xl border ${activeBatch.ai_risk_score > 50 ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-indigo-400'}`}>
                             <ShieldCheck className="h-7 w-7" />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sentient Audit</p>
                    </div>
                    <div className="mt-10 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Anomaly Score</p>
                        <h3 className={`text-5xl font-black italic tracking-tighter ${activeBatch.ai_risk_score > 50 ? 'text-red-500' : 'text-white'}`}>
                            {activeBatch.ai_risk_score || '00'}<span className="text-lg opacity-40">/100</span>
                        </h3>
                    </div>
                </Card>
            </div>

            {/* Neural Observation Report */}
            {activeBatch.ai_anomaly_report && (
              <Card className={`obsidian-card border-none overflow-hidden ring-1 ${activeBatch.ai_risk_score > 50 ? 'ring-red-500/30' : 'ring-emerald-500/30'} animate-in zoom-in-95 duration-700 shadow-2xl shadow-indigo-500/5`}>
                <CardHeader className={`${activeBatch.ai_risk_score > 50 ? 'bg-red-500/5' : 'bg-emerald-500/5'} border-b border-white/5 px-12 py-8 flex flex-row items-center justify-between backdrop-blur-3xl`}>
                    <CardTitle className={`text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 ${activeBatch.ai_risk_score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {activeBatch.ai_risk_score > 50 ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        COGNITIVE AUDIT OBSERVATIONS
                    </CardTitle>
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-ping" />
                </CardHeader>
                <CardContent className="p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Anomalous Data Vectors</p>
                            <div className="space-y-4">
                                {activeBatch.ai_anomaly_report.anomalies?.map((a: string, i: number) => (
                                    <div key={i} className="text-sm text-slate-300 flex items-start gap-5 glass-dark p-6 rounded-3xl border border-white/5 group hover:border-red-500/20 transition-all">
                                        <div className={`h-2 w-2 rounded-full ${activeBatch.ai_risk_score > 50 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'} mt-1.5 shrink-0`} /> 
                                        <span className="font-medium leading-relaxed italic">"{a}"</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-10 glass-dark rounded-[40px] text-white flex flex-col justify-center relative overflow-hidden border border-white/5">
                            <Sparkles className="absolute top-0 right-0 h-48 w-48 -mr-16 -mt-16 opacity-[0.03] text-indigo-500 rotate-12" />
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-4">Prime Recommendation</p>
                            <p className="text-2xl font-black italic tracking-tighter text-white leading-tight uppercase">"{activeBatch.ai_anomaly_report.recommendation}"</p>
                            <p className="text-xs text-slate-500 mt-6 leading-relaxed font-medium italic">
                                Forensic scan complete. System detected {activeBatch.ai_anomaly_report.anomalies?.length || 0} variance nodes. Human oversight is advised before clearing T+0 settlement.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-white/[0.02] justify-between py-10 px-12 border-t border-white/5 backdrop-blur-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Integrity Handshake Optimal</p>
                    </div>
                    {activeBatch.status === 'AWAITING_APPROVAL' && (
                        <div className="flex gap-4">
                            <Button variant="ghost" className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/5 hover:text-red-400 transition-all">Cancel Payload</Button>
                            <Button className="rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/30 font-black text-[11px] uppercase tracking-[0.2em] text-white border-none active:scale-95 transition-all" onClick={() => disburseMutation.mutate(activeBatch.id)} disabled={disburseMutation.isPending}>
                                {disburseMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <CheckCircle2 className="h-5 w-5 mr-3" />} Authorize Disbursement
                            </Button>
                        </div>
                    )}
                </CardFooter>
              </Card>
            )}

            {/* Detailed Item List */}
            <Card className="obsidian-card border-none overflow-hidden flex flex-col">
                <CardHeader className="p-12 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                    <div>
                        <CardTitle className="text-2xl font-black text-white tracking-tighter italic uppercase">Distribution Matrix</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-3">T+0 Settlement Ledger Feed</CardDescription>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-indigo-400">
                        <Database className="h-6 w-6" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {activeBatch.items.map((item: any) => (
                            <div key={item.id} className="p-10 flex items-center justify-between hover:bg-white/[0.02] transition-all group border-l-2 border-transparent hover:border-indigo-500">
                                <div className="flex items-center gap-10">
                                    <div className="bg-white/5 p-5 rounded-[24px] text-slate-500 shadow-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:rotate-6">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white tracking-tight italic uppercase">{item.recipient_name}</p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <Badge variant="outline" className="text-indigo-400 border-indigo-500/20 text-[8px] font-black uppercase tracking-widest px-2">NUBAN</Badge>
                                            <p className="text-[11px] text-slate-500 font-mono font-bold tracking-[0.2em]">{item.recipient_account}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-white tracking-tighter italic uppercase">₦{parseFloat(item.amount).toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-3 mt-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-slate-700'} shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-10 border-t border-white/5 bg-white/[0.01] justify-between">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic flex items-center gap-3">
                        <Activity className="h-4 w-4" /> Atomic Settlement Protocol v1.0
                     </p>
                     <Button variant="link" className="text-indigo-400 font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:no-underline hover:text-indigo-300">View Node Trace →</Button>
                </CardFooter>
            </Card>
          </div>
        ) : (
           <div className="py-48 text-center border-4 border-dashed border-white/5 m-12 rounded-[60px] bg-white/[0.01]">
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 inline-block mb-10 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Activity className="h-20 w-20 text-slate-900 relative z-10 animate-pulse" />
                </div>
                <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Payloads Dormant</h4>
                <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-60 max-w-sm mx-auto">Initialize an enterprise disbursement session to activate the payroll mesh.</p>
                <Button className="mt-12 bg-indigo-600 hover:bg-indigo-500 rounded-[28px] px-14 h-16 text-white border-none shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95" onClick={() => setIsUploading(true)}>Initiate Payload</Button>
           </div>
        )}
    </div>
  );
};

export default CorporatePayroll;
