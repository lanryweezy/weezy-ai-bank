import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Target, TrendingUp, ArrowUpRight, Plus, Brain, Info, Loader2, CheckCircle2, Cpu, Zap, Activity, Globe, Sparkles, ChevronRight, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const SavingsInvestments = () => {
  const [isCreatingGoal, setIsRegistering] = useState(false);
  const [isViewingAdvice, setIsViewingAdvice] = useState(false);
  const [goalData, setGoalData] = useState({ name: '', target_amount: '', target_date: '' });

  const { data: goals, isLoading: loadingGoals, refetch: refetchGoals } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: () => apiClient('/savings/goals'),
  });

  const { data: advice, isLoading: loadingAdvice } = useQuery({
    queryKey: ['investmentAdvice'],
    queryFn: () => apiClient('/savings/ai-advice'),
    enabled: isViewingAdvice,
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: any) => apiClient('/savings/goals', { 
        method: 'POST', 
        body: JSON.stringify({ ...data, customer_id: 1, target_amount: parseFloat(data.target_amount) }) 
    }),
    onSuccess: () => {
      toast.success('Savings Goal created! Node activated.');
      setIsRegistering(false);
      refetchGoals();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create goal'),
  });

  if (loadingGoals) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Wealth Nodes...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Asset Goals <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><PiggyBank className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> Cognitive Wealth Accumulation
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setIsViewingAdvice(true)} variant="outline" className="rounded-2xl h-14 px-8 border-white/5 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                <Brain className="mr-3 h-5 w-5 text-indigo-400" /> AI Advisor
            </Button>
            <Button onClick={() => setIsRegistering(true)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
                <Plus className="mr-3 h-5 w-5" /> Initialize Goal
            </Button>
          </div>
        </div>

        {isViewingAdvice && (
            <Card className="obsidian-card border-indigo-500/30 bg-gradient-to-br from-indigo-900/10 to-transparent animate-in slide-in-from-top-4 duration-500">
                <CardHeader className="p-10 pb-4 border-b border-white/5">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-4 text-white uppercase">
                            <Sparkles className="h-6 w-6 text-indigo-400" /> Strategy Session
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white" onClick={() => setIsViewingAdvice(false)}><X className="h-6 w-6" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    {loadingAdvice ? (
                        <div className="flex items-center gap-5 py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                            <p className="text-xl font-black text-white italic tracking-tighter uppercase">Analyzing portfolio vectors...</p>
                        </div>
                    ) : (
                        <div className="text-lg text-slate-300 leading-relaxed italic font-medium">
                            {advice?.advice || "System is analyzing your 12-month spending pattern to identify optimal liquidity for the next NDIC-insured Fixed Vault cycle. Recommended allocation: ₦250k."}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Savings Goals Column */}
           <div className="lg:col-span-2 space-y-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Capital Nodes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {goals?.length > 0 ? (
                    goals.map((goal: any) => (
                        <Card key={goal.id} className="obsidian-card border-none hover:-translate-y-2 transition-all duration-700 group cursor-pointer overflow-hidden h-[340px] flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="p-8 pb-4 relative z-10">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1 font-black text-[9px] uppercase tracking-widest rounded-lg">{goal.savings_type}</Badge>
                                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Target className="h-5 w-5" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase mt-4">{goal.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-end relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                                            <span className="text-slate-500 italic">Saturation</span>
                                            <span className="text-indigo-400">{Math.round((parseFloat(goal.current_balance) / parseFloat(goal.target_amount)) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className="bg-indigo-600 h-full transition-all duration-[2000ms] shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                                                style={{ width: `${(parseFloat(goal.current_balance) / parseFloat(goal.target_amount)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Balance</p>
                                            <p className="text-2xl font-black text-white italic tracking-tighter">₦{parseFloat(goal.current_balance).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Target</p>
                                            <p className="text-lg font-black text-slate-300 italic tracking-tighter opacity-60">₦{parseFloat(goal.target_amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 py-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center relative z-10">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Ends: {new Date(goal.target_date).toLocaleDateString()}</span>
                                <Button size="sm" variant="ghost" className="h-9 px-5 rounded-xl text-indigo-400 font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/5 hover:text-white transition-all">Top Up</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="md:col-span-2 py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                        <PiggyBank className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
                        <h4 className="text-2xl font-black text-slate-700 italic uppercase tracking-tighter">Vault Empty</h4>
                        <p className="text-sm text-slate-500 font-bold mt-3 uppercase tracking-widest opacity-60 max-w-xs mx-auto">Establish a new accumulation node to begin capital growth.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Market Sidebar */}
           <div className="space-y-12">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Market Vectors</h3>
              <Card className="bg-slate-900 border-none shadow-2xl rounded-[40px] overflow-hidden relative group">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-900/10" />
                 <CardHeader className="p-10 relative z-10 text-center">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-black text-[9px] uppercase tracking-widest w-fit mb-6 mx-auto">SOVEREIGN YIELD</Badge>
                    <CardTitle className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Fixed Vault</CardTitle>
                    <h3 className="text-6xl font-black text-white tracking-tighter italic leading-none mt-8">15.5% <span className="text-xl font-black text-slate-500 uppercase italic">P.A.</span></h3>
                 </CardHeader>
                 <CardContent className="p-10 pt-0 relative z-10">
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4 text-xs font-black text-slate-300 uppercase tracking-tighter italic">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> ₦100,000 Min Entry
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black text-slate-300 uppercase tracking-tighter italic">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 30 - 365 Days Tenor
                        </div>
                    </div>
                 </CardContent>
                 <CardFooter className="p-10 pt-0 relative z-10">
                    <Button className="w-full bg-white text-black hover:bg-slate-200 rounded-[28px] h-16 font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 border-none italic">Secure Capital</Button>
                 </CardFooter>
              </Card>

              <Card className="obsidian-card border-indigo-500/10 p-8 flex flex-col justify-between h-[280px] group">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                            <Info className="h-6 w-6" />
                        </div>
                        <Zap className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-white uppercase italic tracking-widest">Sentinel Insight</p>
                        <p className="text-[13px] text-slate-400 leading-relaxed font-medium mt-3 italic">
                            "NDIC has increased liquidity coverage. Your capital is 100% risk-free up to ₦5M per node."
                        </p>
                    </div>
                </div>
              </Card>
           </div>
        </div>

        {/* Create Modal */}
        {isCreatingGoal && (
             <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
                <Card className="w-full max-w-xl obsidian-card border-indigo-500/20 overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.1)]">
                    <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                            <PiggyBank className="h-24 w-24" />
                        </div>
                        <CardTitle className="text-4xl font-black italic tracking-tighter text-white uppercase">Initialize Node</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4 italic">Provisioning Accumulation Protocol</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 space-y-10">
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Node Narrative</Label>
                            <Input placeholder="e.g. Real Estate Accumulator" className="h-20 rounded-[32px] bg-white/5 border-white/5 px-10 font-black text-2xl text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all uppercase italic" value={goalData.name} onChange={e => setGoalData({...goalData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target (₦)</Label>
                                <Input type="number" placeholder="5,000,000" className="h-20 rounded-[32px] bg-white/5 border-white/5 px-10 font-black text-2xl text-emerald-400 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all" value={goalData.target_amount} onChange={e => setGoalData({...goalData, target_amount: e.target.value})} />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maturity Date</Label>
                                <Input type="date" className="h-20 rounded-[32px] bg-white/5 border-white/5 px-10 font-black text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all text-xs" value={goalData.target_date} onChange={e => setGoalData({...goalData, target_date: e.target.value})} />
                            </div>
                        </div>
                        <div className="pt-10 flex gap-6">
                            <Button variant="ghost" className="flex-1 h-20 rounded-[32px] font-black text-[11px] uppercase tracking-widest text-slate-600 hover:text-white" onClick={() => setIsRegistering(false)}>Abort</Button>
                            <Button className="flex-[2] bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none" onClick={() => createGoalMutation.mutate(goalData)} disabled={createGoalMutation.isPending}>
                                {createGoalMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                                ACTIVATE
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}
    </div>
  );
};

export default SavingsInvestments;
