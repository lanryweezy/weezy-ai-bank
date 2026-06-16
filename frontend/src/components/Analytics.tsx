import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  CreditCard, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownRight, 
  BrainCircuit, 
  Cpu, 
  Zap, 
  Sparkles,
  Target,
  Globe,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AlertTriangle
} from 'lucide-react';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const portfolioData = [
  { month: 'Jan', savings: 4000, loans: 2400, fds: 2400 },
  { month: 'Feb', savings: 3000, loans: 1398, fds: 2210 },
  { month: 'Mar', savings: 2000, loans: 9800, fds: 2290 },
  { month: 'Apr', savings: 2780, loans: 3908, fds: 2000 },
  { month: 'May', savings: 1890, loans: 4800, fds: 2181 },
  { month: 'Jun', savings: 2390, loans: 3800, fds: 2500 },
];

const departmentData = [
  { name: 'Retail Banking', value: 45, color: '#6366f1' },
  { name: 'Corporate', value: 25, color: '#10b981' },
  { name: 'SME', value: 20, color: '#f59e0b' },
  { name: 'Investment', value: 10, color: '#ef4444' },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-16">
      
      {/* High-Fidelity Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
            { label: 'Total_Bank_Assets', val: '₦4.8B', delta: '+12.5%', icon: Landmark, color: 'text-indigo-400' },
            { label: 'Active_Identity_Nodes', val: '12,482', delta: '+4.2%', icon: Users, color: 'text-emerald-400' },
            { label: 'Portfolio_NPL_Ratio', val: '1.8%', delta: '+0.2%', icon: Activity, color: 'text-rose-400' },
        ].map((stat, i) => (
            <HolographicCard key={i} className="p-10 group">
                <div className="flex justify-between items-start mb-8">
                    <div className={cn("p-5 rounded-[24px] bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                        <stat.icon className="h-8 w-8" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5",
                        stat.label.includes('Ratio') ? "text-rose-400" : "text-emerald-400"
                    )}>
                        <ArrowUpRight className="w-3 h-3" /> {stat.delta}
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">{stat.label}</p>
                <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{stat.val}</h3>
                <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-[0.3em] italic">Current Cycle Performance</p>
            </HolographicCard>
        ))}
      </div>

      <div className="space-y-12">
        <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
                <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                    <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Intelligence Terminal</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Forensic Cross-Module Performance</p>
                </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-auto">
                <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto">
                    <TabsTrigger value="overview" className="rounded-xl px-8 py-3 font-black text-[9px] tracking-[0.4em] uppercase data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all shadow-2xl">Overview</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-xl px-8 py-3 font-black text-[9px] tracking-[0.4em] uppercase data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all shadow-2xl">Lattice_Efficiency</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <Tabs defaultValue="overview" className="w-full">
            <TabsContent value="overview" className="mt-0 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <HolographicCard className="p-12">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">Portfolio Distribution</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Asset allocation across departmental nodes</p>
                            </div>
                            <PieChartIcon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="h-[350px] w-full relative">
                            <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] rounded-full scale-75 animate-pulse" />
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={130}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#050508', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontFamily: 'monospace' }}
                                />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </HolographicCard>

                    <HolographicCard className="p-12">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black italic uppercase tracking-[0.3em] text-white">Growth Vectors</h4>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Monthly inflow vs credit disbursement</p>
                            </div>
                            <LineChartIcon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={portfolioData}>
                                <defs>
                                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#475569', fontWeight: 900}} />
                                <YAxis hide={true} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#050508', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontFamily: 'monospace' }}
                                />
                                <Area type="monotone" dataKey="savings" stroke="#6366f1" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={4} />
                                <Area type="monotone" dataKey="loans" stroke="#10b981" fillOpacity={1} fill="url(#colorLoans)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </HolographicCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <SentientFrame intent="neutral" title="Sentinel Intelligence" subtitle="Autonomous Performance Observations">
                        <div className="space-y-8 p-2 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-5">
                                <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
                                <p className="text-base font-medium leading-relaxed text-slate-400 italic">
                                    "Portfolio Analysis complete. Current <span className="text-emerald-400 font-black">12.5% yield growth</span> is driven by SME Retail node performance. We recommend re-allocating ₦40M from dormant Treasury nostalgia accounts to SME growth corridor to capture 14.8% spread."
                                </p>
                            </div>
                            <div className="p-8 bg-black/40 border border-white/5 rounded-[32px] flex items-center justify-between shadow-2xl">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">System_Confidence</span>
                                    <span className="text-xl font-black text-indigo-400 italic tracking-tighter uppercase">98.2%_ACCURACY</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                                    <Cpu className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </SentientFrame>

                    <HolographicCard className="p-10 bg-gradient-to-br from-rose-900/10 to-transparent flex flex-col justify-center">
                        <div className="flex items-center gap-5 mb-8">
                            <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Macro_Risk_Radar</h4>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed italic mb-8">
                            "Alert: MPC policy shift detected. NGN Liquidity expected to tighten in next 48 hours. Suggest closing open FX corridors to maintain 32.5% CRR adherence."
                        </p>
                        <Button className="w-full h-16 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                            Initiate_Macro_Hedge
                        </Button>
                    </HolographicCard>
                </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
                <HolographicCard className="p-12">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black italic uppercase tracking-[0.3em] text-white">Efficiency Matrix</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Inter-module asset/liability conversion performance</p>
                        </div>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={portfolioData}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569', fontWeight: 900}} />
                                <YAxis hide={true} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#050508', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontFamily: 'monospace' }}
                                />
                                <Bar dataKey="savings" fill="url(#barGradient)" radius={[12, 12, 0, 0]} barSize={40} />
                                <Bar dataKey="loans" fill="#10b981" fillOpacity={0.4} radius={[12, 12, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </HolographicCard>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
