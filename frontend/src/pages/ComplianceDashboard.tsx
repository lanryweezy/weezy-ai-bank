import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertCircle, CheckCircle2, UserCheck, Activity, Search, RefreshCw, Info, ShieldCheck, Database, Zap, Cpu } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ComplianceDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: alerts, isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => apiClient<any[]>('/risk/alerts/elevated'),
    refetchInterval: 30000,
  });

  const assessMutation = useMutation({
    mutationFn: (customerId: number) => apiClient(`/risk/${customerId}/assess`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Risk assessment completed by Weezy AI');
      refetchAlerts();
    },
  });

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-50 text-rose-700 ring-rose-500/20';
      case 'HIGH': return 'bg-orange-50 text-orange-700 ring-orange-500/20';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 ring-amber-500/20';
      default: return 'bg-emerald-50 text-emerald-700 ring-emerald-500/20';
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                RISK SHIELD <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200 animate-pulse"><ShieldAlert className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">AI-Native AML Monitoring & Nigerian Regulatory Compliance Core.</p>
          </div>
          <Badge className="bg-slate-900 text-indigo-400 border-indigo-500/30 px-4 py-1.5 font-black text-[9px] tracking-widest uppercase">Level 4 Surveillance</Badge>
        </div>

        {/* Compliance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Screened Entities', value: '42,108', icon: Activity, color: 'indigo' },
                { label: 'Active Alerts', value: alerts?.length || '0', icon: AlertCircle, color: 'rose' },
                { label: 'NFIU Reports', value: '14', icon: Database, color: 'emerald' },
                { label: 'System Integrity', value: 'STABLE', icon: ShieldCheck, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Alerts Column */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Elevated Risk Stream</h3>
                <Button variant="ghost" size="sm" onClick={() => refetchAlerts()} className="text-slate-400 hover:text-indigo-600 rounded-xl">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingAlerts ? 'animate-spin' : ''}`} /> Sync Alerts
                </Button>
              </div>
              
              <div className="space-y-4">
                {alerts?.length > 0 ? (
                    alerts.map((alert: any) => (
                        <Card key={alert.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="p-8 flex items-start justify-between gap-6">
                                <div className="flex gap-6">
                                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-all">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{alert.event_type}</p>
                                            <Badge className={`${getRiskColor(alert.severity)} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ring-1`}>{alert.severity}</Badge>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md">{alert.description}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                            <Activity className="h-3 w-3" /> Detect Time: {new Date(alert.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest h-10 px-6 bg-white hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                    Investigate
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                        <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-slate-900">Surveillance Clear</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2">No critical AML/Risk violations detected in the last 24 hours.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Manual Probe & Intelligence Sidebar */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Analytical Probe</h3>
              <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[32px] overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 text-center">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto mb-4">
                        <Search className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Pattern Search</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Customer Identifier</Label>
                        <Input placeholder="Enter Customer ID..." id="risk_cust_id" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" />
                    </div>
                    <Button 
                        className="w-full bg-slate-900 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white border-none shadow-xl active:scale-95 transition-all"
                        onClick={() => {
                            const id = (document.getElementById('risk_cust_id') as HTMLInputElement).value;
                            if(id) assessMutation.mutate(parseInt(id));
                        }} 
                        disabled={assessMutation.isPending}
                    >
                        {assessMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-3" /> : <Cpu className="h-4 w-4 mr-3" />}
                        Run AI Assessment
                    </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                 <CardHeader className="p-8 pb-4 relative z-10">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                        <Info className="h-4 w-4" /> CBN GOVERNANCE
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="px-8 pb-10 relative z-10 space-y-5">
                    {[
                        "High-velocity movements in Tier 1 accounts must be flagged.",
                        "Sanction list matches require immediate suspension.",
                        "PEPs require Enhanced Due Diligence (EDD).",
                        "Cash over ₦5M (Indiv.) or ₦10M (Corp.) must hit NFIU."
                    ].map((rule, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{rule}"</p>
                        </div>
                    ))}
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComplianceDashboard;
