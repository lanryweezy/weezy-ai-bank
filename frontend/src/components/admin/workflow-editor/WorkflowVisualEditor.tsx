import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import CustomStepNode from './CustomStepNode';
import { WorkflowStepDefinition, WorkflowStepTransition } from '@/types/workflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  Zap, 
  Play, 
  ShieldCheck, 
  Cpu, 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Save, 
  MousePointer2,
  Terminal,
  Info,
  AlertCircle,
  CheckCircle,
  BrainCircuit,
  UserCheck,
  GitBranch,
  Gauge,
  FastForward,
  Microscope,
  Wand2,
  Sparkle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StepConfigurator from '../StepConfigurator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const nodeTypes = {
  customStep: CustomStepNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 260, height: 160 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 130,
        y: nodeWithPosition.y - 80,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface WorkflowVisualEditorProps {
  steps: WorkflowStepDefinition[];
  startStep: string;
  onDefinitionChange?: (steps: WorkflowStepDefinition[], startStep: string) => void;
  mode?: 'edit' | 'monitoring';
  activeStepName?: string | null;
  executedStepNames?: string[];
  failedStepNames?: string[];
}

const WorkflowVisualEditorInner: React.FC<WorkflowVisualEditorProps> = ({ 
    steps, 
    startStep, 
    onDefinitionChange, 
    mode = 'edit',
    activeStepName,
    executedStepNames = [],
    failedStepNames = []
}) => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSimulating, setIsSimulating] = useState(mode === 'monitoring');
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [coPilotPrompt, setCoPilotPrompt] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedStep = useMemo(() => 
    steps.find(s => s.name === selectedNodeId), 
  [steps, selectedNodeId]);

  // Sync from props
  useEffect(() => {
    if (!steps || steps.length === 0) return;

    const initialNodes: Node[] = steps.map((step) => {
        const isActive = step.name === activeStepName;
        const isExecuted = executedStepNames.includes(step.name);
        const isFailed = failedStepNames.includes(step.name);

        return {
            id: step.name,
            type: 'customStep',
            position: { x: 0, y: 0 },
            data: { 
                name: step.name, 
                type: step.type, 
                description: step.description,
                isStart: step.name === startStep,
                status: isActive ? 'active' : isFailed ? 'failed' : isExecuted ? 'completed' : 'pending'
            },
            className: cn(
                isActive && "!ring-8 !ring-indigo-500 !scale-110 shadow-[0_0_40px_rgba(99,102,241,0.4)]",
                isFailed && "!border-rose-500 !bg-rose-500/10",
                isExecuted && !isActive && "!border-emerald-500 !bg-emerald-500/10"
            )
        };
    });

    const initialEdges: Edge[] = [];
    steps.forEach((step) => {
      step.transitions?.forEach((transition) => {
        const isPathTaken = executedStepNames.includes(step.name) && 
                          (executedStepNames.includes(transition.to) || activeStepName === transition.to);

        initialEdges.push({
          id: `${step.name}-${transition.to}`,
          source: step.name,
          target: transition.to,
          label: transition.description || (transition.condition_type === 'conditional' ? 'CONDITIONAL' : ''),
          labelStyle: { fontSize: 7, fontWeight: 900, fill: isPathTaken ? '#10b981' : '#6366f1', textTransform: 'uppercase' },
          animated: isPathTaken || isSimulating,
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: isPathTaken ? '#10b981' : '#4338ca', 
            width: 15, 
            height: 15 
          },
          style: { 
            stroke: isPathTaken ? '#10b981' : '#4338ca', 
            strokeWidth: isPathTaken ? 3 : 1.5, 
            opacity: isPathTaken ? 1 : 0.4 
          },
        });
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [steps.length, startStep, isSimulating, activeStepName, executedStepNames, failedStepNames, fitView, setNodes, setEdges]);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
  }, [nodes, edges, fitView, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
        setEdges((eds) => addEdge({
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#4338ca' },
            style: { stroke: '#4338ca', strokeWidth: 1.5, opacity: 0.4 },
        }, eds));
    },
    [setEdges]
  );

  const syncToParent = useCallback(() => {
    if (!onDefinitionChange) return;
    const updatedSteps: WorkflowStepDefinition[] = nodes.map((node) => {
        const stepTransitions: WorkflowStepTransition[] = edges
            .filter((edge) => edge.source === node.id)
            .map((edge) => ({
                to: edge.target,
                description: edge.label as string,
                condition_type: edge.label ? 'conditional' : 'always',
            }));

        const originalStep = steps.find(s => s.name === node.id);
        return {
            ...(originalStep || { type: node.data.type as any, name: node.id }),
            name: node.id,
            description: node.data.description as string,
            transitions: stepTransitions,
        };
    });

    onDefinitionChange(updatedSteps, startStep);
  }, [nodes, edges, steps, startStep, onDefinitionChange]);

  const addNewNode = (type: string) => {
    const id = `step_${nodes.length + 1}`;
    const newNode: Node = {
        id,
        type: 'customStep',
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { name: id, type, description: `New ${type.replace(/_/g, ' ')} step` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleStepUpdate = (updatedStep: WorkflowStepDefinition) => {
    if (onDefinitionChange) {
        const updatedSteps = steps.map(s => s.name === updatedStep.name ? updatedStep : s);
        onDefinitionChange(updatedSteps, startStep);
    }
    
    setNodes(nds => nds.map(node => {
        if (node.id === updatedStep.name) {
            return {
                ...node,
                data: {
                    ...node.data,
                    name: updatedStep.name,
                    type: updatedStep.type,
                    description: updatedStep.description
                }
            };
        }
        return node;
    }));
  };

  const runStressTest = () => {
    setIsStressTesting(true);
    setTimeout(() => {
        setIsStressTesting(false);
    }, 3000);
  };

  const invokeCoPilot = () => {
    console.log("Co-Pilot Prompt:", coPilotPrompt);
    setCoPilotPrompt('');
  };

  return (
    <div className="h-[850px] w-full bg-[#010102] rounded-[64px] overflow-hidden border-[16px] border-white/[0.03] shadow-[0_0_120px_rgba(0,0,0,0.8)] relative group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#010102]"
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
      >
        <Background color="#0a0a14" gap={40} size={1} variant="dots" />
        
        {/* Left: Component Factory & Co-Pilot */}
        <Panel position="top-left" className="m-12 flex flex-col gap-6">
            <div className="bg-white/[0.02] backdrop-blur-3xl p-3 rounded-[32px] border border-white/[0.05] shadow-2xl flex flex-col gap-3">
                {[
                    { type: 'agent_execution', icon: BrainCircuit, color: 'text-purple-400', label: 'Agent' },
                    { type: 'human_review', icon: UserCheck, color: 'text-blue-400', label: 'Review' },
                    { type: 'decision', icon: GitBranch, color: 'text-amber-400', label: 'Router' },
                    { type: 'external_api_call', icon: Zap, color: 'text-pink-400', label: 'API' },
                ].map((item) => (
                    <Button 
                        key={item.type}
                        onClick={() => addNewNode(item.type)}
                        variant="ghost" 
                        className={cn("h-14 w-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] transition-all group relative", item.color)}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="absolute left-16 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Add {item.label}
                        </span>
                    </Button>
                ))}
            </div>

            {/* Neural Co-Pilot Input */}
            <div className="w-80 bg-white/[0.02] backdrop-blur-3xl p-6 rounded-[32px] border border-white/[0.05] shadow-2xl space-y-4 group/copilot">
                <div className="flex items-center gap-3">
                    <Wand2 className="h-4 w-4 text-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover/copilot:text-indigo-400 transition-colors">Neural Co-Pilot</span>
                </div>
                <div className="relative">
                    <Input 
                        placeholder="e.g. Build an NFIU SAR flow..." 
                        value={coPilotPrompt}
                        onChange={(e) => setCoPilotPrompt(e.target.value)}
                        className="bg-black/40 border-white/5 rounded-2xl text-[10px] h-12 pr-12 focus:ring-indigo-500/20 placeholder:text-white/10"
                    />
                    <Button 
                        size="icon" 
                        onClick={invokeCoPilot}
                        className="absolute right-1 top-1 h-10 w-10 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl border border-indigo-500/20 transition-all"
                    >
                        <FastForward className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </Panel>

        {/* Top Right: Executive Controls */}
        <Panel position="top-right" className="m-12 flex gap-6">
            <div className="flex items-center bg-white/[0.02] backdrop-blur-3xl p-2 rounded-[32px] border border-white/[0.05] shadow-2xl gap-2">
                <Button 
                    onClick={onLayout}
                    className="h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-indigo-400"
                >
                    <LayoutTemplate className="h-5 w-5" />
                </Button>

                <Button 
                    onClick={runStressTest}
                    disabled={isStressTesting}
                    className={cn(
                        "h-14 px-8 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] transition-all",
                        isStressTesting ? "bg-rose-600 text-white animate-pulse" : "bg-white/[0.03] text-white hover:bg-rose-500/20 hover:text-rose-400"
                    )}
                >
                    {isStressTesting ? <><Microscope className="mr-3 h-4 w-4" /> Stressing...</> : <><Gauge className="mr-3 h-4 w-4" /> Stress Test</>}
                </Button>
                
                <Button 
                    onClick={syncToParent}
                    className="h-14 px-8 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500"
                >
                    <Save className="mr-3 h-4 w-4" /> Synthesize
                </Button>
            </div>

            <Button 
                onClick={() => setIsSimulating(!isSimulating)}
                className={cn(
                    "h-14 px-8 rounded-[32px] font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-700 shadow-2xl border border-white/5",
                    isSimulating 
                    ? 'bg-indigo-600 text-white shadow-indigo-500/40 animate-pulse' 
                    : 'bg-white/[0.02] backdrop-blur-3xl text-white hover:bg-indigo-500/20'
                )}
            >
                {isSimulating ? <><Activity className="mr-3 h-4 w-4" /> Sentient Stream</> : <><Play className="mr-3 h-4 w-4" /> Pulse Check</>}
            </Button>
        </Panel>

        {/* Neural Heatmap Overlay (Mocked for Stress Test) */}
        {isStressTesting && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-20 right-40 p-8 bg-black/80 backdrop-blur-3xl border border-rose-500/20 rounded-[40px] shadow-2xl animate-in slide-in-from-right">
                    <div className="flex items-center gap-4 mb-4">
                        <AlertCircle className="h-6 w-6 text-rose-500" />
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Neural Bottleneck Detected</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[200px]">
                        Transaction velocity at node <span className="text-white">'threshold_check'</span> exceeds 50k req/min. Regulatory latency expected.
                    </p>
                </div>
            </div>
        )}

        {/* Neural Compliance Terminal */}
        <Panel position="bottom-right" className="m-12 w-96">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl transition-all duration-500 hover:border-indigo-500/30">
                <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-3 w-3 text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Compliance Terminal</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-3">
                        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-300 leading-relaxed font-bold italic">
                            {selectedStep?.type === 'agent_execution' 
                                ? "AI Agent detected. Ensure the 'agent_core_logic_identifier' matches an active node in the Neural Layer."
                                : "Lattice stable. Ready for Nigerian banking regulation injection."}
                        </p>
                    </div>
                </div>
            </div>
        </Panel>

        <Panel position="bottom-center" className="mb-12">
            <div className="bg-white/[0.02] backdrop-blur-3xl px-10 py-5 rounded-full border border-white/[0.05] flex items-center gap-10 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status: <span className="text-white italic">SENTIENT_SYNC</span></span>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="flex items-center gap-4 group cursor-help">
                    <Cpu className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Node Logic: <span className="text-white">OPTIMAL</span></span>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="flex items-center gap-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Integrity: <span className="text-white">ENFORCED</span></span>
                </div>
            </div>
        </Panel>

        <Controls className="!bg-white/[0.02] !backdrop-blur-3xl !border-white/[0.05] !shadow-2xl !rounded-2xl !overflow-hidden !text-white !m-12" />
      </ReactFlow>

      <Sheet open={!!selectedNodeId} onOpenChange={(open) => !open && setSelectedNodeId(null)}>
        <SheetContent className="bg-[#050508]/95 backdrop-blur-2xl border-l border-white/10 text-white w-[500px] sm:max-w-[500px]">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                    <SheetTitle className="text-xl font-black italic uppercase tracking-tighter text-white">Node Inspector</SheetTitle>
                    <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Configuring: {selectedNodeId}</SheetDescription>
                </div>
            </div>
          </SheetHeader>

          <div className="space-y-8 pr-4 overflow-y-auto h-[calc(100vh-180px)] custom-scrollbar">
            {selectedStep ? (
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 shadow-inner">
                    <StepConfigurator 
                        step={selectedStep} 
                        onStepChange={handleStepUpdate} 
                        availableRoles={['ADMIN', 'COMPLIANCE_OFFICER', 'TREASURY_HEAD', 'CFO', 'AGENT_SUPERVISOR']}
                        allStepNames={steps.map(s => s.name)}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Select a node to configure</p>
                </div>
            )}
            
            <div className="p-6 rounded-[32px] bg-indigo-600/10 border border-indigo-500/20 flex gap-4">
                <CheckCircle className="h-6 w-6 text-indigo-400 shrink-0" />
                <p className="text-[10px] text-indigo-200 leading-relaxed font-bold italic">
                    "Modifying this node updates the 'Neural Lattice' in real-time. Ensure your 'Form Schema' aligns with Nigerian KYC Tiers."
                </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="absolute top-12 left-12 pointer-events-none group-hover:translate-x-1 transition-transform">
        <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-px bg-indigo-500/50" />
                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40">Weezy CBS</span>
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white/10">Neural Automation Layer</h2>
        </div>
      </div>
    </div>
  );
};

const WorkflowVisualEditor: React.FC<WorkflowVisualEditorProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowVisualEditorInner {...props} />
  </ReactFlowProvider>
);

export default WorkflowVisualEditor;
