import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, ArrowRight, ShieldCheck, RefreshCw, Activity, AlertTriangle, Upload, CheckCircle2, UserCheck, Briefcase, Cpu, Zap, Globe, Smartphone, Database, ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const LoanOrigination = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      product_id: 1,
      amount: '',
      tenor_months: '12',
      purpose: '',
      monthly_income: '',
      disbursement_account_number: ''
  });

  const { data: myAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const { data: products } = useQuery({
    queryKey: ['loanProducts'],
    queryFn: () => apiClient('/corebanking/loans/products'),
  });

  const { data: applications, refetch: refetchApps } = useQuery({
    queryKey: ['myLoanApps'],
    queryFn: () => apiClient('/corebanking/loans/origination/my-applications'),
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/loans/origination/apply', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Loan application submitted for AI appraisal!');
      setStep(3);
      refetchApps();
    },
    onError: (err: any) => toast.error(err.message || 'Application failed'),
  });

  const handleApply = () => {
      applyMutation.mutate({
          ...formData,
          amount: parseFloat(formData.amount),
          tenor_months: parseInt(formData.tenor_months),
          monthly_income: parseFloat(formData.monthly_income)
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'APPROVED': return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 font-black text-[9px] uppercase tracking-widest rounded-lg">APPROVED</Badge>;
        case 'UNDER_REVIEW': return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 font-black text-[9px] uppercase tracking-widest animate-pulse rounded-lg">AI APPRAISAL</Badge>;
        case 'REJECTED': return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 font-black text-[9px] uppercase tracking-widest rounded-lg">REJECTED</Badge>;
        default: return <Badge variant="outline" className="border-white/10 text-slate-500">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Credit Portal <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Briefcase className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> AI-Native Loan Origination & Risk Appraisal
            </p>
          </div>
          <Button onClick={() => setStep(1)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
            <Plus className="mr-3 h-5 w-5" /> New Credit Request
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Form / Status */}
            <div className="lg:col-span-2 space-y-10">
                {step === 1 && (
                    <Card className="obsidian-card border-none overflow-hidden border border-white/5">
                        <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-5 text-white uppercase leading-none">
                                <FileText className="h-10 w-10 text-indigo-400" /> Financial Declaration
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4">Authorized Credit Allocation Protocol</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Product</Label>
                                    <select 
                                        className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-2xl uppercase text-xs"
                                        value={formData.product_id}
                                        onChange={e => setFormData({...formData, product_id: parseInt(e.target.value)})}
                                    >
                                        {products?.map((p: any) => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Requested Capital (₦)</Label>
                                    <Input placeholder="0.00" className="h-16 rounded-3xl bg-white/5 border-white/5 px-8 font-black text-2xl text-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-500/50" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maturity Horizon (Months)</Label>
                                    <Input placeholder="12" className="h-16 rounded-3xl bg-white/5 border-white/5 px-8 font-black text-white italic" value={formData.tenor_months} onChange={e => setFormData({...formData, tenor_months: e.target.value})} />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Monthly Inflow (₦)</Label>
                                    <Input placeholder="Net Revenue" className="h-16 rounded-3xl bg-white/5 border-white/5 px-8 font-black text-white italic" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Utilization Narrative</Label>
                                <Input placeholder="e.g. Asset Expansion / Liquidity Optimization" className="h-16 rounded-3xl bg-white/5 border-white/5 px-8 font-black text-white italic" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Disbursement Node (Target)</Label>
                                <select 
                                    className="w-full h-16 px-8 rounded-3xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-2xl uppercase text-xs"
                                    value={formData.disbursement_account_number}
                                    onChange={e => setFormData({...formData, disbursement_account_number: e.target.value})}
                                >
                                    <option value="" className="bg-slate-900">Select target NUBAN...</option>
                                    {myAccounts?.map((acc: any) => (
                                        <option key={acc.account_number} value={acc.account_number} className="bg-slate-900">{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-8">
                                <Button 
                                    className="w-full bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none" 
                                    onClick={() => setStep(2)}
                                    disabled={!formData.disbursement_account_number || !formData.amount}
                                >
                                    PROCEED TO PAYLOAD AUTH <ArrowRight className="ml-4 h-6 w-6" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="obsidian-card border-none overflow-hidden text-center py-24 flex flex-col items-center justify-center">
                        <div className="bg-indigo-500/10 w-32 h-32 rounded-[48px] border border-indigo-500/20 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(99,102,241,0.2)] rotate-6">
                            <Upload className="h-14 w-14 text-indigo-400" />
                        </div>
                        <CardTitle className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Identity Handshake</CardTitle>
                        <CardDescription className="max-w-md mx-auto mt-6 text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] italic leading-relaxed">
                            Synchronizing NIN Slip and 6-Month Liquidity Statement for Neural Appraisal.
                        </CardDescription>
                        <CardContent className="p-12 w-full max-w-2xl mt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-10 border-2 border-dashed border-white/5 rounded-[40px] hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all cursor-pointer group">
                                    <UserCheck className="h-10 w-10 text-slate-700 mx-auto mb-6 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">NIN IDENTITY</p>
                                </div>
                                <div className="p-10 border-2 border-dashed border-white/5 rounded-[40px] hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all cursor-pointer group">
                                    <Database className="h-10 w-10 text-slate-700 mx-auto mb-6 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">LEDGER DUMP</p>
                                </div>
                            </div>
                            <div className="mt-16 space-y-4">
                                <Button className="w-full bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none" onClick={handleApply} disabled={applyMutation.isPending}>
                                    {applyMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                                    INITIATE NEURAL SCAN
                                </Button>
                                <Button variant="ghost" className="w-full h-14 font-black text-slate-700 uppercase tracking-widest text-[10px] hover:text-white" onClick={() => setStep(1)}>Abort Sequence</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <div className="space-y-10">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Asset Allocation Pipeline</h3>
                        <div className="space-y-6">
                        {applications?.map((app: any) => (
                            <Card key={app.id} className="obsidian-card border-none hover:border-indigo-500/20 transition-all duration-700 overflow-hidden group border-l-2 border-transparent hover:border-indigo-500">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-10 flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <Badge className="bg-white/5 text-slate-500 border border-white/10 text-[9px] font-black tracking-widest uppercase mb-4 px-4 py-1 rounded-lg italic">REF: {app.application_reference}</Badge>
                                                <h4 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">₦{parseFloat(app.requested_amount).toLocaleString()}</h4>
                                            </div>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Horizon</p>
                                                <p className="text-lg font-black text-white italic">{app.requested_tenor_months} Months</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Purpose</p>
                                                <p className="text-sm font-black text-slate-400 italic truncate max-w-[200px] uppercase">{app.loan_purpose}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">Handshake</p>
                                                <p className="text-sm font-black text-slate-300 italic">{new Date(app.submitted_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-700 hover:text-white hover:bg-white/5">
                                                    <ChevronRight className="h-6 w-6" />
                                                 </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`md:w-4 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity ${app.status === 'REJECTED' ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : app.status === 'APPROVED' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-indigo-600'}`} />
                                </div>
                            </Card>
                        ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: AI Strategic Side */}
            <div className="space-y-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Cognitive Intel</h3>
                <Card className="obsidian-card bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/10 overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 flex items-center gap-4 italic leading-none">
                            <ShieldCheck className="h-5 w-5" /> Mandatory Thresholds
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-4 space-y-10 relative z-10">
                        <div className="space-y-6">
                            <div className="p-6 glass-dark rounded-[32px] border border-white/5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Max Exposure (DTI)</p>
                                <p className="text-2xl font-black text-white italic tracking-tighter uppercase">33.3% <span className="text-[10px] text-slate-600 font-bold ml-2">CBN LIMIT</span></p>
                            </div>
                            <div className="p-6 glass-dark rounded-[32px] border border-white/5">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Min Probability Score</p>
                                <p className="text-2xl font-black text-white italic tracking-tighter uppercase">650 <span className="text-[10px] text-slate-600 font-bold ml-2">900 MAX</span></p>
                            </div>
                        </div>
                        <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-center gap-4">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest italic">Surveillance Active</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden group">
                    <Sparkles className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-4 italic leading-none">
                        <Activity className="h-5 w-5 text-indigo-400" /> Agent Pulse
                    </h4>
                    <p className="text-sm text-slate-400 italic leading-relaxed font-medium relative z-10">
                        "Prime is currently orchestrating 142 credit sessions. Average node response: 4.2ms. Tier 3 auto-approvals active."
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoanOrigination;
