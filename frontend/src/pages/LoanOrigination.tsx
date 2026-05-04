import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, ArrowRight, ShieldCheck, RefreshCw, Activity, AlertTriangle, Upload, CheckCircle2, UserCheck, Briefcase } from 'lucide-react';
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
        case 'APPROVED': return <Badge className="bg-emerald-100 text-emerald-700 border-none">APPROVED</Badge>;
        case 'UNDER_REVIEW': return <Badge className="bg-blue-100 text-blue-700 border-none">AI APPRAISAL</Badge>;
        case 'REJECTED': return <Badge className="bg-rose-100 text-rose-700 border-none">REJECTED</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                CREDIT PORTAL <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Briefcase className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">AI-Native Loan Origination & Real-time Risk Appraisal.</p>
          </div>
          <Button onClick={() => setStep(1)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> New Credit Request
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Form / Status */}
            <div className="lg:col-span-2 space-y-8">
                {step === 1 && (
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
                            <CardTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                                <FileText className="h-6 w-6 text-indigo-600" /> Financial Declaration
                            </CardTitle>
                            <CardDescription className="font-medium mt-2">Enter your loan requirements and monthly financial standing.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Loan Product</Label>
                                    <select 
                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                        value={formData.product_id}
                                        onChange={e => setFormData({...formData, product_id: parseInt(e.target.value)})}
                                    >
                                        {products?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requested Amount (₦)</Label>
                                    <Input placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-xl text-indigo-600" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tenor (Months)</Label>
                                    <Input placeholder="12" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.tenor_months} onChange={e => setFormData({...formData, tenor_months: e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Monthly Income (₦)</Label>
                                    <Input placeholder="Your take-home" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purpose of Loan</Label>
                                <Input placeholder="e.g. SME Expansion / Medical Bills" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-medium" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Disbursement NUBAN (Target)</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-inner"
                                    value={formData.disbursement_account_number}
                                    onChange={e => setFormData({...formData, disbursement_account_number: e.target.value})}
                                >
                                    <option value="">Select account for funds...</option>
                                    {myAccounts?.map((acc: any) => (
                                        <option key={acc.account_number} value={acc.account_number}>{acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <Button 
                                className="w-full bg-indigo-600 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 mt-4 text-white border-none" 
                                onClick={() => setStep(2)}
                                disabled={!formData.disbursement_account_number || !formData.amount}
                            >
                                Continue to Documentation <ArrowRight className="ml-3 h-5 w-5" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden text-center py-20">
                        <div className="bg-indigo-50 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-50 rotate-3">
                            <Upload className="h-10 w-10 text-indigo-600" />
                        </div>
                        <CardTitle className="text-3xl font-black tracking-tight">Identity & Statement</CardTitle>
                        <CardDescription className="max-w-xs mx-auto mt-4 font-medium">We require a clear NIN slip and 6 months bank statement to complete your appraisal.</CardDescription>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
                                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Upload NIN Slip</p>
                                    <UserCheck className="h-8 w-8 text-slate-200 mx-auto" />
                                </div>
                                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Bank Statement</p>
                                    <Activity className="h-8 w-8 text-slate-200 mx-auto" />
                                </div>
                            </div>
                            <Button className="mt-12 bg-indigo-600 h-14 px-12 rounded-2xl font-black shadow-xl shadow-indigo-100 text-white border-none" onClick={handleApply} disabled={applyMutation.isPending}>
                                {applyMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                                Submit for AI Appraisal
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Application Pipeline</h3>
                        {applications?.map((app: any) => (
                            <Card key={app.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-xl transition-all duration-500 overflow-hidden group">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-8 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black tracking-widest uppercase mb-2">{app.application_reference}</Badge>
                                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">₦{parseFloat(app.requested_amount).toLocaleString()}</h4>
                                            </div>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Tenor</p>
                                                <p className="text-sm font-bold text-slate-700">{app.requested_tenor_months} Months</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Purpose</p>
                                                <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{app.loan_purpose}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Submitted</p>
                                                <p className="text-sm font-bold text-slate-700">{new Date(app.submitted_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`bg-indigo-600 md:w-3 flex-shrink-0 ${app.status === 'REJECTED' ? 'bg-rose-500' : app.status === 'APPROVED' ? 'bg-emerald-500' : ''}`} />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: AI Insights */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Origination Pulse</h3>
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[32px] overflow-hidden relative group">
                    <Activity className="absolute bottom-[-10px] left-[-10px] h-32 w-32 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Policy Compliance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Max Debt-to-Income</p>
                                <p className="text-xl font-black text-white">33.3% <span className="text-[10px] text-slate-500 font-normal">CBN Standard</span></p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Min Credit Score</p>
                                <p className="text-xl font-black text-white">650 / 900</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Live Scoring Note
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "Weezy Prime is currently analyzing 142 active credit applications. Average appraisal time is down to 4.2 seconds for Tier 3 customers."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanOrigination;
