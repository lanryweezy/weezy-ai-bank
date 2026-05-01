import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Cpu,
  Server,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from './ui/input';
import { formatDistanceToNow } from 'date-fns';

interface TaskLog {
  id: string;
  agentName: string;
  task: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  timestamp: string;
  duration?: number;
}

const AgentMonitor: React.FC = () => {
  // In a real implementation, we'd fetch actual execution logs.
  // For this overhaul, we'll continue using mock/simulated data but with the new UI.
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['agent-activity-logs'],
    queryFn: async () => {
        // Simulating backend fetch of aggregated agent logs
        return [
            { id: '1', agentName: 'FraudDetector-01', task: 'Analyzing Transaction TX-9921', status: 'completed', timestamp: new Date(Date.now() - 5000).toISOString(), duration: 450 },
            { id: '2', agentName: 'CreditScorer-Global', task: 'Evaluating Application AP-4412', status: 'processing', timestamp: new Date(Date.now() - 1200).toISOString() },
            { id: '3', agentName: 'KYC-Verification-Bot', task: 'Ocr Document Scan', status: 'failed', timestamp: new Date(Date.now() - 60000).toISOString(), duration: 1200 },
            { id: '4', agentName: 'FraudDetector-01', task: 'Pattern Recognition', status: 'completed', timestamp: new Date(Date.now() - 120000).toISOString(), duration: 310 },
            { id: '5', agentName: 'Loan-Orchestrator', task: 'Disbursement Webhook', status: 'completed', timestamp: new Date(Date.now() - 300000).toISOString(), duration: 890 },
        ] as TaskLog[];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing': return <Badge className="bg-amber-50 text-amber-700 border-none font-bold">Active</Badge>;
      case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">Success</Badge>;
      case 'failed': return <Badge className="bg-rose-50 text-rose-700 border-none font-bold">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-600" /> Operational Insights
          </h2>
          <p className="text-gray-500 mt-1">Real-time telemetry from autonomous banking agents.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Logs
          </Button>
          <Button className="h-11 bg-slate-900 hover:bg-black text-white px-6 rounded-xl font-bold shadow-lg shadow-slate-200">
            <Terminal className="h-4 w-4 mr-2" />
            Live Console
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Active Processes', value: '14', icon: <Cpu className="text-indigo-600" />, color: 'bg-indigo-50' },
            { label: 'Ops / Minute', value: '1,242', icon: <Activity className="text-emerald-600" />, color: 'bg-emerald-50' },
            { label: 'Avg Latency', value: '312ms', icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
            { label: 'Success Rate', value: '99.98%', icon: <TrendingUp className="text-purple-600" />, color: 'bg-purple-50' }
        ].map((stat, i) => (
            <Card key={i} className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            {React.cloneElement(stat.icon as React.ReactElement, { className: 'h-6 w-6' })}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold">Real-time Stream</CardTitle>
                    <p className="text-xs text-gray-400 mt-1">Direct output from orchestration nodes</p>
                </div>
                <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input placeholder="Filter stream..." className="h-8 text-xs pl-8 rounded-lg border-gray-200" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                    {isLoading ? (
                        [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)
                    ) : (
                        logs?.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-lg border border-gray-100 group-hover:scale-110 transition-transform">
                                        {getStatusIcon(log.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{log.agentName}</p>
                                        <p className="text-xs text-gray-500 font-medium">{log.task}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Duration</p>
                                        <p className="text-xs font-mono font-bold text-gray-600">{log.duration ? `${log.duration}ms` : '--'}</p>
                                    </div>
                                    {getStatusBadge(log.status)}
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{formatDistanceToNow(new Date(log.timestamp))} ago</span>
                                    <ChevronRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="border-none bg-indigo-600 text-white shadow-xl shadow-indigo-100 rounded-2xl overflow-hidden">
                <CardHeader className="p-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Server className="h-5 w-5" /> Cluster Health
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span>CPU Utilization</span>
                            <span className="text-indigo-200">24%</span>
                        </div>
                        <div className="h-1.5 w-full bg-indigo-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[24%] rounded-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                            <span>Memory (RAM)</span>
                            <span className="text-indigo-200">4.2 GB / 8.0 GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-indigo-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[52%] rounded-full" />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300">
                            <span>Status</span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                Optimal
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Instances</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {[
                        { name: 'Core Orchestrator', status: 'Healthy' },
                        { name: 'Fraud Analytics Engine', status: 'Healthy' },
                        { name: 'Compliance Guard v2', status: 'Healthy' },
                        { name: 'Customer NLP Node', status: 'Healthy' }
                    ].map((node, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700">{node.name}</span>
                            <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50">Online</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentMonitor;
