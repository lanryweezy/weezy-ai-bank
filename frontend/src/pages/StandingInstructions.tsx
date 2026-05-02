import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch, Plus, ArrowRight, ShieldCheck, RefreshCw, Activity, AlertTriangle, Calendar, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StandingInstructions = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
      source_account_number: '9990011223',
      destination_account_number: '',
      destination_bank_code: '999',
      amount: '',
      narration: '',
      frequency: 'MONTHLY',
      start_date: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: instructions, isLoading, refetch } = useQuery({
    queryKey: ['myInstructions'],
    queryFn: () => apiClient('/corebanking/recurring/me'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/recurring/create', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Recurring payment schedule active!');
      setIsCreating(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Schedule failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/corebanking/recurring/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Instruction cancelled.');
      refetch();
    },
  });

  const handleCreate = () => {
      if(!formData.destination_account_number || !formData.amount) {
          toast.error("Required fields missing.");
          return;
      }
      createMutation.mutate({
          ...formData,
          amount: parseFloat(formData.amount)
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'ACTIVE': return <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 text-[8px] font-black uppercase">Active</Badge>;
        case 'PAUSED': return <Badge className="bg-amber-50 text-amber-700 border-none px-2 text-[8px] font-black uppercase">Suspended</Badge>;
        case 'CANCELLED': return <Badge className="bg-slate-100 text-slate-500 border-none px-2 text-[8px] font-black uppercase">Stopped</Badge>;
        default: return <Badge variant="outline" className="text-[8px]">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                AUTO-SETTLE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><GitBranch className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Standing Instructions & Automated Recurring Payments.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> New Auto-Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Active Schedules */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Live Automations</h3>
                <div className="space-y-4">
                    {instructions?.map((si: any) => (
                        <Card key={si.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="bg-indigo-50 p-4 rounded-[24px] text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-lg font-black text-slate-900 tracking-tight">₦{parseFloat(si.amount).toLocaleString()} • {si.frequency}</p>
                                            {getStatusBadge(si.status)}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                                                <ArrowRight className="h-3 w-3" /> To: {si.destination_account_number} ({si.destination_bank_code})
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Next Run: {format(new Date(si.next_run_date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {si.status === 'ACTIVE' && (
                                    <Button variant="ghost" className="rounded-xl h-11 w-11 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all" onClick={() => cancelMutation.mutate(si.id)}>
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}

                    {instructions?.length === 0 && (
                        <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">No Recurring Schedules</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2">Automate your rent, subscriptions, or savings contributions.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Insights Sidebar */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Scheduler Intelligence</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Bulletproof Execution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                            "Standing instructions are triggered at 01:00 AM WAT. If the source balance is insufficient, the system will retry once at 06:00 AM before suspending the schedule."
                        </p>
                        <div className="mt-6 flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Atomic Settlement</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> NIBSS Compliance
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "Inter-bank standing instructions are processed via the NIBSS ACH portal. Ensure the beneficiary bank supports automated clearing for timely settlement."
                    </p>
                </div>
            </div>
        </div>

        {/* Create Modal */}
        {isCreating && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <GitBranch className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Schedule Payment</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Recurring Transfer Protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destination Bank</Label>
                                    <select 
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                        value={formData.destination_bank_code}
                                        onChange={e => setFormData({...formData, destination_bank_code: e.target.value})}
                                    >
                                        <option value="999">WEEZY (INTERNAL)</option>
                                        <option value="011">First Bank</option>
                                        <option value="058">GTBank</option>
                                        <option value="033">United Bank for Africa</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Beneficiary NUBAN</Label>
                                    <Input placeholder="0011223344" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" value={formData.destination_account_number} onChange={e => setFormData({...formData, destination_account_number: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount (₦)</Label>
                                <Input placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-indigo-600 text-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Frequency</Label>
                                    <select 
                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                        value={formData.frequency}
                                        onChange={e => setFormData({...formData, frequency: e.target.value})}
                                    >
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly</option>
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="ANNUALLY">Annually</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</Label>
                                    <Input type="date" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Narration</Label>
                                <Input placeholder="e.g. Monthly Rent" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-medium" value={formData.narration} onChange={e => setFormData({...formData, narration: e.target.value})} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none" onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Schedule'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default StandingInstructions;
