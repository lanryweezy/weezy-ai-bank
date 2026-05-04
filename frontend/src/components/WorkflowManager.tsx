import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { WorkflowDefinition } from '@/types/workflows';
import WorkflowDefinitionCard from './WorkflowDefinitionCard';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  RefreshCw, 
  Send, 
  GitBranch, 
  Search, 
  Filter, 
  Sparkles, 
  Brain, 
  Zap, 
  Code2, 
  Globe, 
  LayoutDashboard, 
  ChevronRight, 
  BrainCircuit, 
  Clock, 
  Activity, 
  Terminal, 
  ShieldCheck,
  AlertTriangle 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
      apiClient(`/workflows/${data.workflowId}/start`, { method: 'POST', body: JSON.stringify({ triggering_data_json: data.input }) }),
    onSuccess: (data) => {
      toast.success(`Workflow started: ${data.run_id}`);
      setIsStartModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(`Execution failed: ${err.message}`);
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic uppercase">
            AUTOMATION LATTICE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><GitBranch className="h-6 w-6 text-white" /></div>
          </h2>
          <p className="text-slate-500 font-medium text-lg">Orchestrate high-volume, multi-step banking cycles autonomously.</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" onClick={() => refetch()} className="rounded-2xl h-12 w-12 border-slate-200 hover:bg-slate-50 shadow-sm p-0 flex items-center justify-center">
                <RefreshCw className={`h-5 w-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
             </Button>
             <Button className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <Plus className="mr-2 h-4 w-4" /> Design Sequence
             </Button>
        </div>
      </div>

      {/* Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
              { label: 'Active Automations', value: '42', icon: Zap, color: 'indigo' },
              { label: 'Neural Decision Rate', value: '98.4%', icon: Brain, color: 'emerald' },
              { label: 'Avg Cycle Time', value: '2.4s', icon: Clock, color: 'blue' },
              { label: 'Integrity', value: 'SIGNED', icon: ShieldCheck, color: 'purple' },
          ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                  <CardContent className="p-8">
                      <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 w-fit mb-4 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                          <stat.icon className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  </CardContent>
              </Card>
          ))}
      </div>

      <div className="flex flex-col sm:row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
          <Input
            placeholder="Search automation templates, NIP flows, or risk nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-4 focus-visible:ring-indigo-500/10 rounded-[24px] font-medium text-sm shadow-inner transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 w-full rounded-[40px]" />)}
        </div>
      ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredWorkflows.map((w) => (
            <WorkflowDefinitionCard
                key={w.workflow_id}
                workflow={w}
                onStartInstance={() => handleOpenStartModal(w.workflow_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-40 border-4 border-dashed border-slate-50 rounded-[40px] bg-slate-50/30">
          <Sparkles className="h-16 w-12 text-slate-200 mx-auto mb-6" />
          <h4 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">Lattice Neutral</h4>
          <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto leading-relaxed">No automation sequences are currently indexed for this environment.</p>
          <Button variant="link" className="mt-8 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:no-underline">Explore Neural Marketplace →</Button>
        </div>
      )}

      {/* Initiation Modal */}
      {isStartModalOpen && selectedWorkflow && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
            <Card className="w-full max-w-xl border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                <CardHeader className="bg-indigo-600 text-white p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
                    <div className="bg-white/20 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 backdrop-blur-md rotate-3 shadow-2xl">
                        <Send className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Initiate Sequence</CardTitle>
                    <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">{selectedWorkflow.name} • Version 1.0.4</CardDescription>
                </CardHeader>
                <CardContent className="p-12 space-y-10">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trigger Payload (JSON Context)</Label>
                        <div className="relative group">
                            <div className="absolute left-6 top-6"><Terminal className="h-4 w-4 text-indigo-400 opacity-40 group-focus-within:opacity-100" /></div>
                            <Textarea
                                value={JSON.stringify(triggeringData, null, 2)}
                                onChange={(e) => {
                                    try { setTriggeringData(JSON.parse(e.target.value)); }
                                    catch(err) { /* silent parse err */ }
                                }}
                                placeholder='{"entity_id": "WZY-ACC-001", "action": "REBALANCE"}'
                                className="w-full font-mono text-xs bg-slate-50 border-none pl-14 pr-8 py-6 rounded-[24px] h-64 shadow-inner focus-visible:ring-4 focus-visible:ring-indigo-600/10 transition-all text-indigo-950 font-bold"
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                        <p className="text-[10px] text-amber-800 leading-relaxed font-black italic">
                            "Manual initiation of an autonomous sequence bypasses standard schedule interlocks. Ensure the payload vector is verified before execution."
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="p-12 pt-0 flex gap-4">
                    <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsStartModalOpen(false)}>Abort protocol</Button>
                    <Button 
                        className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none active:scale-95 transition-all" 
                        onClick={() => startWorkflowMutation.mutate({ workflowId: selectedWorkflow.workflow_id, input: triggeringData })}
                        disabled={startWorkflowMutation.isPending}
                    >
                        {startWorkflowMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        {startWorkflowMutation.isPending ? 'Orchestrating...' : 'Start Execution'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
