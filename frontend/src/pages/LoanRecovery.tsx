import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Activity, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  Smartphone, 
  Gavel, 
  Landmark, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { toast } from 'sonner';

const LoanRecovery = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: recoveryCases, isLoading, refetch } = useQuery({
    queryKey: ['recoveryCases'],
    queryFn: () => [
        { id: 1, name: 'Tunde Bakare', ref: 'LN-9920-X', amount: '450,000', overdue_days: 14, pd_score: 82, status: 'SOFT_RECOVERY', last_comm: 'SMS Sent (2h ago)' },
        { id: 2, name: 'Folake Ademola', ref: 'LN-4421-B', amount: '1,200,000', overdue_days: 45, pd_score: 95, status: 'GSI_TRIGGERED', last_comm: 'Email Sent (1d ago)' },
        { id: 3, name: 'Chidi Okoro', ref: 'LN-1025-Z', amount: '85,000', overdue_days: 4, pd_score: 42, status: 'REMINDER_PHASE', last_comm: 'N/A' },
        { id: 4, name: 'SME Logistics Ltd', ref: 'LN-8872-W', amount: '4,500,000', overdue_days: 92, pd_score: 99, status: 'LEGAL_RECOVERY', last_comm: 'Demand Notice Served' }
    ],
  });

  const gsiMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/corebanking/loans/recovery/gsi-trigger`, { method: 'POST', body: JSON.stringify({ case_id: id }) }),
    onSuccess: () => {
        toast.success('GSI Protocol Initiated across all Nigerian banks.');
        refetch();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'GSI_TRIGGERED': return 'bg-rose-100 text-rose-700 border-none';
        case 'LEGAL_RECOVERY': return 'bg-slate-900 text-white border-none';
        case 'SOFT_RECOVERY': return 'bg-amber-50 text-amber-700 border-none';
        default: return 'bg-indigo-50 text-indigo-700 border-none';
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic uppercase">
                RECOVERY COCKPIT <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200"><ShieldAlert className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">AI Default Prediction & Global Standing Instruction (GSI) Management.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm">
                <History className="mr-2 h-4 w-4" /> Collection Logs
             </Button>
             <Button onClick={() => refetch()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Portfolio
             </Button>
          </div>
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'NPL Ratio', value: '3.2%', icon: BarChart3, color: 'rose' },
                { label: 'Pending GSI', value: '14', icon: Landmark, color: 'indigo' },
                { label: 'AI Recovery rate', value: '72%', icon: Zap, color: 'emerald' },
                { label: 'Total in Arrears', value: '₦42.5M', icon: Gavel, color: 'blue' },
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

        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 group">
                <Search className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                    placeholder="Search by name, loan ref, or risk level..."
                    className="pl-14 h-16 rounded-[24px] bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-4 focus-visible:ring-indigo-500/10 font-medium text-sm shadow-inner transition-all"
                />
            </div>
            <Button variant="outline" className="h-16 px-8 rounded-[24px] border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
                <Filter className="h-4 w-4 mr-2" /> All Risk Buckets
            </Button>
        </div>

        <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Critical Delinquency Feed</h3>
            <div className="space-y-4">
                {recoveryCases?.map((caseItem) => (
                    <Card key={caseItem.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-xl transition-all duration-500 overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                            <div className={`md:w-2 shrink-0 ${caseItem.pd_score > 90 ? 'bg-rose-600 animate-pulse' : caseItem.pd_score > 70 ? 'bg-orange-500' : 'bg-indigo-400'}`} />
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 rounded-[20px] bg-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            <Smartphone className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="font-black text-slate-900 text-lg tracking-tight uppercase italic">{caseItem.name}</p>
                                                <Badge className={`${getStatusColor(caseItem.status)} text-[8px] font-black tracking-widest px-2 py-0.5 ring-1 ring-slate-200/50`}>{caseItem.status.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">REF: {caseItem.ref}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3 text-rose-400" /> {caseItem.overdue_days} Days Overdue
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <MessageSquare className="h-3 w-3 text-indigo-400" /> {caseItem.last_comm}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Outstanding</p>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">₦{caseItem.amount}</h4>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-10">
                                        <div>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Activity className="h-3 w-3 text-indigo-600" /> PD SCORE (AI)
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full ${caseItem.pd_score > 80 ? 'bg-rose-500' : 'bg-amber-500'} rounded-full`} style={{ width: `${caseItem.pd_score}%` }} />
                                                </div>
                                                <span className={`text-xs font-black italic ${caseItem.pd_score > 80 ? 'text-rose-600' : 'text-amber-600'}`}>{caseItem.pd_score}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                                            Manage Plan
                                        </Button>
                                        <Button 
                                            className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white border-none shadow-lg shadow-rose-100 transition-all active:scale-95"
                                            onClick={() => gsiMutation.mutate(caseItem.id)}
                                            disabled={gsiMutation.isPending}
                                        >
                                            {gsiMutation.isPending ? 'Triggering...' : 'Initiate GSI'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
            <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[40px] overflow-hidden relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
                <div className="p-10 relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                         <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                            <Landmark className="h-8 w-8 text-indigo-400" />
                         </div>
                         <Badge className="bg-emerald-500 text-white border-none text-[9px] px-3 font-black">NIBSS CONNECTED</Badge>
                    </div>
                    <CardTitle className="text-2xl font-black italic tracking-tighter uppercase">Global Standing Instruction</CardTitle>
                    <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
                        "Triggering GSI authorizes the system to automatically sweep funds from any linked bank account belonging to the debtor across the entire Nigerian financial switch."
                    </p>
                    <div className="pt-4 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Mandate v2.0 Active</span>
                    </div>
                </div>
            </Card>

            <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <MessageSquare className="h-32 w-32 text-indigo-600" />
                 </div>
                 <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em] mb-4">Autonomous Outreach</h4>
                 <p className="text-sm text-indigo-900 font-bold leading-relaxed italic relative z-10">
                    "Weezy Prime has successfully recovered ₦12.4M this month via automated AI-driven soft collection protocols (Predictive Reminders)."
                 </p>
                 <Button variant="link" className="p-0 h-auto mt-8 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:no-underline flex items-center gap-2">
                    View Recovery Analytics <ExternalLink className="h-3 w-3" />
                 </Button>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanRecovery;
