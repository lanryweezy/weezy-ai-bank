import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
import { AgentTemplate } from '@/types/agentTemplates';
import AgentTemplateCard from './AgentTemplateCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Sparkles, Filter, BrainCircuit } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { Input } from './ui/input';

const AIAgentTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: () => apiClient<AgentTemplate[]>('/agent-templates'),
  });

  const filteredTemplates = templates?.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic uppercase">
            NEURAL REGISTRY <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><BrainCircuit className="h-6 w-6 text-white" /></div>
          </h2>
          <p className="text-slate-500 font-medium text-lg">Deploy pre-trained autonomous nodes for specialized financial ops.</p>
        </div>
        <Button onClick={() => refetch()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Intelligence
        </Button>
      </div>

      <div className="flex flex-col sm:row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
          <Input
            placeholder="Search expertise, industry, or neural capability..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-4 focus-visible:ring-indigo-500/10 rounded-[24px] font-medium text-sm shadow-inner transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-[40px]" />)}
        </div>
      ) : error ? (
        <div className="p-20 text-center bg-rose-50/50 rounded-[40px] border border-rose-100 flex flex-col items-center">
            <div className="bg-white p-6 rounded-3xl shadow-sm mb-6"><AlertCircle className="h-10 w-10 text-rose-500" /></div>
            <p className="text-rose-900 font-black text-xl italic tracking-tight">Registry Synchrony Failed</p>
            <p className="text-rose-600 text-sm mt-2 font-medium max-w-xs mx-auto leading-relaxed">The neural downlink is currently unstable. Please re-authenticate your master key.</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-8 rounded-xl border-rose-200 text-rose-700 font-bold hover:bg-rose-100">Retry Protocol</Button>
        </div>
      ) : filteredTemplates?.length === 0 ? (
        <div className="text-center py-40 border-4 border-dashed border-slate-50 rounded-[40px] bg-slate-50/30">
            <Sparkles className="h-16 w-12 text-slate-200 mx-auto mb-6" />
            <h4 className="text-xl font-black text-slate-900 italic tracking-tight">No Matches in Lattice</h4>
            <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">No intelligence templates match your specific search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTemplates?.map((template) => (
            <AgentTemplateCard key={template.template_id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAgentTemplates;
