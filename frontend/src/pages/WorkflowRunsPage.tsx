import React from 'react';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { WorkflowRun, WorkflowDefinition } from '@/types/workflows';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter, ListChecks, Eye, GitMerge, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const WorkflowRunsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterWorkflowId, setFilterWorkflowId] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");

  const { data: workflowDefinitions } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient<WorkflowDefinition[]>('/workflows'),
  });

  const { data: runs, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-runs', filterWorkflowId, filterStatus],
    queryFn: () => {
        const params = new URLSearchParams();
        if (filterWorkflowId) params.append('workflowId', filterWorkflowId);
        if (filterStatus) params.append('status', filterStatus);
        return apiClient<WorkflowRun[]>(`/workflow-runs?${params.toString()}`);
    },
  });

  const getStatusBadge = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none font-bold">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500 font-bold capitalize">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <GitMerge className="h-8 w-8 text-indigo-600 rotate-90" /> Process Instances
            </h1>
            <p className="text-gray-500 mt-1">Audit and monitor the execution of automated financial workflows.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
             <Button onClick={() => navigate('/workflows')} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6">
              <ListChecks className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Template</Label>
                    <Select value={filterWorkflowId} onValueChange={setFilterWorkflowId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                            <SelectValue placeholder="All Workflows" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Workflows</SelectItem>
                            {workflowDefinitions?.map(def => (
                                <SelectItem key={def.workflow_id} value={def.workflow_id}>
                                    {def.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Execution Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Statuses</SelectItem>
                            {['pending', 'in_progress', 'completed', 'failed', 'cancelled'].map(status => (
                                <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                     <Button variant="outline" className="h-11 w-full rounded-xl border-gray-100 bg-gray-50/50 hover:bg-gray-100 text-gray-600 font-bold">
                        <Filter className="h-4 w-4 mr-2" /> More Filters
                    </Button>
                </div>
            </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertTitle>Synchronization Error</AlertTitle>
            <AlertDescription>We encountered an issue retrieving the process execution history.</AlertDescription>
          </Alert>
        ) : runs?.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl ring-1 ring-gray-100">
            <GitMerge className="h-16 w-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">No execution history found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {runs?.map((run) => (
              <Card key={run.run_id} className="group hover:ring-2 hover:ring-indigo-500 transition-all duration-300 border-none bg-white shadow-sm hover:shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-900">{run.workflow_name || 'System Process'}</h3>
                                    <Badge variant="outline" className="text-[10px] font-black border-gray-200 text-gray-400">v{run.workflow_version}</Badge>
                                    {getStatusBadge(run.status)}
                                </div>
                                <p className="text-xs text-gray-400 font-mono mt-1">ID: {run.run_id}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Current Node</p>
                                <p className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                                    {run.current_step_name || 'Terminal State'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Started At</p>
                                    <p className="text-sm font-semibold text-gray-700">{format(new Date(run.start_time), "MMM d, HH:mm:ss")}</p>
                                </div>
                            </div>
                            {run.end_time ? (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Completed At</p>
                                        <p className="text-sm font-semibold text-gray-700">{format(new Date(run.end_time), "MMM d, HH:mm:ss")}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-indigo-400 leading-none">Duration</p>
                                        <p className="text-sm font-semibold text-indigo-600 italic">Processing...</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Initiated By</p>
                                    <p className="text-sm font-semibold text-gray-700">{run.triggering_user_id ? `User ${run.triggering_user_id.substring(0,8)}` : 'System'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 md:w-48 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 group-hover:bg-indigo-50/30 transition-colors">
                      <Button
                        onClick={() => navigate(`/workflow-runs/${run.run_id}`)}
                        className="w-full h-11 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold rounded-xl border border-indigo-100 shadow-sm transition-all"
                      >
                        Inspect <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WorkflowRunsPage;
