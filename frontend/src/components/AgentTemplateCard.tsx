import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Brain, ArrowRight, Zap, Shield, BarChart3, Fingerprint, Cpu, Activity } from 'lucide-react';
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

  return (
    <Card className="group overflow-hidden border-none shadow-sm ring-1 ring-slate-200/60 bg-white hover:shadow-2xl hover:ring-indigo-500/30 transition-all duration-500 rounded-[32px] flex flex-col h-full relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-700 pointer-events-none">
          <Cpu className="h-32 w-32" />
      </div>
      
      <CardHeader className="p-8 pb-4 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-[20px] transition-all duration-500 shadow-inner group-hover:scale-110 bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white`}>
            {getIcon(template.core_logic_identifier)}
          </div>
          <Badge className="bg-slate-900 text-indigo-400 border-none font-black text-[8px] px-3 py-1 uppercase tracking-widest">Active Node</Badge>
        </div>
        <CardTitle className="text-xl font-black text-slate-900 tracking-tight italic group-hover:text-indigo-600 transition-colors uppercase">{template.name}</CardTitle>
        <CardDescription className="text-slate-500 mt-3 text-xs font-medium leading-relaxed line-clamp-2 italic">
          "{template.description || 'Advanced autonomous capability for banking orchestration.'}"
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8 pt-4 flex-grow relative z-10">
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col gap-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence</p>
                    <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs font-black text-slate-700">99.2%</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 flex flex-col gap-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Latency</p>
                    <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-black text-slate-700">4ms</span>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Neural Load</span>
                    <span className="text-indigo-600">Stable</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[24%] rounded-full group-hover:w-[42%] transition-all duration-1000" />
                </div>
            </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 relative z-10">
        <Button
          onClick={handleConfigure}
          className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 border-none group/btn"
        >
          Configure Node <ArrowRight className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentTemplateCard;
