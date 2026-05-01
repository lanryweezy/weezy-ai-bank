
import React, { useState, useEffect } from 'react';
import GenericCard from './GenericCard';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Smartphone,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface Transaction {
  transaction_id: string;
  reference_number: string;
  amount: number;
  description: string;
  status: string;
  type_name: string;
  is_debit: boolean;
  created_at: string;
  account_number: string;
  customer_name: string;
}

const TransactionManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', activeTab],
    queryFn: () => apiClient<Transaction[]>('/accounts/transactions'),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions?.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.account_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h2>
          <p className="text-gray-500 mt-1">Monitor and manage all financial movements across the bank.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Volume</p>
                <h3 className="text-2xl font-bold mt-1">₦1.2B</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Add more stats cards as needed */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by reference, description, or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" className="h-11">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100/50 p-1">
          <TabsTrigger value="all">All History</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTransactions.map((t) => (
                    <tr key={t.transaction_id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${t.is_debit ? 'bg-red-50' : 'bg-green-50'}`}>
                            {t.is_debit ? <ArrowUpRight className="h-4 w-4 text-red-600" /> : <ArrowDownLeft className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{t.description}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{t.reference_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{t.customer_name}</p>
                        <p className="text-xs text-gray-400">{t.account_number}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`text-sm font-bold ${t.is_debit ? 'text-gray-900' : 'text-green-600'}`}>
                          {t.is_debit ? '-' : '+'}{formatCurrency(t.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={`${getStatusColor(t.status)} shadow-none border-none`}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(t.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl ring-1 ring-gray-200">
              <Activity className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No transactions found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionManagement;
