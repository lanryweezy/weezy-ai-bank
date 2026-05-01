import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Brain, ArrowRight, Zap, Shield, BarChart3, Fingerprint } from 'lucide-react';
import { AgentTemplate } from '@/types/agentTemplates';
import { Badge } from './ui/badge';

interface AgentTemplateCardProps {
  template: AgentTemplate;
}

const AgentTemplateCard: React.FC<AgentTemplateCardProps> = ({ template }) => {
  const navigate = useNavigate();

  const handleConfigure = () => {
    navigate(`/configure-agent?templateId=${template.template_id}`);
  };

  const getIcon = (id: string) => {
    const cid = id.toLowerCase();
    if (cid.includes('fraud')) return <Shield className="h-6 w-6 text-rose-600" />;
    if (cid.includes('credit') || cid.includes('score')) return <BarChart3 className="h-6 w-6 text-indigo-600" />;
    if (cid.includes('kyc') || cid.includes('compliance')) return <Fingerprint className="h-6 w-6 text-emerald-600" />;
    return <Brain className="h-6 w-6 text-indigo-600" />;
  };

  const getColorClass = (id: string) => {
    const cid = id.toLowerCase();
    if (cid.includes('fraud')) return 'bg-rose-50';
    if (cid.includes('credit')) return 'bg-indigo-50';
    if (cid.includes('kyc')) return 'bg-emerald-50';
    return 'bg-indigo-50';
  };

  return (
    <Card className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-xl hover:ring-2 hover:ring-indigo-500 transition-all duration-300 rounded-2xl flex flex-col h-full">
      <CardHeader className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${getColorClass(template.core_logic_identifier)}`}>
            {getIcon(template.core_logic_identifier)}
          </div>
          <Badge variant="secondary" className="bg-gray-50 text-gray-500 border-none font-bold px-3 py-1">v1.0.4</Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{template.name}</CardTitle>
        <CardDescription className="text-gray-500 mt-2 line-clamp-2 leading-relaxed">
          {template.description || 'Advanced autonomous capability for banking orchestration.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0 flex-grow">
        <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold text-gray-600 uppercase">Real-time</span>
            </div>
            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-600 uppercase">Secure</span>
            </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={handleConfigure}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-100"
        >
          Deploy Instance <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentTemplateCard;
