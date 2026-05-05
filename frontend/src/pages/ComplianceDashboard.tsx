import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertCircle, CheckCircle2, UserCheck, Activity, Search, RefreshCw, Info, ShieldCheck, Database, Zap, Cpu, Globe, ArrowRight, Shield } from 'lucide-react';
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
      case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Risk Shield <div className="bg-red-600 p-2 rounded-2xl shadow-2xl shadow-red-500/20"><ShieldAlert className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> AI-Native Surveillance & Compliance Core
            </p>
          </div>
          <Badge className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 font-mono text-[10px] tracking-widest uppercase rounded-xl">Surveillance Tier 4 Active</Badge>
        </div>

        {/* Compliance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
                { label: 'Screened Entities', value: '42,108', icon: Activity, color: 'indigo' },
                { label: 'Active Alerts', value: alerts?.length || '0', icon: AlertCircle, color: 'red' },
                { label: 'NFIU Packets', value: '14', icon: Database, color: 'emerald' },
                { label: 'Health Status', value: 'STABLE', icon: ShieldCheck, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="obsidian-card p-10 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl border border-${stat.color}-500/20 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-7 w-7" />
                         </div>
                         <div className={`w-1.5 h-1.5 bg-${stat.color}-500 rounded-full animate-pulse`} />
                    </div>
                    <div className="mt-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{stat.value}</h3>
                    </div>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Alerts Column */}
           <div className="lg:col-span-2 space-y-10">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-white">Elevated Risk Vector Stream</h3>
                <Button variant="ghost" size="sm" onClick={() => refetchAlerts()} className="text-slate-500 hover:text-white rounded-xl hover:bg-white/5 h-10 px-4">
                    <RefreshCw className={`h-4 w-4 mr-3 ${loadingAlerts ? 'animate-spin' : ''}`} /> Sync Nodes
                </Button>
              </div>
              
              <div className="space-y-6">
                {alerts?.length > 0 ? (
                    alerts.map((alert: any) => (
                        <Card key={alert.id} className="obsidian-card border-none hover:border-red-500/20 transition-all duration-700 overflow-hidden group cursor-pointer border-l-2 border-transparent">
                            <div className="p-10 flex items-start justify-between gap-10">
                                <div className="flex gap-10 flex-1">
                                    <div className="p-5 bg-red-500/10 text-red-500 rounded-[28px] border border-red-500/20 shadow-2xl group-hover:bg-red-600 group-hover:text-white transition-all group-hover:rotate-6">
                                        <ShieldAlert className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-6 mb-4">
                                            <p className="text-2xl font-black text-white tracking-tighter italic uppercase">{alert.event_type}</p>
                                            <Badge className={`${getRiskColor(alert.severity)} border font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-lg`}>{alert.severity} RISK</Badge>
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic max-w-xl">"{alert.description}"</p>
                                        <div className="mt-8 flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                            <p className="flex items-center gap-3"><Activity className="h-3.5 w-3.5 text-indigo-500" /> Vector: {new Date(alert.created_at).toLocaleTimeString()}</p>
                                            <p className="flex items-center gap-3"><Globe className="h-3.5 w-3.5 text-indigo-500" /> Node: WZY-compliance-01</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-600 hover:text-white hover:bg-white/5 border border-white/5 transition-all">
                                    <ArrowRight className="h-6 w-6" />
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                        <ShieldCheck className="h-20 w-20 text-emerald-500 mx-auto mb-10 animate-pulse shadow-[0_0_20px_#10b981]" />
                        <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Surveillance Clean</h4>
                        <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest opacity-60">No high-risk anomalies detected in the current orchestration cycle.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Manual Probe Sidebar */}
           <div className="space-y-12">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Deep Probe</h3>
              <Card className="obsidian-card border-indigo-500/20 overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/5 p-10 border-b border-white/5 text-center">
                    <div className="bg-indigo-600/10 p-5 rounded-3xl border border-indigo-500/30 w-fit mx-auto mb-6 shadow-2xl">
                        <Search className="h-8 w-8 text-indigo-400" />
                    </div>
                    <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">Entity Scan</CardTitle>
                    <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-3 italic">Identity Pattern Analysis</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Merchant / Customer ID</Label>
                        <Input placeholder="WZY-CUST-..." id="risk_cust_id" className="h-16 rounded-2xl bg-white/5 border-white/5 px-8 font-black text-xl text-white italic focus-visible:ring-1 focus-visible:ring-indigo-500/50" />
                    </div>
                    <Button 
                        className="w-full bg-indigo-600 h-16 rounded-[28px] font-black text-sm uppercase tracking-widest text-white border-none shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
                        onClick={() => {
                            const id = (document.getElementById('risk_cust_id') as HTMLInputElement).value;
                            if(id) assessMutation.mutate(parseInt(id));
                        }} 
                        disabled={assessMutation.isPending}
                    >
                        {assessMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin mr-4" /> : <Cpu className="h-6 w-6 mr-4" />}
                        EXECUTE AI PROBE
                    </Button>
                </CardContent>
              </Card>

              <Card className="obsidian-card bg-gradient-to-br from-red-900/10 to-transparent border-red-500/10">
                <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-red-400 flex items-center gap-4 italic">
                        <Shield className="h-5 w-5" /> Mandatory Protocols
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-12 relative z-10 space-y-6">
                    {[
                        "High-velocity Tier 1 movements trigger auto-lock.",
                        "Direct CBN BVN Watchlist polling every 12 hours.",
                        "PEP (Politically Exposed) entities flagged at Level 4.",
                        "Auto-report large cash events (>₦10M) to NFIU."
                    ].map((rule, i) => (
                        <div key={i} className="flex gap-5 items-start group">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_8px_#ef4444]" />
                            <p className="text-[12px] text-slate-400 font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">"{rule}"</p>
                        </div>
                    ))}
                </CardContent>
              </Card>
           </div>
        </div>
    </div>
  );
};

export default ComplianceDashboard;
