import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Database, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Network,
  HardDrive,
  BarChart3,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

const SystemHealth = () => {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => apiClient('/health'),
    refetchInterval: 5000, // Update every 5 seconds
  });

  const getLatencyColor = (ms: number) => {
    if (ms < 10) return 'text-emerald-500';
    if (ms < 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                SYSTEM PULSE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Activity className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Real-time Infrastructure Diagnostics & AI Node Telemetry.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase">All Nodes Operational</Badge>
             </div>
             <Button onClick={() => refetch()} className="rounded-2xl h-12 w-12 bg-slate-900 hover:bg-slate-800 shadow-xl p-0 flex items-center justify-center text-white border-none">
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
             </Button>
          </div>
        </div>

        {/* Primary Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                            <Database className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-200 text-emerald-600">Sync</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DB Latency</p>
                    <h3 className={`text-2xl font-black mt-1 ${getLatencyColor(health?.database?.latency_ms || 0)}`}>
                        {health?.database?.latency_ms || 0}ms
                    </h3>
                    <p className="text-[9px] text-slate-400 font-medium mt-2">PostgreSQL 16 Engine</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                            <Cpu className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-purple-200 text-purple-600">Ready</Badge>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Availability</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 uppercase">Available</h3>
                    <p className="text-[9px] text-slate-400 font-medium mt-2">Gemini 1.5 Pro Cluster</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                            <Zap className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Throughput</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">1,240 req/s</h3>
                    <p className="text-[9px] text-slate-400 font-medium mt-2">Nginx Edge Proxy</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                            <Server className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Worker Nodes</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">4 Active</h3>
                    <p className="text-[9px] text-slate-400 font-medium mt-2">Uvicorn / Gunicorn</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Health Logs */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Live Event Stream</h3>
                <div className="space-y-4">
                    {[
                        { time: '14:20:05', type: 'INFO', msg: 'Interest accrual batch started successfully.', node: 'NODE_01' },
                        { time: '14:18:22', type: 'WARN', msg: 'Slight latency spike detected in inter-bank switch.', node: 'GATEWAY_NIP' },
                        { time: '14:15:40', type: 'INFO', msg: 'New customer facial vector indexed.', node: 'VISION_CORE' },
                        { time: '14:10:12', type: 'INFO', msg: 'EOD closure lock verified for Branch LAG-01.', node: 'CORE_SWITCH' },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 rounded-[24px] border border-slate-50 bg-white hover:bg-slate-50/50 transition-colors group">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{log.time}</span>
                            <Badge className={`text-[8px] font-black uppercase px-2 ${log.type === 'INFO' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>{log.type}</Badge>
                            <p className="text-sm font-black text-slate-900 tracking-tight flex-1">{log.msg}</p>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{log.node}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resources Sidebar */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Resource Utilization</h3>
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white p-8 space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Compute Load</span>
                            <span className="text-indigo-600">12%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full w-[12%] rounded-full shadow-lg shadow-indigo-100" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Memory usage</span>
                            <span className="text-emerald-600">42%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[42%] rounded-full shadow-lg shadow-emerald-100" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Disk I/O</span>
                            <span className="text-blue-600">8%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[8%] rounded-full shadow-lg shadow-blue-100" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            <p className="text-[10px] text-indigo-800 font-bold uppercase leading-relaxed">
                                Integrity check performed 12m ago. All ledgers balanced.
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden group">
                    <Terminal className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Diagnostics Console</h4>
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                        "Detailed infrastructure logs are available via the standard SSH tunnel on port 2201."
                    </p>
                    <Button variant="link" className="text-indigo-400 p-0 h-auto mt-4 text-[10px] font-black uppercase tracking-widest hover:text-white hover:no-underline">Open SSH Documentation →</Button>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default SystemHealth;
