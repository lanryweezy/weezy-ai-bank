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
  ArrowRightLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const MakerCheckerQueue: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['dual-control-pending'],
    queryFn: () => apiClient<any[]>('/admin/dual-control/pending'),
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => apiClient(`/admin/dual-control/${requestId}/approve`, { method: 'POST' }),
    onSuccess: () => {
        toast({ title: "Request Approved", description: "The sensitive operation has been executed." });
        queryClient.invalidateQueries({ queryKey: ['dual-control-pending'] });
    },
    onError: (err: any) => {
        toast({ variant: "destructive", title: "Approval Failed", description: err.message });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { requestId: string, reason: string }) =>
        apiClient(`/admin/dual-control/${data.requestId}/reject`, { method: 'POST', data: { reason: data.reason } }),
    onSuccess: () => {
        toast({ title: "Request Rejected", description: "The operation has been cancelled." });
        queryClient.invalidateQueries({ queryKey: ['dual-control-pending'] });
    }
  });

  const getActionIcon = (type: string) => {
    if (type.includes('BALANCE')) return <Database className="h-5 w-5 text-amber-600" />;
    if (type.includes('DISBURSE')) return <ArrowRightLeft className="h-5 w-5 text-indigo-600" />;
    return <UserCheck className="h-5 w-5 text-indigo-600" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-indigo-600" /> Maker-Checker Queue
          </h2>
          <p className="text-gray-500 mt-1">Review and authorize high-privilege system operations.</p>
        </div>
        <Button variant="outline" className="h-11 rounded-xl border-gray-200" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
            [1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        ) : requests?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Queue is Clear</h3>
                <p className="text-gray-500">No pending authorizations required at this time.</p>
            </div>
        ) : requests?.map((req) => (
            <Card key={req.request_id} className="group overflow-hidden border-none bg-white shadow-sm ring-1 ring-gray-100 hover:ring-indigo-500 transition-all rounded-2xl">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                    {getActionIcon(req.action_type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg text-gray-900">{req.action_type.replace(/_/g, ' ')}</h3>
                                        <Badge className="bg-amber-50 text-amber-700 border-none font-bold">Pending Review</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <UserPlus className="h-3 w-3" /> Initiated by: <span className="text-gray-600 font-bold">{req.maker_name}</span>
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {new Date(req.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Request Payload</p>
                                <pre className="text-xs font-mono text-gray-600 overflow-auto">
                                    {JSON.stringify(req.request_data_json, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="bg-gray-50 md:w-64 p-6 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100">
                            <Button
                                onClick={() => approveMutation.mutate(req.request_id)}
                                disabled={approveMutation.isPending}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100"
                            >
                                {approveMutation.isPending ? 'Processing...' : 'Authorize Action'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => rejectMutation.mutate({ requestId: req.request_id, reason: 'Manual rejection by checker' })}
                                className="w-full h-11 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                            >
                                Reject
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
