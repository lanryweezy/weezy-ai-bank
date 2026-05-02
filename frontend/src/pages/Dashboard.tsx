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
  AlertCircle
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
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.full_name || user.username || 'User');
    }
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Hello, {userName.split(' ')[0]}! <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-500/10" />
            </h1>
            <p className="text-slate-500 font-medium">Here's what's happening in your bank today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsTransferModalOpen(true)} className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-bold transition-all active:scale-95">
              <ArrowUpRight className="mr-2 h-4 w-4" /> Send Money
            </Button>
            <Button onClick={() => navigate('/cognitive-core')} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-bold transition-all active:scale-95 text-white">
              <Brain className="mr-2 h-4 w-4" /> Command AI
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
            { label: 'System Balance', value: '₦4.2M', sub: 'Total Vault', icon: Wallet, color: 'indigo' },
            { label: 'Transaction Vol.', value: txnSummary?.total_transactions || 0, sub: 'Last 24 hours', icon: Activity, color: 'orange' },
            { label: 'AI Approval Rate', value: '98.2%', sub: 'Autonomous actions', icon: ShieldCheck, color: 'emerald' },
            { label: 'Active Tasks', value: tasks?.length || 0, sub: 'Needs attention', icon: ListChecks, color: 'blue' },
          ].map((stat, i) => (
            <Card key={i} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-none ring-1 ring-slate-200/60 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <stat.icon className="h-24 w-24" />
                </div>
                <CardContent className="pt-8">
                    <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                        {loadingTxns || loadingTasks ? <Skeleton className="h-9 w-20" /> : stat.value}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{stat.sub}</p>
                </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black text-slate-900">Recent Transactions</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Real-time ledger updates across all channels.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl">
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-1">
                  {loadingRecentTxns ? (
                    [1, 2, 3, 4, 5].map(i => <div key={i} className="py-4 border-b border-slate-50"><Skeleton className="h-14 w-full rounded-2xl" /></div>)
                  ) : recentTransactions?.length > 0 ? (
                    recentTransactions.map((txn: any) => (
                      <div key={txn.id} className="group flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-2xl transition-colors cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${txn.transaction_type === 'TRANSFER' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                            {txn.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{txn.narration || 'Banking Transaction'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(txn.initiated_at), 'MMM dd • HH:mm')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">₦{parseFloat(txn.amount).toLocaleString()}</p>
                          <Badge className={`mt-1 border shadow-none text-[9px] font-black uppercase tracking-widest ${getStatusColor(txn.status)}`}>
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
                        <p className="text-slate-500 font-bold">No recent transactions</p>
                        <p className="text-xs text-slate-400 mt-1">Start transacting to see activity here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none ring-1 ring-slate-200/60 shadow-sm overflow-hidden rounded-3xl bg-white">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2"><TrendingUp className="h-6 w-6 text-indigo-600" /> Platform Throughput</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Automated vs Manual task execution trend</CardDescription>
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
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
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

            <Card className="border-none shadow-xl ring-1 ring-indigo-500/20 bg-gradient-to-br from-indigo-600 to-blue-800 text-white rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain className="h-32 w-32" />
                </div>
                <CardHeader className="relative z-10 pt-8 px-8">
                    <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2">
                        <Sparkles className="h-5 w-5 text-indigo-100" />
                    </div>
                    <CardTitle className="text-xl font-black">AI Vault Guard</CardTitle>
                    <CardDescription className="text-indigo-100 font-medium opacity-80">Real-time security analysis.</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                    <div className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">System Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                <p className="text-sm font-bold">Secure & Compliant</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full bg-white text-indigo-900 border-none font-black rounded-2xl h-12 hover:bg-indigo-50 transition-all active:scale-95" onClick={() => navigate('/fraud-shield')}>
                            Open Fraud Shield
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white overflow-hidden">
              <CardHeader className="px-8 pt-8">
                <CardTitle className="text-lg font-black text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-8">
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: 'Issue Card', icon: CreditCard, color: 'emerald', path: '/card-center' },
                        { label: 'Add Agent', icon: Users, color: 'blue', path: '/agent-banking' },
                        { label: 'FX Swap', icon: TrendingUp, color: 'orange', path: '/fx-global' },
                        { label: 'Bills', icon: Zap, color: 'indigo', path: '/bills' },
                    ].map((act, i) => (
                        <button key={i} onClick={() => navigate(act.path)} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 transition-all group active:scale-95">
                            <div className={`w-10 h-10 bg-${act.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <act.icon className={`h-5 w-5 text-${act.color}-600`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{act.label}</span>
                        </button>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white overflow-hidden">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-lg font-black text-slate-900">System Logs</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Interest accrual batch completed for 1,240 accounts at 12:00 AM.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">New Agent [WZY-AG-4592] verified and activated in Ikeja, Lagos.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
