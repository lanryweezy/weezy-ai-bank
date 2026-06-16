import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  DollarSign, 
  PieChart, 
  BrainCircuit, 
  Activity, 
  Cpu, 
  Zap, 
  Search, 
  ChevronRight, 
  Target,
  Scale,
  Microscope,
  FastForward,
  Play,
  Wand2,
  Database,
  ShieldCheck
} from 'lucide-react';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const AICreditConsole: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState('APP-1042');

  const mockApplications = [
    { id: 'APP-1042', name: 'Sulaiman Adebayo', amount: '₦2,500,000', dti: 24.5, score: 82, status: 'APPROVED', time: '2m ago' },
    { id: 'APP-1043', name: 'Temitope Akin', amount: '₦1,200,000', dti: 38.2, score: 45, status: 'REJECTED', time: '14m ago' },
    { id: 'APP-1044', name: 'Adewale Adelowo', amount: '₦5,000,000', dti: 12.8, score: 94, status: 'APPROVED', time: '1h ago' },
  ];

  const selectedApp = useMemo(() => 
    mockApplications.find(a => a.id === selectedAppId), 
  [selectedAppId]);

  return (
    <div className="space-y-16">
      
      {/* Global Risk Nexus Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
            { label: 'Asset_Velocity', val: '₦142.8M', icon: DollarSign, color: 'text-indigo-400', sub: 'Total Disbursed Today' },
            { label: 'Appraisal_Latency', val: '42s', icon: Clock, color: 'text-emerald-400', sub: 'Avg Decision Time' },
            { label: 'Risk_Lattice_Index', val: '0.08%', icon: PieChart, color: 'text-rose-400', sub: 'Current Default Prob.' },
        ].map((stat, i) => (
            <HolographicCard key={i} className="p-10 group flex flex-col justify-between min-h-[280px]">
                <div className="flex justify-between items-start">
                    <div className={cn("p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                        <stat.icon className="h-8 w-8" />
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.4em] border-white/5 opacity-40">NOMINAL</Badge>
                </div>
                <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">{stat.label}</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">{stat.val}</h3>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">{stat.sub}</p>
                </div>
            </HolographicCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Underwriting Stream */}
        <div className="lg:col-span-7 space-y-10">
          <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-6">
                  <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                      <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                      <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Appraisal Stream</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Real-time Decision Handshaking</p>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
          {mockApplications.map((app, idx) => (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} key={app.id}>
                <HolographicCard 
                    className={cn(
                        "p-10 cursor-pointer transition-all duration-700",
                        selectedAppId === app.id ? "ring-2 ring-indigo-500/50 bg-indigo-500/5" : "hover:bg-white/[0.02]"
                    )}
                    onClick={() => setSelectedAppId(app.id)}
                >
                    <div className="flex items-center gap-10">
                        <div className={cn(
                            "p-6 rounded-[28px] shadow-2xl transition-all duration-700 group-hover:rotate-12",
                            app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        )}>
                            <User className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">{app.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-mono font-black tracking-[0.3em] mt-2 italic">#NODE_{app.id}</p>
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">{app.time}</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <p className="text-xl font-black text-white tracking-tighter italic">{app.amount}</p>
                                <div className="w-px h-4 bg-white/5" />
                                <div className="flex items-center gap-3">
                                    <Target className="w-3.5 h-3.5 text-slate-600" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score: <span className="text-white">{app.score}</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-4">
                            <Badge className={cn(
                                "border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-2xl",
                                app.status === 'APPROVED' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                                {app.status}
                            </Badge>
                            <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className={cn("h-full", app.score > 70 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${app.score}%` }} />
                            </div>
                        </div>
                    </div>
                </HolographicCard>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Neural Logic Visualizer */}
        <div className="lg:col-span-5 space-y-12">
            <SentientFrame intent="neutral" title="Cognitive Appraisal" subtitle="Autonomous Underwriting Path Analysis">
                <div className="space-y-12 relative z-10">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em]">
                            <span className="text-slate-500">Debt_To_Income_Lattice</span>
                            <span className={cn(
                                "italic",
                                (selectedApp?.dti || 0) > 33.3 ? "text-rose-500" : "text-emerald-400"
                            )}>{selectedApp?.dti}% / 33.3%</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((selectedApp?.dti || 0) / 33.3) * 100, 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className={cn(
                                    "h-full shadow-[0_0_15px]",
                                    (selectedApp?.dti || 0) > 33.3 ? "bg-rose-500 shadow-rose-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div className="p-8 bg-black/40 border border-white/5 rounded-[32px] space-y-3 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Bureau_Link</span>
                            </div>
                            <p className="text-lg font-black text-white italic tracking-tighter uppercase">CLEAN_782</p>
                        </div>
                        <div className="p-8 bg-black/40 border border-white/5 rounded-[32px] space-y-3 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <Cpu className="h-4 w-4 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Identity_Match</span>
                            </div>
                            <p className="text-lg font-black text-white italic tracking-tighter uppercase">98.4%_PROOFS</p>
                        </div>
                    </div>

                    <div className="p-10 rounded-[40px] bg-indigo-600/5 border border-indigo-500/10 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <BrainCircuit className="w-24 h-24 text-indigo-400 rotate-12" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Wand2 className="h-5 w-5 text-indigo-400 animate-pulse" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural_Rationale</h4>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-400 italic">
                            "Lattice Synthesis Result: Customer exhibits high stability in utility payment history and maintain low debt utilization across 3 institutions. 
                            NIN/BVN biometric handshake confirmed. Recommend AUTO_PASS for ₦{(parseFloat(selectedApp?.amount?.replace(/[₦,]/g, '') || '0') / 1).toLocaleString()} Tier 3 limit."
                        </p>
                    </div>

                    <div className="pt-8 flex gap-6">
                        <Button className="flex-1 bg-white/[0.02] border border-white/10 hover:bg-white/5 h-20 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] transition-all text-slate-400 hover:text-white">
                           Manual_Override
                        </Button>
                        <Button className="flex-[2] bg-indigo-600 h-20 rounded-[32px] font-black text-sm italic tracking-tighter shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all text-white border-none">
                           TRACE_LATTICE_HISTORY
                        </Button>
                    </div>
                </div>
            </SentientFrame>
            
            <HolographicCard className="p-10 bg-gradient-to-br from-emerald-900/10 to-transparent">
                <div className="flex items-center gap-5 mb-6">
                    <ShieldCheck className="h-6 w-6 text-emerald-400 animate-pulse" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">FIRS/CBN Handshake</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed italic">
                    "Tax clearance and BVN identity nodes are fully synchronized for {selectedApp?.name}. No regulatory blocks detected."
                </p>
            </HolographicCard>
        </div>
      </div>
    </div>
  );
};

export default AICreditConsole;
