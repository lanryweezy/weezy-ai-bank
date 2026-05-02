import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Target, TrendingUp, ArrowUpRight, Plus, Brain, Info, Loader2, CheckCircle2 } from 'lucide-react';
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

  const { data: advice, isLoading: loadingAdvice, refetch: refetchAdvice } = useQuery({
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
      toast.success('Savings Goal created! Start saving now.');
      setIsRegistering(false);
      refetchGoals();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create goal'),
  });

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Wealth & Savings <PiggyBank className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">High-yield savings and automated investment plans for your future.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsViewingAdvice(true)} variant="outline" className="border-indigo-200 text-indigo-600">
                <Brain className="mr-2 h-4 w-4" /> AI Advisor
            </Button>
            <Button onClick={() => setIsRegistering(true)} className="bg-indigo-600">
                <Plus className="mr-2 h-4 w-4" /> New Goal
            </Button>
          </div>
        </div>

        {isViewingAdvice && (
            <Card className="border-none shadow-xl ring-1 ring-indigo-200 bg-indigo-50/50">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
                            <Brain className="h-5 w-5" /> Personalized Investment Advice
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setIsViewingAdvice(false)}>Close</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingAdvice ? (
                        <div className="flex items-center gap-3 py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                            <p className="text-sm italic text-indigo-700">Weezy is analyzing your portfolio...</p>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {advice?.advice}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Savings Goals Column */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Savings Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals?.length > 0 ? (
                    goals.map((goal: any) => (
                        <Card key={goal.id} className="border-none shadow-sm ring-1 ring-gray-200 hover:scale-[1.02] transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-none text-[10px]">{goal.savings_type}</Badge>
                                    <div className="bg-green-100 p-1.5 rounded-full">
                                        <Target className="h-3 w-3 text-green-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-md mt-2">{goal.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="font-bold text-indigo-600">{Math.round((parseFloat(goal.current_balance) / parseFloat(goal.target_amount)) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-indigo-600 h-full transition-all duration-1000" 
                                                style={{ width: `${(parseFloat(goal.current_balance) / parseFloat(goal.target_amount)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase">Balance</p>
                                            <p className="text-lg font-bold">₦{parseFloat(goal.current_balance).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase">Target</p>
                                            <p className="text-sm font-semibold text-gray-600">₦{parseFloat(goal.target_amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t py-2 flex justify-between">
                                <span className="text-[10px] text-gray-500 italic">Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-600">Top Up</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="md:col-span-2 py-20 text-center border-2 border-dashed rounded-3xl bg-gray-50/50">
                        <PiggyBank className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 italic">No active savings goals. Plan for your future today.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Investment Products Column */}
           <div className="space-y-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Featured Products</h3>
              <Card className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white border-none shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp className="h-24 w-24" />
                 </div>
                 <CardHeader>
                    <CardTitle className="text-lg">Fixed Deposit</CardTitle>
                    <CardDescription className="text-teal-100 text-xs">Locked returns for guaranteed growth.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="mb-6">
                        <p className="text-[10px] text-teal-200 uppercase tracking-widest">Interest Rate</p>
                        <h3 className="text-4xl font-bold mt-1">15.5% <span className="text-sm font-normal text-teal-300">P.A.</span></h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-teal-300" /> ₦10,000 Minimum
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-teal-300" /> Flexible Tenure (30 - 365 Days)
                        </div>
                    </div>
                 </CardContent>
                 <CardFooter className="pt-2">
                    <Button className="w-full bg-white text-teal-900 hover:bg-teal-50 border-none font-bold">Invest Now</Button>
                 </CardFooter>
              </Card>

              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" /> Did you know?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                        Nigerian Treasury Bills are backed by the Federal Government, making them one of the safest ways to grow your Naira wealth. Current rates range from 12% to 18%.
                    </p>
                </CardContent>
              </Card>
           </div>
        </div>

        {/* Create Goal Modal Placeholder */}
        {isCreatingGoal && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle>Create Savings Goal</CardTitle>
                        <CardDescription>What are you saving for?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Goal Name</Label>
                            <Input placeholder="e.g. New Laptop, Rent, Christmas" value={goalData.name} onChange={e => setGoalData({...goalData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Amount (₦)</Label>
                                <Input type="number" placeholder="50,000" value={goalData.target_amount} onChange={e => setGoalData({...goalData, target_amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Date</Label>
                                <Input type="date" value={goalData.target_date} onChange={e => setGoalData({...goalData, target_date: e.target.value})} />
                            </div>
                        </div>
                        <div className="pt-4 flex gap-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsRegistering(false)}>Cancel</Button>
                            <Button className="flex-[2] bg-indigo-600" onClick={() => createGoalMutation.mutate(goalData)} disabled={createGoalMutation.isPending}>
                                {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default SavingsInvestments;
