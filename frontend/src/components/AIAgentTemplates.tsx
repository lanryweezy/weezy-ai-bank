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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-indigo-600" /> Intelligence Registry
          </h2>
          <p className="text-gray-500 mt-1">Deploy pre-trained autonomous agents for specialized financial operations.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="h-11 px-6 rounded-xl border-gray-200">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Registry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by expertise, industry, or capability..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-gray-200 rounded-xl"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          Capabilities
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-rose-50 rounded-2xl border border-rose-100">
            <p className="text-rose-800 font-bold">Failed to load agent registry.</p>
            <p className="text-rose-600 text-sm mt-1">Please check your network connection and try again.</p>
        </div>
      ) : filteredTemplates?.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl ring-1 ring-gray-100">
            <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No intelligence templates match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates?.map((template) => (
            <AgentTemplateCard key={template.template_id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAgentTemplates;
