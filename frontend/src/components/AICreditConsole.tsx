import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock, User, DollarSign, PieChart } from 'lucide-react';

const AICreditConsole: React.FC = () => {
  const mockApplications = [
    { id: 'APP-1042', name: 'Sulaiman Adebayo', amount: '₦2,500,000', dti: 24.5, score: 82, status: 'APPROVED', time: '2m ago' },
    { id: 'APP-1043', name: 'Temitope Akin', amount: '₦1,200,000', dti: 38.2, score: 45, status: 'REJECTED', time: '14m ago' },
    { id: 'APP-1044', name: 'Adewale Adelowo', amount: '₦5,000,000', dti: 12.8, score: 94, status: 'APPROVED', time: '1h ago' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Credit Analyst Console</h2>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Autonomous Underwriting v2.1</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autonomous Approval Rate</p>
                <p className="text-2xl font-black text-white italic tracking-tighter uppercase">94.2%</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <Card className="obsidian-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <DollarSign className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Disbursed (Today)</p>
                <p className="text-2xl font-black text-white tracking-tighter uppercase">₦142.8M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="obsidian-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <Clock className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg. Appraisal Time</p>
                <p className="text-2xl font-black text-white tracking-tighter uppercase">42 Seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="obsidian-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <PieChart className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Default Risk Index</p>
                <p className="text-2xl font-black text-white tracking-tighter uppercase">0.08%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Live Underwriting Stream</h3>
          {mockApplications.map((app) => (
            <div key={app.id} className="p-6 rounded-3xl glass-dark border border-white/5 flex items-center gap-6 group hover:bg-white/5 transition-all">
               <div className={`p-4 rounded-2xl ${app.status === 'APPROVED' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <User className={`h-6 w-6 ${app.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`} />
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-black text-white tracking-tight uppercase italic">{app.name}</h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{app.time}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm font-black text-indigo-400">{app.amount}</p>
                    <div className="w-[1px] h-3 bg-white/10" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">REF: {app.id}</p>
                  </div>
               </div>
               <div className="text-right space-y-2">
                  <Badge variant={app.status === 'APPROVED' ? 'default' : 'destructive'} className="rounded-lg font-black uppercase text-[9px] tracking-widest px-3">
                    {app.status}
                  </Badge>
                  <p className="text-[11px] font-black text-white tracking-tighter">SCORE: {app.score}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Detailed Logic Visualizer */}
        <Card className="obsidian-card border-indigo-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Underwriting Logic (APP-1042)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Debt-to-Income (DTI)</span>
                   <span className="text-white">24.5% / 35.0%</span>
                </div>
                <Progress value={24.5} className="h-2 bg-white/5" indicatorClassName="bg-emerald-500" />
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Bureau Status
                    </span>
                    <p className="text-sm font-black text-white uppercase italic">CLEAN • 782 Score</p>
                </div>
                <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Identity Match
                    </span>
                    <p className="text-sm font-black text-white uppercase italic">98.4% FACIAL MATCH</p>
                </div>
             </div>

             <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Cpu className="h-3 w-3" /> Cognitive Rationale
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                    "Customer exhibits high stability in utility payment history and maintain low debt utilization across 3 institutions. 
                    NIN/BVN biometric handshake confirmed. Recommend AUTO_PASS for ₦2.5M Tier 3 limit."
                </p>
             </div>

             <div className="flex gap-3">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-12">
                   Manual Override
                </Button>
                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-xl h-12">
                   View Full Dossier
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICreditConsole;
