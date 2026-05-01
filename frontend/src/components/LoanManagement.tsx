
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
  AlertCircle
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Loans & Credit</h2>
          <p className="text-gray-500 mt-1">Manage credit products, applications, and portfolio risk.</p>
        </div>
        <AddLoanModal onLoanAdded={() => queryClient.invalidateQueries({ queryKey: ['loanApplications'] })} />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio', value: '₦2.4B', icon: Landmark, color: 'indigo', trend: '+5.2%' },
          { label: 'Active Loans', value: '1,284', icon: FileText, color: 'blue', trend: '+12' },
          { label: 'Approval Rate', value: '86.5%', icon: CheckCircle, color: 'green', trend: '+2.1%' },
          { label: 'At Risk (NPL)', value: '1.8%', icon: AlertCircle, color: 'red', trend: '-0.1%' },
        ].map((stat, i) => (
          <Card key={i} className="border-none ring-1 ring-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</h3>
                  <p className={`text-xs mt-1 font-medium ${stat.color === 'red' ? 'text-red-500' : 'text-green-500'}`}>{stat.trend}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-50 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="portfolio" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100/50 p-1 mb-8">
          <TabsTrigger value="portfolio" className="flex items-center gap-2 px-6">Portfolio</TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2 px-6">Credit Products</TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2 px-6">Review Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none ring-1 ring-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Portfolio Concentration</CardTitle>
                  <CardDescription>Asset distribution by loan type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Mortgages', amount: '₦1.2B', percentage: 50, color: 'bg-indigo-600' },
                    { label: 'SME Loans', amount: '₦600M', percentage: 25, color: 'bg-blue-500' },
                    { label: 'Personal Loans', amount: '₦400M', percentage: 15, color: 'bg-green-500' },
                    { label: 'Auto Loans', amount: '₦200M', percentage: 10, color: 'bg-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">{item.label}</span>
                        <span className="text-gray-500">{item.amount} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className={`h-1.5 ${item.color}`} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-indigo-900 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <ShieldCheck className="h-24 w-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-indigo-200 text-sm font-bold uppercase tracking-wider">AI Underwriting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-xl font-bold">Automated Credit Scoring is Active</h3>
                        <p className="text-indigo-300 mt-2 text-xs leading-relaxed">
                            Our AI agents are currently processing applications with an average turnaround time of 4.2 minutes.
                        </p>
                        <Button className="w-full mt-6 bg-white text-indigo-900 hover:bg-indigo-50 border-none font-bold">
                            View AI Insights
                        </Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingProducts ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
            ) : products?.map((p) => (
              <Card key={p.loan_product_id} className="group hover:shadow-lg transition-all border-none ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-8">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CreditCard className="h-5 w-5 text-indigo-600" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-none shadow-none font-bold">ACTIVE</Badge>
                  </div>
                  <CardTitle className="mt-4 text-xl">{p.product_name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Interest Rate</span>
                    <span className="text-xl font-black text-gray-900">{(p.interest_rate_min * 100).toFixed(1)}% <span className="text-xs font-medium text-gray-400">p.a</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Min Amount</span>
                    <span className="font-bold">{formatCurrency(p.min_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max Amount</span>
                    <span className="font-bold">{formatCurrency(p.max_amount)}</span>
                  </div>
                  <Button className="w-full mt-4 bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border-none shadow-none font-bold">
                    Edit Product Configuration
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanManagement;
