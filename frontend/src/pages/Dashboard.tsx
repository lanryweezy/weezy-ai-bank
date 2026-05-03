import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Landmark, 
  ListChecks, 
  PlayCircle, 
  Sparkles, 
  TrendingUp, 
  Users,
  Wallet,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  Brain,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TransferModal from '@/components/TransferModal';

const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1000 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.full_name || user.username || 'User');
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const { data: txnSummary, isLoading: loadingTxns, refetch: refetchSummary } = useQuery({
    queryKey: ['txnSummary'],
    queryFn: () => apiClient('/transactions/summary'),
    refetchInterval: 15000,
  });

  const { data: recentTransactions, isLoading: loadingRecentTxns, refetch: refetchHistory } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => apiClient('/transactions/history?limit=5'),
    refetchInterval: 15000,
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => apiClient('/admin/dual-control/requests/pending'),
    refetchInterval: 30000,
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['taskSummary'],
    queryFn: () => apiClient('/tasks/me'),
    refetchInterval: 30000,
  });

  const handleTransferSuccess = () => {
    refetchSummary();
    refetchHistory();
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'SUCCESSFUL': case 'COMPLETED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'PROCESSING': case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'FAILED': return 'text-rose-600 bg-rose-50 border-rose-100';
        default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Live • 0.4ms Latency</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                {greeting.toUpperCase()}, {userName.split(' ')[0].toUpperCase()} <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-500/10 animate-pulse" />
            </h1>
            <p className="text-slate-500 font-medium text-lg">Your cognitive banking cockpit is ready for instructions.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsTransferModalOpen(true)} className="rounded-2xl h-14 px-8 border-slate-200 hover:bg-slate-50 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm">
              <ArrowUpRight className="mr-3 h-5 w-5" /> Send Money
            </Button>
            <Button onClick={() => navigate('/cognitive-core')} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
              <Brain className="mr-3 h-5 w-5" /> Command Prime
            </Button>
          </div>
        </div>

        <TransferModal 
          isOpen={isTransferModalOpen} 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={handleTransferSuccess}
        />

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Liquidity', value: '₦4.2M', sub: 'Aggregated Vault', icon: Wallet, color: 'indigo' },
            { label: 'Switch Throughput', value: txnSummary?.total_transactions || 0, sub: 'Daily Vol.', icon: Activity, color: 'orange' },
            { label: 'Autonomous Rate', value: '98.2%', sub: 'AI Approval', icon: ShieldCheck, color: 'emerald' },
            { label: 'Operational Tasks', value: tasks?.length || 0, sub: 'Needs Attention', icon: ListChecks, color: 'blue' },
          ].map((stat, i) => (
            <Card key={i} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none ring-1 ring-slate-200/60 overflow-hidden relative rounded-[32px] bg-white">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity group-hover:scale-110 duration-700">
                    <stat.icon className="h-28 w-28" />
                </div>
                <CardContent className="pt-10">
                    <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all duration-500 shadow-inner`}>
                        <stat.icon className="h-7 w-7" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter italic">
                        {loadingTxns || loadingTasks ? <Skeleton className="h-9 w-20" /> : stat.value}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{stat.sub}</p>
                </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black text-slate-900 italic tracking-tighter">LEDGER ACTIVITY</CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-1">Real-time throughput across all switch channels.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest rounded-xl">
                    Full History <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-1">
                  {loadingRecentTxns ? (
                    [1, 2, 3, 4, 5].map(i => <div key={i} className="py-4 border-b border-slate-50"><Skeleton className="h-14 w-full rounded-2xl" /></div>)
                  ) : recentTransactions?.length > 0 ? (
                    recentTransactions.map((txn: any) => (
                      <div key={txn.id} className="group flex items-center justify-between py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-2xl transition-colors cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner ${txn.transaction_type === 'TRANSFER' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                            {txn.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">{txn.narration || 'Switch Internal'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[8px] font-black tracking-tighter border-slate-200 text-slate-400">{txn.channel || 'SYSTEM'}</Badge>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(txn.initiated_at), 'MMM dd • HH:mm')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg tracking-tighter">₦{parseFloat(txn.amount).toLocaleString()}</p>
                          <Badge className={`mt-1 border-none shadow-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <Activity className="h-10 w-10 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Stream Activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none ring-1 ring-slate-200/60 shadow-sm overflow-hidden rounded-[32px] bg-white">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="text-xl font-black text-slate-900 italic tracking-tighter flex items-center gap-3"><TrendingUp className="h-6 w-6 text-indigo-600" /> THROUGHPUT TREND</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Daily automated transaction volume velocity.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-4">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
            </Card>
          </div>

          {/* AI Insights & Quick Links */}
          <div className="space-y-6">
            {pendingApprovals?.length > 0 && (
                <Card className="border-none shadow-2xl ring-2 ring-rose-500/20 bg-rose-50 rounded-3xl overflow-hidden animate-bounce">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-700 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> Governance Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-black text-rose-900">
                            {pendingApprovals.length} Requests Awaiting Review
                        </p>
                        <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase text-rose-600 mt-2" onClick={() => navigate('/checker')}>
                            Authorize Now →
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-xl ring-1 ring-indigo-500/20 bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Brain className="h-32 w-32 text-indigo-400" />
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <CardHeader className="relative z-10 pt-8 px-8">
                    <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-indigo-400" />
                    </div>
                    <CardTitle className="text-2xl font-black italic tracking-tighter">AI VAULT GUARD</CardTitle>
                    <CardDescription className="text-slate-400 font-medium mt-1">Surveillance Core is Online.</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="space-y-4">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Integrity Status</p>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <p className="text-sm font-black italic">Fully Compliant</p>
                            </div>
                        </div>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95" onClick={() => navigate('/fraud-shield')}>
                            Launch Risk Control
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Tactical Links</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-8">
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: 'Issue Card', icon: CreditCard, color: 'emerald', path: '/card-center' },
                        { label: 'Add Agent', icon: Users, color: 'blue', path: '/agent-banking' },
                        { label: 'FX Swap', icon: TrendingUp, color: 'orange', path: '/fx-global' },
                        { label: 'Bills Hub', icon: Zap, color: 'indigo', path: '/bills' },
                    ].map((act, i) => (
                        <button key={i} onClick={() => navigate(act.path)} className="flex flex-col items-center gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-all group active:scale-95">
                            <div className={`w-12 h-12 bg-${act.color}-50 rounded-2xl flex items-center justify-center group-hover:bg-${act.color}-600 group-hover:text-white transition-all duration-300 shadow-inner`}>
                                <act.icon className="h-6 w-6" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{act.label}</span>
                        </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Intelligence Stream</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="space-y-6">
                        <div className="flex gap-4 animate-in slide-in-from-right duration-1000">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-sm" />
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Interest accrual batch completed for 1,240 accounts at 12:00 AM.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm" />
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">New Agent [WZY-AG-4592] verified and activated in Ikeja, Lagos.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-sm" />
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Elevated risk detected on Transaction [WZY-TX-882]. Sent to Risk Shield.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                <RefreshCw className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="h-3 w-3" /> System Heartbeat
                </h4>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-bold">Ledger Sync</span>
                        <span className="text-emerald-600 font-black">99.9%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '99.9%' }} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
