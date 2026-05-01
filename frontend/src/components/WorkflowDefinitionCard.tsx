
import React from 'react';
import { WorkflowDefinition } from '@/types/workflows';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Settings, Clock, GitBranch, ArrowRight } from 'lucide-react';

interface WorkflowDefinitionCardProps {
  workflow: WorkflowDefinition;
  onStartInstance: (workflowId: string) => void;
}

const WorkflowDefinitionCard: React.FC<WorkflowDefinitionCardProps> = ({ workflow, onStartInstance }) => {
  return (
    <Card className="overflow-hidden group hover:ring-2 hover:ring-indigo-500 transition-all duration-300 border-none bg-white shadow-sm hover:shadow-xl rounded-2xl">
      <div className="h-2 bg-indigo-600 w-full" />
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-indigo-50 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <GitBranch className="h-6 w-6 text-indigo-600" />
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold px-3">Active</Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">{workflow.name}</CardTitle>
        <CardDescription className="line-clamp-2 mt-2 leading-relaxed h-10">
          {workflow.description || "Automate multi-step financial logic and decision trees."}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Total Steps</span>
                <span className="font-bold text-gray-700">{workflow.steps?.length || 0} Nodes</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Avg Run</span>
                <span className="font-bold text-gray-700">~1.2s</span>
            </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-xl h-11 border-gray-200 hover:bg-gray-50 text-gray-600 font-bold"
        >
          <Eye className="w-4 h-4 mr-2" /> Inspect
        </Button>
        <Button
          onClick={() => onStartInstance(workflow.workflow_id)}
          className="flex-1 rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          <Play className="w-4 h-4 mr-2" /> Start
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkflowDefinitionCard;
