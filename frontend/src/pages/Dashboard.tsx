
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListChecks, PlayCircle, Clock, AlertCircle, CheckCircle, ExternalLink, User, Activity, TrendingUp, CreditCard, Landmark, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1000 },
];

import TransferModal from '@/components/TransferModal';

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

  const handleTransferSuccess = () => {
    refetchSummary();
    refetchHistory();
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Welcome back, {userName}! <Sparkles className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-gray-600 mt-1">AI-Powered Banking Operations Dashboard (Nigerian Market)</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsTransferModalOpen(true)} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              <ArrowUpRight className="mr-2 h-4 w-4" /> Send Money
            </Button>
            <Button size="sm" onClick={() => navigate('/workflows')} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <PlayCircle className="mr-2 h-4 w-4" /> Start Workflow
            </Button>
          </div>
        </div>

        <TransferModal 
          isOpen={isTransferModalOpen} 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={handleTransferSuccess}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending Tasks', value: (taskSummary?.counts?.pending || 0), icon: ListChecks, color: 'indigo' },
            { label: 'Txn Volume', value: txnSummary?.total_transactions || 0, icon: Activity, color: 'orange' },
            { label: 'Success Rate', value: txnSummary?.total_transactions > 0 ? `${Math.round((txnSummary?.successful_transactions / txnSummary?.total_transactions) * 100)}%` : '0%', icon: CheckCircle, color: 'green' },
            { label: 'Active Loans', value: '0', icon: Landmark, color: 'blue' },
          ].map((stat, i) => (
            <Card key={i} className="hover:scale-[1.02] transition-all border-none ring-1 ring-gray-200 shadow-sm">
                <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{loadingTxns || loadingTasks ? <Skeleton className="h-8 w-12" /> : stat.value}</h3>
                    </div>
                    <div className={`p-3 bg-${stat.color}-50 rounded-xl`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                </div>
                </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest NIP and Internal transfers across the bank.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingRecentTxns ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)
                  ) : recentTransactions?.length > 0 ? (
                    recentTransactions.map((txn: any) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${txn.status === 'SUCCESSFUL' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Activity className={`h-4 w-4 ${txn.status === 'SUCCESSFUL' ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{txn.narration || 'Transfer'}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(txn.initiated_at), 'MMM dd, HH:mm')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₦{parseFloat(txn.amount).toLocaleString()}</p>
                          <p className={`text-[10px] px-2 py-0.5 rounded-full inline-block ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No recent transactions found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Growth Chart */}
          <Card className="lg:col-span-2 border-none ring-1 ring-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-600" /> Platform Throughput</CardTitle>
              <CardDescription>Automated vs Manual task execution trend</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Task Summary */}
          <Card className="border-none ring-1 ring-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b">
                 <CardTitle className="text-lg font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-green-600"/>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {loadingRuns ? (
                    <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
                    </div>
                ) : recentRuns && recentRuns.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {recentRuns.map(run => (
                        <div key={run.run_id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => navigate(`/workflow-runs/${run.run_id}`)}>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{run.workflow_name}</h4>
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 py-0 ${getStatusColor(run.status)} border-none shadow-none`}>{run.status}</Badge>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span>{run.current_step_name || 'Processing'}</span>
                            <span>{format(new Date(run.start_time), "HH:mm")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                ) : <p className="text-sm text-gray-500 italic p-8 text-center">No activity found.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
