import React, { useState } from 'react';
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
  MessageSquare,
  Globe,
  Cpu,
  ChevronRight
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
        case 'GSI_TRIGGERED': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'LEGAL_RECOVERY': return 'bg-slate-900 text-white border-white/10';
        case 'SOFT_RECOVERY': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Recovery Cockpit <div className="bg-red-600 p-2 rounded-2xl shadow-2xl shadow-red-500/20"><ShieldAlert className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> AI Default Prediction & GSI Enforcement
            </p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/5 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                <History className="mr-3 h-5 w-5" /> Collection Logs
             </Button>
             <Button onClick={() => refetch()} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
                <RefreshCw className={`mr-3 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Portfolio
             </Button>
          </div>
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
                { label: 'NPL Ratio', value: '3.2%', icon: BarChart3, color: 'red' },
                { label: 'Pending GSI', value: '14', icon: Landmark, color: 'indigo' },
                { label: 'AI Resolution', value: '72%', icon: Zap, color: 'emerald' },
                { label: 'Net Arrears', value: '₦42.5M', icon: Gavel, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="obsidian-card p-10 flex flex-col justify-between group h-[220px]">
                    <div className="flex justify-between items-start">
                         <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl border border-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-7 w-7" />
                         </div>
                         <div className={`w-1.5 h-1.5 bg-${stat.color}-500 rounded-full animate-pulse shadow-[0_0_10px_currentColor]`} />
                    </div>
                    <div className="mt-8">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{stat.value}</h3>
                    </div>
                </Card>
            ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-1 group">
                <Search className="h-6 w-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                    placeholder="SCAN DELINQUENT ENTITIES OR LOAN REFS..."
                    className="pl-16 h-18 rounded-[32px] bg-white/5 border-white/5 focus-visible:ring-1 focus-visible:ring-indigo-500/50 font-black text-xs text-white placeholder:text-slate-700 italic tracking-widest shadow-2xl transition-all"
                />
            </div>
            <Button variant="outline" className="h-18 px-10 rounded-[32px] border-white/5 bg-white/5 hover:bg-white/10 font-black text-[10px] uppercase tracking-[0.2em] text-slate-300">
                <Filter className="h-5 w-5 mr-3 text-indigo-400" /> Filter Risk Buckets
            </Button>
        </div>

        <div className="space-y-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white text-center">Critical Delinquency Pipeline</h3>
            <div className="space-y-6">
                {recoveryCases?.map((caseItem) => (
                    <Card key={caseItem.id} className="obsidian-card border-none hover:border-red-500/20 transition-all duration-700 overflow-hidden group cursor-pointer border-l-2 border-transparent">
                        <div className="flex flex-col md:flex-row">
                            <div className={`md:w-3 shrink-0 ${caseItem.pd_score > 90 ? 'bg-red-600 animate-pulse' : caseItem.pd_score > 70 ? 'bg-orange-500' : 'bg-indigo-600'}`} />
                            <div className="p-10 flex-1">
                                <div className="flex justify-between items-start mb-10 gap-10">
                                    <div className="flex items-center gap-10 flex-1">
                                        <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6">
                                            <Smartphone className="h-8 w-8 text-indigo-400 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-6 mb-4">
                                                <p className="font-black text-white text-2xl tracking-tighter uppercase italic">{caseItem.name}</p>
                                                <Badge className={`${getStatusColor(caseItem.status)} text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-lg`}>{caseItem.status.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">REF: {caseItem.ref}</p>
                                                <p className="text-[10px] text-red-400 font-black uppercase tracking-widest flex items-center gap-3">
                                                    <Clock className="h-4 w-4" /> {caseItem.overdue_days} Days Overdue
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-3 italic">
                                                    <MessageSquare className="h-4 w-4 text-indigo-500" /> {caseItem.last_comm}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic opacity-60">Outstanding Balance</p>
                                        <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase">₦{caseItem.amount}</h4>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 gap-10">
                                    <div className="flex items-center gap-12 w-full md:w-auto">
                                        <div className="space-y-4">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-3 italic">
                                                <Activity className="h-4 w-4 text-indigo-500" /> AI Probability of Default (PD)
                                            </p>
                                            <div className="flex items-center gap-5">
                                                <div className="w-48 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                                    <div className={`h-full ${caseItem.pd_score > 80 ? 'bg-red-600 shadow-[0_0_10px_#ef4444]' : 'bg-orange-500'} rounded-full transition-all duration-[2000ms]`} style={{ width: `${caseItem.pd_score}%` }} />
                                                </div>
                                                <span className={`text-sm font-black italic uppercase ${caseItem.pd_score > 80 ? 'text-red-500' : 'text-orange-400'}`}>{caseItem.pd_score}% RISK</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Button variant="ghost" className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                            Restructure Node
                                        </Button>
                                        <Button 
                                            className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white border-none shadow-2xl shadow-red-500/20 transition-all active:scale-95 italic"
                                            onClick={() => gsiMutation.mutate(caseItem.id)}
                                            disabled={gsiMutation.isPending}
                                        >
                                            {gsiMutation.isPending ? 'Executing...' : 'Trigger GSI Sweep'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
            <Card className="bg-slate-900 border-none shadow-2xl rounded-[60px] overflow-hidden relative group h-[340px]">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Landmark className="h-48 w-48 text-red-500" />
                </div>
                <div className="p-14 relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-8">
                         <div className="bg-white/10 p-5 rounded-[32px] backdrop-blur-md border border-white/10 shadow-2xl">
                            <Gavel className="h-10 w-10 text-red-400" />
                         </div>
                         <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-lg">NIBSS SYNCHRONIZED</Badge>
                    </div>
                    <div className="space-y-4">
                        <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">GSI Enforcement Protocol</CardTitle>
                        <p className="text-[13px] text-slate-400 leading-relaxed italic font-medium max-w-sm">
                            "Triggering the Global Standing Instruction authorizes Weezy AI to autonomously sweep liquidity from all 24 Nigerian commercial bank nodes linked to this debtor."
                        </p>
                    </div>
                    <div className="pt-8 flex items-center gap-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Legal Mandate v2.0 ACTIVE</span>
                    </div>
                </div>
            </Card>

            <div className="obsidian-card p-14 flex flex-col justify-center relative overflow-hidden group h-[340px]">
                 <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Sparkles className="h-48 w-48 text-indigo-500" />
                 </div>
                 <div className="space-y-8 relative z-10">
                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] italic mb-6">Cognitive Outreach Results</h4>
                    <p className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase">
                        "Autonomous soft-collection nodes recovered <span className="text-emerald-400">₦12.4M</span> this cycle via predictive nudge logic."
                    </p>
                    <p className="text-xs text-slate-500 font-medium italic leading-relaxed max-w-xs">
                        System successfully resolved 42 early-stage delinquency vectors without human intervention.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 hover:text-indigo-300 transition-colors flex items-center gap-4 group">
                        View Intelligence Trace <ChevronRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default LoanRecovery;
