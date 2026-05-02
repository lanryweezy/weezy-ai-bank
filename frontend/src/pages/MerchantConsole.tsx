import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Monitor, ArrowUpRight, BarChart3, Clock, CheckCircle2, AlertCircle, RefreshCw, Terminal } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const MerchantConsole = () => {
  const merchantId = 1; // Demo merchant

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['merchantDashboard', merchantId],
    queryFn: () => apiClient(`/merchant/${merchantId}/dashboard`),
  });

  const settlementMutation = useMutation({
    mutationFn: () => apiClient('/merchant/settlement/run-daily', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Daily T+1 Settlement Processed');
      refetch();
    },
  });

  if (isLoading) return <Layout><div className="p-8 text-center">Loading Merchant Console...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Merchant Operations <Store className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Monitor POS sales, terminal health, and T+1 settlements.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => settlementMutation.mutate()} disabled={settlementMutation.isPending} variant="outline" className="border-indigo-200 text-indigo-600">
              <RefreshCw className={`mr-2 h-4 w-4 ${settlementMutation.isPending ? 'animate-spin' : ''}`} /> Run T+1 Settlement
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Business Name</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold text-indigo-700">{dashboard.business_name}</div>
                    <p className="text-xs text-gray-500 mt-1">Merchant ID: {dashboard.merchant_id_code}</p>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Active Terminals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold flex items-center gap-2">
                        {dashboard.active_terminals} <Monitor className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-green-600 mt-1 flex items-center">All systems operational</p>
                </CardContent>
            </Card>
            <Card className="bg-indigo-900 text-white border-none shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-indigo-200 uppercase">Next Settlement (T+1)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold">₦128,450.00</div>
                    <p className="text-xs text-indigo-300 mt-1 flex items-center"><Clock className="h-3 w-3 mr-1" /> Estimated for tomorrow</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Settlement History */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200 h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-600" /> Settlement History
                    </CardTitle>
                    <CardDescription>Payouts to your NUBAN settlement account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dashboard.recent_settlements?.length > 0 ? (
                            dashboard.recent_settlements.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">₦{parseFloat(s.net_amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(s.settlement_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-green-100 text-green-700 border-none text-[9px]">{s.status}</Badge>
                                        <p className="text-[9px] text-gray-400 mt-1 font-mono">{s.settlement_reference}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground italic border-2 border-dashed rounded-2xl">
                                No settlement records found yet.
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Terminal Activity */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                 <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-indigo-600" /> POS Terminals
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-gray-700">TID: 20459871</p>
                            <Badge className="bg-green-500 h-2 w-2 rounded-full p-0 min-w-0" />
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Model: PAX S90</p>
                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <p className="text-[9px] text-gray-400">Today's Sales</p>
                                <p className="text-sm font-bold">₦45,000.00</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-600">Details</Button>
                        </div>
                    </div>
                    
                    <Button variant="outline" className="w-full border-dashed border-2 hover:bg-indigo-50 text-indigo-600 text-xs">
                        + Add POS Terminal
                    </Button>
                 </CardContent>
              </Card>

              <Card className="bg-orange-50 border-none shadow-sm ring-1 ring-orange-200">
                 <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-800">
                        <AlertCircle className="h-4 w-4" /> Settlement Notice
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-[11px] text-orange-700 leading-relaxed">
                        Funds from POS transactions are settled into your bank account on a **T+1 basis** (Next business day). Weekend sales are settled on Monday.
                    </p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantConsole;
