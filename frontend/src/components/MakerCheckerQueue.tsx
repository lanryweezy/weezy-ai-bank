import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  Eye,
  RefreshCw,
  Search,
  ChevronRight,
  Database,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';

const MakerCheckerQueue: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['dual-control-pending'],
    queryFn: () => apiClient<any[]>('/admin/dual-control/requests/pending'),
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => apiClient(`/admin/dual-control/${requestId}/approve`, { method: 'POST' }),
    onSuccess: () => {
        toast.success("Request Approved. The sensitive operation has been executed.");
        queryClient.invalidateQueries({ queryKey: ['dual-control-pending'] });
    },
    onError: (err: any) => {
        toast.error(`Approval Failed: ${err.message}`);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { requestId: string, reason: string }) =>
        apiClient(`/admin/dual-control/${data.requestId}/reject`, { method: 'POST', body: JSON.stringify({ reason: data.reason }) }),
    onSuccess: () => {
        toast.success("Request Rejected. The operation has been cancelled.");
        queryClient.invalidateQueries({ queryKey: ['dual-control-pending'] });
    }
  });

  const getActionIcon = (type: string) => {
    if (type.includes('BALANCE')) return <Database className="h-6 w-6 text-amber-600" />;
    if (type.includes('TRANSFER') || type.includes('PAYMENT')) return <ArrowRightLeft className="h-6 w-6 text-indigo-600" />;
    return <Zap className="h-6 w-6 text-indigo-600" />;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
            DUAL CONTROL <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><ShieldAlert className="h-6 w-6 text-white" /></div>
          </h2>
          <p className="text-slate-500 font-medium">Administrative Maker-Checker Governance & Safety Protocols.</p>
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
              <CardContent className="p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Requests</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{requests?.length || 0}</h3>
              </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
              <CardContent className="p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Review Time</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">4.2m</h3>
              </CardContent>
          </Card>
          <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-20 w-20" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
                    <h3 className="text-2xl font-black italic tracking-tighter">System Guard Active</h3>
                </CardContent>
          </Card>
      </div>

      <div className="space-y-6">
        {isLoading ? (
            [1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-[32px]" />)
        ) : requests?.length === 0 ? (
            <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-lg font-black text-slate-900">Queue is Empty</h4>
                <p className="text-sm text-slate-400 font-medium mt-2">No sensitive operations are currently awaiting authorization.</p>
            </div>
        ) : requests?.map((req) => (
            <Card key={req.request_id} className="group overflow-hidden border-none bg-white shadow-sm ring-1 ring-slate-200/60 hover:shadow-2xl transition-all duration-500 rounded-[32px]">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="p-8 flex-1">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="p-4 rounded-[24px] bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                    {getActionIcon(req.action_type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-black text-xl text-slate-900 tracking-tight italic uppercase">{req.action_type.replace(/_/g, ' ')}</h3>
                                        <Badge className="bg-amber-50 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Authorization Required</Badge>
                                    </div>
                                    <div className="flex items-center gap-6 mt-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                                            <UserPlus className="h-3.5 w-3.5 text-indigo-400" /> Maker: <span className="text-slate-700">{req.maker_name || 'SYSTEM'}</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-indigo-400" /> {format(new Date(req.created_at), 'MMM dd, HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 group-hover:bg-white transition-all">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Operational Payload</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {Object.entries(req.payload_json || {}).map(([k, v]) => (
                                        <div key={k}>
                                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{k.replace(/_/g, ' ')}</p>
                                            <p className="text-xs font-bold text-slate-800 font-mono truncate">{String(v)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 md:w-80 p-8 flex flex-col gap-4 justify-center border-t md:border-t-0 md:border-l border-slate-100">
                            <Button
                                onClick={() => approveMutation.mutate(req.request_id)}
                                disabled={approveMutation.isPending}
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white border-none font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 rounded-2xl active:scale-95 transition-all"
                            >
                                {approveMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                Authorize Execution
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => rejectMutation.mutate({ requestId: req.request_id, reason: 'Manual rejection by checker' })}
                                className="w-full h-12 text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                            >
                                Reject & Terminate
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default MakerCheckerQueue;
