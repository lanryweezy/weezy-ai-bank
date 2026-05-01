import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Task, TaskComment } from '@/types/workflows';
import apiClient from '@/services/apiClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Terminal,
    MessageSquare,
    Send,
    UserCircle,
    Activity,
    Database,
    Clock,
    CheckCircle,
    Info
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from './ui/badge';

interface TaskActionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted: (updatedTask: Task) => void;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({ task, isOpen, onClose, onTaskCompleted }) => {
  const [outputData, setOutputData] = useState<string>('{}');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (currentTask: Task) => {
    if (!currentTask) return;
    try {
      const fetchedComments = await apiClient<TaskComment[]>(`/tasks/${currentTask.task_id}/comments`);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  useEffect(() => {
    if (task && isOpen) {
      setOutputData('{}');
      fetchComments(task);
      setNewComment('');
      setError(null);
    }
  }, [task, isOpen]);

  if (!task) return null;

  const canCompleteTask = task.status !== 'completed' && task.status !== 'failed' &&
                         (task.type === 'human_review' || task.type === 'data_input' || task.type === 'decision');

  const handleSubmit = async () => {
    if (!canCompleteTask) return;
    setIsSubmitting(true);
    setError(null);
    let parsedOutputData = {};
    try {
      parsedOutputData = JSON.parse(outputData);
    } catch (e) {
      setError("Invalid JSON format for output data.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedTask = await apiClient<Task>(`/tasks/${task.task_id}/complete`, {
        method: 'POST',
        data: { output_data_json: parsedOutputData },
      });
      onTaskCompleted(updatedTask);
      onClose();
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to complete task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    setIsSubmittingComment(true);
    try {
      const addedComment = await apiClient<TaskComment>(`/tasks/${task.task_id}/comments`, {
        method: 'POST',
        data: { comment_text: newComment },
      });
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
    } catch (err: any) {
        console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 border-none overflow-hidden rounded-3xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 h-[600px]">
          {/* Main Action Area */}
          <div className="lg:col-span-3 p-8 flex flex-col h-full bg-white">
            <DialogHeader className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase border-indigo-100 text-indigo-600 bg-indigo-50/50">
                        {task.type}
                    </Badge>
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">{task.step_name_in_workflow}</DialogTitle>
                <DialogDescription className="text-gray-500 font-medium">
                    Run ID: {task.run_id.substring(0,12)}...
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Status</p>
                            <p className="text-sm font-bold text-gray-700 capitalize">{task.status}</p>
                        </div>
                        {task.deadline_at && (
                            <div className={`flex-1 p-4 rounded-2xl border ${new Date(task.deadline_at) < new Date() ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Deadline</p>
                                <p className="text-sm font-bold">{format(new Date(task.deadline_at), "MMM d, HH:mm")}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Input Payload</Label>
                        <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-indigo-300 max-h-40 overflow-auto">
                            <pre>{JSON.stringify(task.input_data_json, null, 2)}</pre>
                        </div>
                    </div>

                    {canCompleteTask && (
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="outputData" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Response (JSON)</Label>
                                <div className="group relative">
                                    <Info className="h-4 w-4 text-gray-300 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        Expected structure depends on the workflow step requirements.
                                    </div>
                                </div>
                            </div>
                            <Textarea
                                id="outputData"
                                value={outputData}
                                onChange={(e) => setOutputData(e.target.value)}
                                rows={6}
                                className="font-mono text-xs bg-gray-50 border-gray-100 focus-visible:ring-indigo-500 rounded-2xl p-4"
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive" className="rounded-2xl border-none bg-rose-50 text-rose-800">
                        <AlertTitle className="font-bold flex items-center gap-2"><Terminal className="h-4 w-4" /> Validation Error</AlertTitle>
                        <AlertDescription className="text-xs opacity-90">{error}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
                <DialogClose asChild>
                    <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold text-gray-500">Cancel</Button>
                </DialogClose>
                {canCompleteTask && (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-indigo-100"
                    >
                        {isSubmitting ? 'Processing...' : 'Submit Resolution'}
                    </Button>
                )}
            </div>
          </div>

          {/* Discussion Sidebar */}
          <div className="lg:col-span-2 bg-gray-50/80 border-l border-gray-100 p-8 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Discussion</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin">
              {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <MessageSquare className="h-10 w-10 mb-2" />
                      <p className="text-xs font-medium">No internal notes yet</p>
                  </div>
              ) : (
                  comments.map(comment => (
                    <div key={comment.comment_id} className="bg-white p-4 rounded-2xl shadow-sm ring-1 ring-gray-200/50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-indigo-400"/>
                                <span className="font-bold text-[10px] text-gray-900">{comment.user?.full_name || 'Staff'}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{comment.comment_text}</p>
                    </div>
                  ))
              )}
            </div>

            <div className="relative">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type internal note..."
                    rows={3}
                    className="w-full bg-white border-gray-200 rounded-2xl text-xs pr-12 pt-4 resize-none focus-visible:ring-indigo-500"
                />
                <Button
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !newComment.trim()}
                    size="icon"
                    className="absolute bottom-3 right-3 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskActionModal;
