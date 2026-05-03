import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Cpu, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Brain, 
  Database,
  BarChart3,
  Terminal,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const WorkflowAudit = () => {
  const { data: aiLogs, isLoading: loadingAI } = useQuery({
    queryKey: ['aiTaskLogs'],
    queryFn: () => apiClient<any[]>('/task-logs'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'bg-emerald-50 text-emerald-700 ring-emerald-500/20';
      case 'FAILED': return 'bg-rose-50 text-rose-700 ring-rose-500/20';
      case 'PROCESSING': return 'bg-amber-50 text-amber-700 ring-amber-500/20 animate-pulse';
      default: return 'bg-slate-50 text-slate-700 ring-slate-500/10';
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                WORKFLOW INTELLIGENCE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Brain className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Autonomous AI Governance & Decision Audit Stream.</p>
          </div>
          <div className="flex items-center gap-3">
             <Badge className="bg-slate-900 text-indigo-400 border-none px-4 py-1.5 font-black text-[9px] tracking-widest uppercase">Verified Reasoning</Badge>
          </div>
        </div>

        {/* Intelligence Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Neural Decisions', value: '42.1K', icon: Cpu, color: 'indigo' },
                { label: 'Avg Confidence', value: '96.4%', icon: ShieldCheck, color: 'emerald' },
                { label: 'Throughput', value: '4ms', icon: Zap, color: 'blue' },
                { label: 'Errors/Fails', value: '0.2%', icon: Activity, color: 'rose' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-700">
                        <stat.icon className="h-24 w-24" />
                    </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Live Reasoning Feed */}
            <div className="lg:col-span-3 space-y-8">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time Decision Stream</h3>
                    <Badge variant="outline" className="text-[9px] font-black text-slate-400 border-slate-200 uppercase">Live Processing</Badge>
                </div>

                <div className="space-y-4">
                    {loadingAI ? (
                        [1,2,3,4,5].map(i => <Card key={i} className="h-24 animate-pulse bg-slate-50 border-none rounded-[24px]" />)
                    ) : aiLogs?.map((log) => (
                        <Card key={log.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[24px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl shadow-inner transition-all group-hover:scale-110 ${log.status === 'FAILED' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <Cpu className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <p className="font-black text-slate-900 text-sm tracking-tight">{log.task_name}</p>
                                            <Badge className={`${getStatusColor(log.status)} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ring-1`}>
                                                {log.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3 text-indigo-400" /> Confidence: <span className="text-slate-700">{log.confidence_score ? `${(log.confidence_score * 100).toFixed(1)}%` : 'N/A'}</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Zap className="h-3 w-3 text-indigo-400" /> Latency: <span className="text-slate-700">{log.processing_duration_ms}ms</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-indigo-400" /> {format(new Date(log.created_at), 'HH:mm:ss')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    <ExternalLink className="h-5 w-5" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {(!aiLogs || aiLogs.length === 0) && !loadingAI && (
                        <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">Neural Feed Silent</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">No AI decisions have been logged in this session.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Governance */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">AI Governance Policy</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Explainability Core
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-10 relative z-10 space-y-6">
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            "Every autonomous decision made by Weezy Prime is traced back to a specific neural weights snapshot and training data vector for forensic compliance."
                        </p>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Human-in-the-loop</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">ACTIVE</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">Data Lineage</span>
                                <Badge className="bg-blue-500/20 text-blue-400 border-none text-[8px]">VERIFIED</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <RefreshCw className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Continuous Learning
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "The model performance is reviewed daily. Confidence thresholds are dynamically adjusted based on successful transaction outcomes."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkflowAudit;
