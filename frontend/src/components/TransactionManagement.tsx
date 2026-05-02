import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  ExternalLink,
  Calendar,
  CreditCard,
  Building2,
  Smartphone,
  Zap,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  narration: string;
  status: string;
  channel: string;
  initiated_at: string;
  debit_account_number: string;
  credit_account_number: string;
  currency: string;
}

const TransactionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['adminTransactions', activeTab],
    queryFn: () => apiClient<Transaction[]>('/transactions/history?limit=100'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'SUCCESSFUL': return 'bg-emerald-50 text-emerald-700';
        case 'PENDING': return 'bg-amber-50 text-amber-700';
        case 'FAILED': return 'bg-rose-50 text-rose-700';
        default: return 'bg-slate-50 text-slate-700';
    }
  };

  const filteredTransactions = transactions?.filter(t =>
    t.narration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.debit_account_number?.includes(searchTerm) ||
    t.credit_account_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
            FINANCIAL SWITCH <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Activity className="h-6 w-6 text-white" /></div>
          </h2>
          <p className="text-slate-500 font-medium">Real-time monitoring of all movement across the high-performance switch.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Sync Stream
          </Button>
          <Button className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Download className="mr-2 h-4 w-4" /> Export ISO-8583
          </Button>
        </div>
      </div>

      {/* Switch Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Settlement Vault', value: '₦4.2B', icon: Building2, color: 'indigo' },
            { label: 'Successful (24h)', value: '1,240', icon: ShieldCheck, color: 'emerald' },
            { label: 'Failed/Reversed', value: '12', icon: AlertTriangle, color: 'rose' },
            { label: 'Switch Uptime', value: '99.99%', icon: Activity, color: 'blue' },
        ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search by session ID, narration, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 rounded-[24px] bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-medium text-sm shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-16 px-8 rounded-[24px] border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
          <Calendar className="h-4 w-4 mr-2" /> Custom Range
        </Button>
      </div>

      <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto inline-flex">
          {['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="rounded-xl px-6 py-2.5 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                {tab}
              </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((t) => (
                <Card key={t.id} className="group hover:shadow-2xl transition-all duration-500 border-none ring-1 ring-slate-200/60 rounded-[28px] bg-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="p-6 md:p-8 flex-1 flex items-center justify-between w-full">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-[20px] bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                    {t.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-black text-slate-900 text-base tracking-tight">{t.narration || 'Switch Processing'}</p>
                                        {getStatusBadge(t.status)}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {format(new Date(t.initiated_at), 'MMM dd, HH:mm:ss')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">ID: {t.id.slice(-12)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-slate-900 tracking-tighter">₦{parseFloat(t.amount.toString()).toLocaleString()}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.channel || 'SYSTEM'}</p>
                            </div>
                        </div>
                        <div className="hidden md:flex bg-slate-50 p-8 h-full items-center justify-center border-l border-slate-100 group-hover:bg-indigo-50 transition-all">
                             <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-600 rounded-xl">
                                <ExternalLink className="h-5 w-5" />
                             </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
              <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h4 className="text-lg font-black text-slate-900">No Stream Activity</h4>
              <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">The switch is idle. No transactions matched your current search filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'SUCCESSFUL': return <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 text-[8px] font-black uppercase tracking-widest">Successful</Badge>;
        case 'PENDING': return <Badge className="bg-amber-50 text-amber-700 border-none px-2 text-[8px] font-black uppercase tracking-widest">Settling</Badge>;
        case 'FAILED': return <Badge className="bg-rose-50 text-rose-700 border-none px-2 text-[8px] font-black uppercase tracking-widest">Failed</Badge>;
        default: return <Badge variant="outline" className="text-[8px] font-black uppercase">{status}</Badge>;
    }
};

export default TransactionManagement;
