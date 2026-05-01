
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { WorkflowDefinition } from '@/types/workflows';
import WorkflowDefinitionCard from './WorkflowDefinitionCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Send, GitBranch, Search, Filter, Sparkles } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';

const WorkflowManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [triggeringData, setTriggeringData] = useState<Record<string, any>>({});

  const { data: workflows, isLoading, error, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient<WorkflowDefinition[]>('/workflows'),
  });

  const startWorkflowMutation = useMutation({
    mutationFn: (data: { workflowId: string; input: any }) =>
      apiClient(`/workflows/${data.workflowId}/start`, { method: 'POST', data: { triggering_data_json: data.input } }),
    onSuccess: (data) => {
      toast({ title: "Workflow Started", description: `Run ID: ${data.run_id}` });
      setIsStartModalOpen(false);
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Execution Failed", description: err.message });
    }
  });

  const handleOpenStartModal = (workflowId: string) => {
    const wf = workflows?.find(w => w.workflow_id === workflowId);
    if (wf) {
      setSelectedWorkflow(wf);
      setTriggeringData({});
      setIsStartModalOpen(true);
    }
  };

  const filteredWorkflows = workflows?.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-indigo-600" /> Workflow Automator
          </h2>
          <p className="text-gray-500 mt-1">Design and execute complex multi-step banking processes.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} className="h-11 w-11 p-0">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                <Plus className="mr-2 h-4 w-4" /> Create Workflow
            </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search automation templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-gray-200"
          />
        </div>
        <Button variant="outline" className="h-11 px-6">
          <Filter className="h-4 w-4 mr-2" /> Categories
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((w) => (
            <WorkflowDefinitionCard
                key={w.workflow_id}
                workflow={w}
                onStartInstance={() => handleOpenStartModal(w.workflow_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-gray-100">
          <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Ready to automate your first process?</p>
          <Button variant="link" className="text-indigo-600 mt-2 font-bold">Browse public templates</Button>
        </div>
      )}

      {/* Execution Modal */}
      <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 border-none overflow-hidden rounded-2xl">
          <div className="p-8 bg-indigo-600 text-white">
            <DialogHeader>
                <div className="p-3 bg-white/10 w-fit rounded-xl mb-4">
                    <Send className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold">Initiate {selectedWorkflow?.name}</DialogTitle>
                <DialogDescription className="text-indigo-100 opacity-80">
                Configuration required for this automation sequence.
                </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Trigger Payload (JSON)</Label>
                <Textarea
                    value={JSON.stringify(triggeringData, null, 2)}
                    onChange={(e) => {
                        try { setTriggeringData(JSON.parse(e.target.value)); }
                        catch(e) {}
                    }}
                    placeholder='{"applicationId": "LN-9921", "customer_id": "..."}'
                    rows={10}
                    className="font-mono text-xs bg-gray-50 border-none focus-visible:ring-indigo-500 rounded-xl p-4"
                />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                    <Button variant="ghost" className="font-bold text-gray-500">Cancel</Button>
                </DialogClose>
                <Button
                    onClick={() => startWorkflowMutation.mutate({ workflowId: selectedWorkflow!.workflow_id, input: triggeringData })}
                    disabled={startWorkflowMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl h-11"
                >
                    {startWorkflowMutation.isPending ? 'Executing...' : 'Start Process'}
                </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowManager;
