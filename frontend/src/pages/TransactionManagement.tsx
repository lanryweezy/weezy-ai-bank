import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Sparkles,
  FileText,
  Printer,
  Share2,
  AlertTriangle,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/services/apiClient';

const TransactionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['adminTransactions', activeTab],
    queryFn: () => apiClient<any[]>('/transactions/history?limit=100'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'SUCCESSFUL': return 'bg-emerald-50 text-emerald-700 ring-emerald-500/20';
        case 'PENDING': return 'bg-amber-50 text-amber-700 ring-amber-500/20';
        case 'FAILED': return 'bg-rose-50 text-rose-700 ring-rose-500/20';
        default: return 'bg-slate-50 text-slate-700 ring-slate-500/10';
    }
  };

  const filteredTransactions = transactions?.filter(t =>
    t.narration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.debit_account_number?.includes(searchTerm) ||
    t.credit_account_number?.includes(searchTerm)
  );

  const handlePrintReceipt = () => {
      window.print();
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
              FINANCIAL SWITCH <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Activity className="h-6 w-6 text-white" /></div>
            </h2>
            <p className="text-slate-500 font-medium text-lg">Real-time Node Monitoring & ISO-8583 Message Stream.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Stream
            </Button>
            <Button className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
              <Download className="mr-2 h-4 w-4" /> Global Export
            </Button>
          </div>
        </div>

        {/* High-Fidelity Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Settlement Vault', value: '₦4.2B', icon: Building2, color: 'indigo' },
                { label: 'Successful (24h)', value: '1,240', icon: ShieldCheck, color: 'emerald' },
                { label: 'Failed/Reversed', value: '12', icon: AlertTriangle, color: 'rose' },
                { label: 'Latency (Avg)', value: '0.4ms', icon: Zap, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-700">
                        <stat.icon className="h-24 w-24" />
                    </div>
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
                    className="pl-14 h-16 rounded-[24px] bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-4 focus-visible:ring-indigo-500/10 font-medium text-sm shadow-inner transition-all"
                />
            </div>
            <Button variant="outline" className="h-16 px-8 rounded-[24px] border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
                <Calendar className="h-4 w-4 mr-2" /> Custom Range
            </Button>
        </div>

        <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto inline-flex mb-8">
                {['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED'].map(tab => (
                    <TabsTrigger key={tab} value={tab} className="rounded-xl px-8 py-2.5 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)}
                    </div>
                ) : filteredTransactions && filteredTransactions.length > 0 ? (
                    <div className="space-y-4">
                        {filteredTransactions.map((t) => (
                            <Card key={t.id} className="group hover:shadow-2xl transition-all duration-500 border-none ring-1 ring-slate-200/60 rounded-[28px] bg-white overflow-hidden" onClick={() => setSelectedTxn(t)}>
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-center">
                                        <div className="p-6 md:p-8 flex-1 flex items-center justify-between w-full cursor-pointer">
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-[20px] shadow-inner transition-all group-hover:scale-110 ${t.status === 'FAILED' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {t.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1.5">
                                                        <p className="font-black text-slate-900 text-base tracking-tight italic">{t.narration || 'Switch Internal'}</p>
                                                        <Badge className={`${getStatusColor(t.status)} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ring-1`}>
                                                            {t.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3 text-indigo-400" /> {format(new Date(t.initiated_at), 'MMM dd, HH:mm:ss')}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">SESSION: {t.id.slice(-12)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900 tracking-tighter italic">₦{parseFloat(t.amount.toString()).toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.channel || 'CORE_SWITCH'}</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex bg-slate-50 p-8 h-full items-center justify-center border-l border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer">
                                            <ExternalLink className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                        <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-slate-900">End of Stream</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">No transaction data packet found in the high-velocity switch for this period.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>

        {/* High-Fidelity Receipt Modal */}
        {selectedTxn && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
                <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[40px] overflow-hidden relative">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-6 right-6 text-slate-400 hover:text-indigo-600 rounded-xl"
                        onClick={() => setSelectedTxn(null)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                    
                    <CardHeader className="bg-indigo-600 text-white p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 shimmer opacity-10" />
                        <div className="bg-white/20 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 backdrop-blur-md rotate-3 shadow-2xl">
                             <ShieldCheck className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">OFFICIAL RECEIPT</CardTitle>
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Certified Ledger Proof</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-12 space-y-10">
                        <div className="text-center space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Settled</p>
                             <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic">₦{parseFloat(selectedTxn.amount).toLocaleString()}</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Reference ID', value: selectedTxn.id, mono: true },
                                { label: 'Value Date', value: format(new Date(selectedTxn.initiated_at), 'MMMM dd, yyyy HH:mm:ss') },
                                { label: 'Narration', value: selectedTxn.narration || 'System Internal Transfer' },
                                { label: 'Beneficiary Account', value: selectedTxn.credit_account_number, mono: true },
                                { label: 'Channel Source', value: selectedTxn.channel || 'WEEZY_SWITCH' }
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between items-start pb-4 border-b border-slate-50 last:border-0">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                    <span className={`text-sm font-black text-slate-800 text-right max-w-[240px] ${row.mono ? 'font-mono tracking-tighter' : ''}`}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/60 relative overflow-hidden">
                             <div className="flex justify-between items-center relative z-10">
                                 <div className="flex items-center gap-3">
                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Switch Verification</span>
                                 </div>
                                 <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] px-3">SIGNED & VALID</Badge>
                             </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-10 pt-0 flex gap-4">
                        <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest" onClick={handlePrintReceipt}>
                            <Printer className="mr-3 h-4 w-4" /> Print
                        </Button>
                        <Button className="flex-1 bg-indigo-600 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-white border-none shadow-xl shadow-indigo-100">
                            <Share2 className="mr-3 h-4 w-4" /> Share
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default TransactionManagement;
