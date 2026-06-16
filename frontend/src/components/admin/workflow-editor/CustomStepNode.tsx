import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  GitBranch, 
  BrainCircuit, 
  UserCheck, 
  Zap, 
  ExternalLink, 
  Layers, 
  LogIn, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stepTypeIcons: Record<string, any> = {
  agent_execution: BrainCircuit,
  human_review: UserCheck,
  decision: GitBranch,
  parallel: Layers,
  join: GitBranch,
  end: CheckCircle2,
  external_api_call: ExternalLink,
  data_input: LogIn,
  sub_workflow: Zap,
};

const stepTypeColors: Record<string, string> = {
  agent_execution: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  human_review: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  decision: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  parallel: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
  join: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
  end: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  external_api_call: 'border-pink-500/50 bg-pink-500/10 text-pink-400',
  data_input: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
  sub_workflow: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
};

const CustomStepNode = ({ data, selected }: NodeProps) => {
  const Icon = stepTypeIcons[data.type as string] || Zap;
  const colorClass = stepTypeColors[data.type as string] || 'border-slate-500/50 bg-slate-500/10 text-slate-400';

  return (
    <div className={cn(
      "px-5 py-4 rounded-[28px] border-2 shadow-2xl transition-all duration-500 w-64 backdrop-blur-2xl relative group",
      colorClass,
      selected ? "ring-8 ring-indigo-500/20 scale-110 shadow-indigo-500/20 border-white/40" : "hover:border-white/20 hover:scale-105"
    )}>
      {/* Neural Handshake Pulse */}
      {selected && (
        <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur animate-pulse pointer-events-none" />
      )}

      <Handle type="target" position={Position.Top} className="!w-4 !h-1.5 !bg-white/20 !border-none !rounded-full hover:!bg-white/40 transition-colors" />
      
      <div className="flex items-center gap-4 mb-3">
        <div className={cn(
            "p-3 rounded-2xl shadow-inner border border-white/5",
            selected ? "bg-white text-slate-900 shadow-xl" : "bg-white/5"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-50 truncate mb-0.5">
            {data.type?.toString().replace(/_/g, ' ')}
          </p>
          <h3 className={cn(
              "text-xs font-black italic uppercase tracking-tight truncate leading-tight",
              selected ? "text-white" : "text-slate-100"
          )}>
            {data.name as string}
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        {data.description && (
            <p className="text-[10px] text-slate-400 line-clamp-2 font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
            {data.description as string}
            </p>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Badge variant="outline" className="text-[8px] font-black tracking-widest bg-white/5 border-none text-slate-500 py-0 h-4">
                ID: {data.name?.toString().slice(0, 8)}
            </Badge>
            {data.isStart && (
                <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black tracking-widest px-2 py-0 h-4 shadow-lg shadow-indigo-500/20">
                    MASTER_ENTRY
                </Badge>
            )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-4 !h-1.5 !bg-white/20 !border-none !rounded-full hover:!bg-white/40 transition-colors" />
    </div>
  );
};

export default memo(CustomStepNode);
