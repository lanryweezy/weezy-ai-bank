import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, Lock, Unlock, Eye, RefreshCw, BarChart, History } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const FraudShieldDashboard = () => {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['fraudStats'],
    queryFn: () => apiClient('/fraud/stats'),
    refetchInterval: 10000,
  });

  const { data: alerts, isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['fraudAlerts'],
    queryFn: () => apiClient('/fraud/alerts'),
    refetchInterval: 15000,
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { alert_id: number, decision: string, notes: string }) => 
      apiClient('/fraud/review', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Alert decision updated');
      refetchAlerts();
    },
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  if (loadingStats) return <Layout><div className="p-8 text-center">Initializing Fraud Shield...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                AI Fraud Shield <ShieldCheck className="h-8 w-8 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Real-time transaction monitoring and autonomous threat blocking.</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1 flex items-center gap-2">
            <Activity className="h-3 w-3 animate-pulse" /> SYSTEM: {stats?.shield_status}
          </Badge>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { label: 'Total Scanned', value: stats?.total_alerts || 0, icon: History, color: 'blue' },
                { label: 'Blocked Fraud', value: stats?.active_blocks || 0, icon: Lock, color: 'red' },
                { label: 'Awaiting Review', value: stats?.awaiting_review || 0, icon: AlertTriangle, color: 'orange' },
                { label: 'AI Confidence', value: '99.4%', icon: ShieldCheck, color: 'emerald' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                                <h3 className="text-xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Alert Feed */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Live Threat Feed</h3>
                <Button variant="ghost" size="sm" onClick={() => refetchAlerts()} className="h-8 text-[10px] gap-2">
                    <RefreshCw className={`h-3 w-3 ${loadingAlerts ? 'animate-spin' : ''}`} /> Sync Feed
                </Button>
              </div>

              <div className="space-y-4">
                {alerts?.length > 0 ? (
                    alerts.map((alert: any) => (
                        <Card key={alert.id} className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row">
                                <div className={`md:w-2 ${alert.risk_level === 'CRITICAL' ? 'bg-red-600' : alert.risk_level === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge className={getRiskColor(alert.risk_level)}>{alert.risk_level} RISK</Badge>
                                            <span className="text-[10px] font-mono text-gray-400">ALERT #{alert.id}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(alert.created_at).toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                            <ShieldAlert className="h-4 w-4 text-red-500" /> AI Observation:
                                        </div>
                                        <p className="text-xs text-slate-600 mt-2 leading-relaxed italic">
                                            "{alert.ai_analysis_report?.reasoning}"
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[9px] text-gray-400 uppercase font-bold">Customer ID</p>
                                                <p className="text-xs font-bold">{alert.customer_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 uppercase font-bold">Risk Score</p>
                                                <p className="text-xs font-bold text-indigo-600">{alert.risk_score}/100</p>
                                            </div>
                                        </div>
                                        
                                        {alert.status === 'PENDING_REVIEW' && (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="h-8 text-[10px] text-red-600 border-red-100 hover:bg-red-50" 
                                                    onClick={() => reviewMutation.mutate({ alert_id: alert.id, decision: 'BLOCKED_FRAUD', notes: 'Manually blocked' })}>
                                                    Block Fraud
                                                </Button>
                                                <Button size="sm" className="h-8 text-[10px] bg-indigo-600"
                                                    onClick={() => reviewMutation.mutate({ alert_id: alert.id, decision: 'APPROVED_GENUINE', notes: 'Verified genuine' })}>
                                                    Approve Transaction
                                                </Button>
                                            </div>
                                        )}
                                        {alert.status !== 'PENDING_REVIEW' && (
                                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">{alert.status.replace('_', ' ')}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-gray-50/50">
                        <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                        <p className="text-gray-500 italic">No fraud attempts detected. Shield is guarding the vault.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Security Stats */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-indigo-600" /> Threat Intelligence
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-[10px] font-bold text-red-700 uppercase">Top Vector</p>
                        <p className="text-xs font-semibold mt-1">Social Engineering (OPay/Kuda)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-600 uppercase">Avg. Response Time</p>
                        <p className="text-xs font-semibold mt-1">142ms (Gemini Flash)</p>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Lock className="h-24 w-24" />
                 </div>
                 <CardHeader>
                    <CardTitle className="text-sm font-bold">Autonomous Blocking</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                        Weezy AI is authorized to automatically **BLOCK** transactions with a risk score above **90**. All other flagged activities require manual human clearance.
                    </p>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-[10px] font-bold">Auto-Block Status</span>
                        <Badge className="bg-emerald-500 text-[9px] border-none">ENABLED</Badge>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default FraudShieldDashboard;
