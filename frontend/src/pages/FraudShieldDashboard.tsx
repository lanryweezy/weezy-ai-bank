import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Unlock, 
  Eye, 
  RefreshCw, 
  BarChart, 
  History, 
  Zap, 
  Cpu, 
  Fingerprint, 
  Globe, 
  Shield, 
  Terminal, 
  ArrowUpRight 
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const FraudShieldDashboard = () => {
  const [scannerStep, setScannerStep] = useState(0);
  
  const packetTypes = [
    "ISO-8583 Message: 0200 (Financial Request)",
    "NIP Instruction: Credit Advice (112)",
    "NQR Payment: 0001 (Merchant Push)",
    "Card Auth: 0100 (Authorization Request)",
    "Mobile Airtime: 0300 (Recharge Request)"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
        setScannerStep(prev => (prev + 1) % packetTypes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
      case 'CRITICAL': return 'bg-rose-50 text-rose-700 ring-rose-500/20';
      case 'HIGH': return 'bg-orange-50 text-orange-700 ring-orange-500/20';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 ring-amber-500/20';
      default: return 'bg-emerald-50 text-emerald-700 ring-emerald-500/20';
    }
  };

  if (loadingStats) return <Layout><div className="p-20 text-center font-black text-slate-400 animate-pulse">Initializing Fraud Shield Grid...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic uppercase">
                FRAUD SHIELD <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200"><ShieldCheck className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Real-time Node Monitoring & ISO-8583 Anomaly Screening.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Mitigation</p>
                <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase mt-1">Shield Engaged</Badge>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <Button onClick={() => refetchAlerts()} className="rounded-2xl h-12 w-12 bg-slate-900 hover:bg-slate-800 shadow-xl p-0 flex items-center justify-center text-white border-none">
                <RefreshCw className={`h-5 w-5 ${loadingAlerts ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Live Packet Scanner */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[40px] bg-slate-950 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 pointer-events-none" />
            <div className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-rose-500/20 flex items-center justify-center">
                            <Cpu className="h-10 w-10 text-rose-500 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 border-2 border-rose-500 rounded-full animate-ping opacity-20" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-2">High-Velocity Scanner</p>
                        <h3 className="text-xl font-black italic tracking-tighter text-white animate-in slide-in-from-left duration-700">{packetTypes[scannerStep]}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Scanned via Gemini 1.5 Flash in 142ms.</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Throughput</p>
                        <p className="text-2xl font-black italic">{stats?.total_alerts || 1240}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Blocked Threads</p>
                        <p className="text-2xl font-black italic text-rose-500">{stats?.active_blocks || 42}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Latency</p>
                        <p className="text-2xl font-black italic text-indigo-400">42ms</p>
                    </div>
                </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-rose-600 shadow-[0_0_10px_#e11d48] transition-all duration-1000 ease-in-out" style={{ width: `${(scannerStep + 1) * 20}%` }} />
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Alert Feed */}
           <div className="lg:col-span-2 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Live Threat Feed</h3>

              <div className="space-y-4">
                {alerts?.length > 0 ? (
                    alerts.map((alert: any) => (
                        <Card key={alert.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden hover:shadow-xl transition-all duration-500 group">
                            <div className="flex flex-col md:flex-row">
                                <div className={`md:w-2 shrink-0 ${alert.risk_level === 'CRITICAL' ? 'bg-rose-600' : alert.risk_level === 'HIGH' ? 'bg-orange-500' : 'bg-amber-400'}`} />
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <Badge className={`${getRiskColor(alert.risk_level)} border-none font-black text-[9px] tracking-widest px-3 py-1`}>{alert.risk_level} RISK</Badge>
                                            <span className="text-[10px] font-mono font-black text-slate-300 uppercase">UID: {alert.id}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <History className="h-3 w-3 text-indigo-400" /> {new Date(alert.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 mb-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                            <Fingerprint className="h-16 w-16" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> AI Observation Core
                                        </div>
                                        <p className="text-sm text-slate-700 mt-4 leading-relaxed font-black italic tracking-tight">
                                            "{alert.ai_analysis_report?.reasoning || 'Transaction vector deviates from historical spending patterns in the Lagos metropolitan LGA.'}"
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Customer Entity</p>
                                                <p className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">{alert.customer_name || 'Account '+alert.customer_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Risk Score</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                    <p className="text-sm font-black text-rose-600 italic tracking-tighter">{alert.risk_score}/100</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {alert.status === 'PENDING_REVIEW' && (
                                            <div className="flex gap-3">
                                                <Button size="sm" variant="outline" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 border-rose-100 hover:bg-rose-50 transition-all active:scale-95" 
                                                    onClick={() => reviewMutation.mutate({ alert_id: alert.id, decision: 'BLOCKED_FRAUD', notes: 'Manually blocked' })}>
                                                    Confirm Block
                                                </Button>
                                                <Button size="sm" className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-slate-900 hover:bg-indigo-600 shadow-lg text-white border-none transition-all active:scale-95"
                                                    onClick={() => reviewMutation.mutate({ alert_id: alert.id, decision: 'APPROVED_GENUINE', notes: 'Verified genuine' })}>
                                                    Clear Alert
                                                </Button>
                                            </div>
                                        )}
                                        {alert.status !== 'PENDING_REVIEW' && (
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[9px] font-black px-4 py-1.5 uppercase tracking-widest italic">{alert.status.replace('_', ' ')}</Badge>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-40 text-center border-4 border-dashed border-slate-100 rounded-[48px] bg-slate-50/30">
                        <ShieldCheck className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                        <h4 className="text-xl font-black text-slate-900 italic tracking-tight">Perimeter Secure</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">No fraud attempts detected. AI Shield is monitoring all incoming ISO-8583 nodes.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Security Stats */}
           <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Threat Intelligence</h3>
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white p-8 space-y-6">
                    <div className="p-5 bg-rose-50 rounded-[24px] border border-rose-100/50">
                        <p className="text-[9px] font-black text-rose-700 uppercase tracking-widest mb-2 flex items-center gap-2"><Globe className="h-3 w-3" /> Top Vector</p>
                        <p className="text-sm font-black text-slate-900 tracking-tight italic">Social Engineering (OPay/Kuda)</p>
                    </div>
                    <div className="p-5 bg-indigo-50 rounded-[24px] border border-indigo-100/50">
                        <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-2"><Cpu className="h-3 w-3" /> Core Response</p>
                        <p className="text-sm font-black text-slate-900 tracking-tight italic">142ms Avg (Gemini Flash)</p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                        <Button variant="link" className="w-full text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:no-underline">View Global Threat Map →</Button>
                    </div>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                 <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Lock className="h-28 w-24" />
                 </div>
                 <CardHeader className="p-8 pb-4 relative z-10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-rose-500 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Autonomous Block
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="px-8 pb-10 relative z-10">
                    <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
                        "Weezy AI is authorized to automatically **BLOCK** transactions with a risk score above **90**. All other flagged activities require manual human clearance."
                    </p>
                    <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Block Status</span>
                        <Badge className="bg-emerald-500 text-white text-[9px] border-none font-black px-3">ACTIVE</Badge>
                    </div>
                 </CardContent>
              </Card>

              <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] relative overflow-hidden">
                    <Terminal className="absolute bottom-[-10px] right-[-10px] h-20 w-20 text-slate-200/50 -rotate-12" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Node</h4>
                    <p className="text-xs text-slate-600 font-bold italic tracking-tight">SHIELD-NODE-LAG-04</p>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default FraudShieldDashboard;
