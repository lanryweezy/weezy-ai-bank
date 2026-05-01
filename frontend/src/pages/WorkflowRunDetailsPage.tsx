import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { WorkflowRun, Task, TaskComment } from '@/types/workflows';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertCircle,
    MessageSquare,
    Send,
    UserCircle,
    ExternalLink,
    GitMerge,
    ScrollText,
    Calendar,
    User,
    ChevronRight,
    Activity,
    Database,
    Cpu
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import TaskActionModal from '@/components/TaskActionModal';
import { useQuery } from '@tanstack/react-query';

interface TaskCardProps {
  task: Task;
  onViewAction: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewAction }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [showComments, setShowComments] = useState<boolean>(false);

  const fetchComments = useCallback(async () => {
    if (!task || task.type === 'sub_workflow') return;
    try {
      const fetchedComments = await apiClient<TaskComment[]>(`/tasks/${task.task_id}/comments`);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [task]);

  useEffect(() => {
    if (showComments && task.type !== 'sub_workflow') {
      fetchComments();
    }
  }, [showComments, fetchComments, task.type]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    try {
      const addedComment = await apiClient<TaskComment>(`/tasks/${task.task_id}/comments`, {
        method: 'POST',
        data: { comment_text: newComment },
      });
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
    } catch (err) {
        console.error(err);
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none font-bold">In Progress</Badge>;
      case 'failed': return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none font-bold">Failed</Badge>;
      default: return <Badge variant="outline" className="text-gray-500 font-bold">{status}</Badge>;
    }
  };

  return (
    <Card className={`group border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all ${task.type === 'sub_workflow' ? 'ring-purple-100 bg-purple-50/10' : ''}`}>
      <CardHeader className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${task.type === 'sub_workflow' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                {task.type === 'sub_workflow' ? <GitMerge className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
            </div>
            <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                {task.step_name_in_workflow}
                {getStatusBadge(task.status)}
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-1">ID: {task.task_id.substring(0,8)}... | Type: {task.type}</p>
            </div>
          </div>
          {task.type === 'sub_workflow' && task.sub_workflow_run_id && (
            <Button size="sm" variant="outline" onClick={() => navigate(`/workflow-runs/${task.sub_workflow_run_id}`)} className="rounded-lg h-9 font-bold text-purple-600 border-purple-100 hover:bg-purple-50">
              Go to Sub-Workflow <ExternalLink className="h-3 w-3 ml-2"/>
            </Button>
          )}
          {(task.type === 'human_review' || task.type === 'data_input') && task.status !== 'completed' && (
            <Button size="sm" onClick={() => onViewAction(task)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg h-9">
              Take Action
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            {task.status === 'completed' && task.output_data_json ? (
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Node Output</p>
                    <pre className="text-xs font-mono text-gray-600 max-h-32 overflow-auto">
                        {JSON.stringify(task.output_data_json, null, 2)}
                    </pre>
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">Waiting for node execution or human response...</p>
            )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex flex-col items-start gap-4">
            <button onClick={() => setShowComments(!showComments)} className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition-colors">
                <MessageSquare className="h-4 w-4" />
                {showComments ? 'Hide internal discussion' : `Internal Discussion (${comments.length})`}
            </button>

            {showComments && (
                <div className="w-full space-y-4 animate-in slide-in-from-top-2">
                    <div className="space-y-3">
                        {comments.map(comment => (
                            <div key={comment.comment_id} className="flex gap-3">
                                <UserCircle className="h-8 w-8 text-gray-300 flex-shrink-0" />
                                <div className="bg-white p-3 rounded-2xl ring-1 ring-gray-100 shadow-sm flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-xs text-gray-900">{comment.user?.full_name || 'System User'}</span>
                                        <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{comment.comment_text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Add internal note..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="text-xs min-h-[40px] rounded-xl border-gray-200"
                        />
                        <Button onClick={handleAddComment} size="icon" className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex-shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
      </CardFooter>
    </Card>
  );
};


const WorkflowRunDetailsPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);

  const { data: runDetails, isLoading: isLoadingRun, refetch: refetchRun } = useQuery({
    queryKey: ['workflow-run', runId],
    queryFn: () => apiClient<WorkflowRun>(`/workflow-runs/${runId}`),
    enabled: !!runId
  });

  const { data: tasks, isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ['workflow-run-tasks', runId],
    queryFn: () => apiClient<Task[]>(`/tasks?runId=${runId}`),
    enabled: !!runId
  });

  const getStatusBadge = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 font-bold border-none">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-indigo-50 text-indigo-700 font-bold border-none">Active</Badge>;
      case 'failed': return <Badge className="bg-rose-50 text-rose-700 font-bold border-none">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoadingRun || isLoadingTasks) {
    return (
      <Layout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/workflow-runs')} className="h-11 w-11 p-0 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                Run Context <span className="text-gray-300 font-light">/</span> {runDetails?.workflow_name}
                </h1>
                <p className="text-xs text-gray-400 font-mono mt-1">ID: {runId}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                    <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-bold text-gray-900">Execution Overview</h2>
                        </div>
                        {getStatusBadge(runDetails?.status || 'pending')}
                    </div>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Node</p>
                                <p className="text-sm font-bold text-gray-900">{runDetails?.current_step_name || 'Terminal'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Template Ver.</p>
                                <p className="text-sm font-bold text-gray-900">v{runDetails?.workflow_version}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trigger Source</p>
                                <p className="text-sm font-bold text-gray-900">{runDetails?.triggering_user_id ? 'API / User' : 'System Event'}</p>
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Started At</p>
                                    <p className="text-sm font-bold text-gray-700">{runDetails?.start_time ? format(new Date(runDetails.start_time), "MMM d, HH:mm:ss") : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Ended At</p>
                                    <p className="text-sm font-bold text-gray-700">{runDetails?.end_time ? format(new Date(runDetails.end_time), "MMM d, HH:mm:ss") : 'In Progress'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="nodes" className="w-full">
                    <TabsList className="bg-gray-100 p-1 rounded-xl mb-6">
                        <TabsTrigger value="nodes" className="rounded-lg px-6 font-bold flex items-center gap-2">
                            <Database className="h-4 w-4" /> Node Timeline
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="rounded-lg px-6 font-bold flex items-center gap-2 text-gray-500 data-[state=active]:text-indigo-600">
                            <Cpu className="h-4 w-4" /> Low-Level Logs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="nodes" className="space-y-4">
                        {tasks?.map(task => (
                            <TaskCard
                                key={task.task_id}
                                task={task}
                                onViewAction={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4">
                        {runDetails?.execution_logs?.map((log, idx) => (
                            <div key={idx} className="bg-slate-900 rounded-2xl p-6 font-mono text-[11px] text-indigo-300">
                                <div className="flex justify-between items-center mb-4 border-b border-indigo-500/20 pb-2">
                                    <span className="text-indigo-500 font-bold uppercase">{log.step_name} ({log.step_type})</span>
                                    <span className="opacity-40">{format(new Date(log.timestamp), "HH:mm:ss.SSS")}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-indigo-500 opacity-60 uppercase font-black tracking-widest">Input</p>
                                        <pre className="text-white/80 overflow-auto">{JSON.stringify(log.input, null, 2)}</pre>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-indigo-500 opacity-60 uppercase font-black tracking-widest">Output</p>
                                        <pre className="text-white/80 overflow-auto">{JSON.stringify(log.output, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-8">
                <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                        <CardTitle className="text-lg font-bold">Trigger Context</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <pre className="text-[11px] font-mono text-gray-500 bg-gray-50 p-4 rounded-xl overflow-auto max-h-[400px]">
                            {JSON.stringify(runDetails?.triggering_data_json, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                {runDetails?.results_json && (
                    <Card className="border-none bg-emerald-600 text-white shadow-xl shadow-emerald-100 rounded-2xl overflow-hidden">
                        <CardHeader className="p-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" /> Final Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <pre className="text-[11px] font-mono text-emerald-100 bg-white/10 p-4 rounded-xl overflow-auto">
                                {JSON.stringify(runDetails.results_json, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        <TaskActionModal
            task={selectedTask}
            isOpen={isTaskModalOpen}
            onClose={() => { setIsTaskModalOpen(false); refetchTasks(); refetchRun(); }}
            onTaskCompleted={() => {}}
        />
      </div>
    </Layout>
  );
};

export default WorkflowRunDetailsPage;
