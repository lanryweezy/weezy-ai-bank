
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Landmark,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  Smartphone,
  Wallet
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';

const CustomerPortal: React.FC = () => {
  const { data: accounts } = useQuery({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/accounts/my-accounts'), // Need to implement this
  });

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency
    }).format(amount);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Portfolio</h1>
            <p className="text-gray-500 mt-1">Manage your accounts and financial products securely.</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-100">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Transfer Money
          </Button>
        </div>

        {/* Quick Balance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-4xl font-bold">₦2,450,000.00</h3>
              <p className="text-indigo-200 mt-2 text-sm flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Account Secured
              </p>
            </CardContent>
          </Card>

          <Card className="border-none ring-1 ring-gray-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Savings (Monthly Growth)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-gray-900">₦120,400.00</h3>
                <span className="text-green-600 text-xs font-bold mb-1">+4.5%</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[65%]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none ring-1 ring-gray-200 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-gray-900">₦850,000.00</h3>
              </div>
              <p className="text-xs text-gray-400 mt-2">Next payment: Nov 15, 2024</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 mb-8 space-x-8">
            <TabsTrigger value="accounts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-4 text-sm font-semibold">My Accounts</TabsTrigger>
            <TabsTrigger value="cards" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-4 text-sm font-semibold">Cards</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-4 text-sm font-semibold">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { type: 'Savings Account', number: '1029384756', balance: 1450000, color: 'indigo' },
                    { type: 'Current Account', number: '9876543210', balance: 1000000, color: 'blue' }
                ].map((acc, i) => (
                    <Card key={i} className="group hover:shadow-md transition-all cursor-pointer border-none ring-1 ring-gray-100">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 bg-${acc.color}-50 rounded-xl`}>
                                    <Landmark className={`h-6 w-6 text-${acc.color}-600`} />
                                </div>
                                <span className="text-xs font-mono text-gray-400">{acc.number}</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">{acc.type}</h4>
                            <h2 className="text-2xl font-black mt-1 text-gray-900">{formatCurrency(acc.balance)}</h2>
                            <div className="flex gap-2 mt-6">
                                <Button variant="secondary" size="sm" className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-none">History</Button>
                                <Button variant="secondary" size="sm" className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-none">Settings</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="cards" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="aspect-[1.58/1] bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <CreditCard className="h-24 w-24" />
                        </div>
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="flex justify-between items-start">
                                <Landmark className="h-8 w-8 text-indigo-400" />
                                <span className="text-xs font-bold tracking-widest">VISA PLATINUM</span>
                            </div>
                            <div>
                                <p className="text-xl font-mono tracking-[0.2em] mb-4">**** **** **** 8842</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Card Holder</p>
                                        <p className="text-sm font-bold">JOHN DOE</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Expires</p>
                                        <p className="text-sm font-bold">08/27</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <Button variant="outline" className="text-xs font-bold h-11"><Smartphone className="mr-2 h-4 w-4" /> Add to Apple Pay</Button>
                        <Button variant="outline" className="text-xs font-bold h-11 text-red-600 border-red-100 hover:bg-red-50"><ShieldCheck className="mr-2 h-4 w-4" /> Freeze Card</Button>
                    </div>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerPortal;
