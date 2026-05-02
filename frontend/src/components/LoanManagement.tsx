import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Landmark,
  FileText,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Database
} from 'lucide-react';
import AddLoanModal from './AddLoanModal';
import { format } from 'date-fns';

interface LoanProduct {
    loan_product_id: string;
    product_name: string;
    min_amount: number;
    max_amount: number;
    interest_rate_min: number;
}

const LoanManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('portfolio');

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['loanProducts'],
    queryFn: () => apiClient<LoanProduct[]>('/loans/products'),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
            ASSET PORTFOLIO <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Landmark className="h-6 w-6 text-white" /></div>
          </h2>
          <p className="text-slate-500 font-medium">Yield Governance & Enterprise Credit Management Core.</p>
        </div>
        <AddLoanModal onLoanAdded={() => queryClient.invalidateQueries({ queryKey: ['loanApplications'] })} />
      </div>

      {/* High-Fidelity Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Portfolio', value: '₦2.4B', sub: 'Gross Assets', icon: Landmark, color: 'indigo' },
          { label: 'Active Loans', value: '1,284', sub: 'Servicing', icon: FileText, color: 'blue' },
          { label: 'Approval Rate', value: '86.5%', sub: 'AI Efficiency', icon: CheckCircle, color: 'emerald' },
          { label: 'NPL Ratio', value: '1.8%', sub: 'Risk Threshold', icon: AlertCircle, color: 'rose' },
        ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                    <stat.icon className="h-24 w-24" />
                </div>
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{stat.sub}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Tabs defaultValue="portfolio" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto inline-flex mb-10">
          {['Portfolio', 'Credit Products', 'Review Queue'].map(tab => (
              <TabsTrigger key={tab} value={tab.toLowerCase().replace(' ', '')} className="rounded-xl px-8 py-2.5 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                {tab}
              </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="portfolio" className="mt-0 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                  <CardTitle className="text-xl font-black text-slate-900 italic tracking-tighter flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" /> CONCENTRATION RISK
                  </CardTitle>
                  <CardDescription className="font-medium mt-1">Asset distribution by standardized credit sector.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  {[
                    { label: 'Mortgages', amount: '₦1.2B', percentage: 50, color: 'bg-indigo-600 shadow-indigo-100' },
                    { label: 'SME Loans', amount: '₦600M', percentage: 25, color: 'bg-blue-500 shadow-blue-100' },
                    { label: 'Personal Loans', amount: '₦400M', percentage: 15, color: 'bg-emerald-500 shadow-emerald-100' },
                    { label: 'Auto Loans', amount: '₦200M', percentage: 10, color: 'bg-rose-500 shadow-rose-100' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="font-black text-slate-800 text-sm tracking-tight">{item.label}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.amount} • {item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
                <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-32 w-32" />
                    </div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="relative z-10 p-8 pb-4">
                        <CardTitle className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                           <Activity className="h-3 w-3" /> Underwriting Pulse
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 p-8 pt-0">
                        <h3 className="text-2xl font-black italic tracking-tighter leading-tight">AI Autonomous Approval is Active</h3>
                        <p className="text-slate-400 mt-4 text-xs leading-relaxed font-medium">
                            Weezy Prime is currently assessing 42 credit applications using real-time cashflow telemetry.
                        </p>
                        <div className="mt-8 space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Turnaround Time</span>
                                <span className="text-xs font-mono font-black text-indigo-400">4.2m</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Score Accuracy</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">96%</Badge>
                            </div>
                        </div>
                        <Button className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 text-white border-none font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                            View Risk Insights
                        </Button>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <Sparkles className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Yield Tuning
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "Market rates for SME loans in Nigeria have risen by 1.5%. We recommend adjusting Personal Loan interest tiers to 16.5% to maintain portfolio alpha."
                    </p>
                </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="creditproducts" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingProducts ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[32px]" />)
            ) : products?.map((p) => (
              <Card key={p.loan_product_id} className="group hover:shadow-2xl transition-all duration-500 border-none ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8 pb-10 border-b border-slate-50">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-lg">LIVE NODE</Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{p.product_name}</CardTitle>
                  <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">{p.loan_product_id}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Base Yield</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{(p.interest_rate_min * 100).toFixed(1)}% <span className="text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">p.a</span></span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Min Principal</p>
                        <p className="font-black text-slate-700">{formatCurrency(p.min_amount)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Max Capacity</p>
                        <p className="font-black text-slate-700">{formatCurrency(p.max_amount)}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white border-none shadow-none font-black text-[10px] uppercase tracking-widest h-12 rounded-xl transition-all">
                    Edit Configuration <ChevronRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <button onClick={() => {}} className="border-4 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center p-12 hover:bg-slate-50 hover:border-indigo-200 transition-all group">
                <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-slate-300 group-hover:text-indigo-600" />
                </div>
                <p className="text-sm font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest">New Credit Plan</p>
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanManagement;
