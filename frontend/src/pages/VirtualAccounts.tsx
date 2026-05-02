import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Hash, Copy, Plus, ArrowDownLeft, Activity, Info, Landmark, ExternalLink, RefreshCw } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const VirtualAccounts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [vaData, setVaData] = useState({ account_name: '', label: '', parent_account_id: 1 });

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['vaDashboard'],
    queryFn: () => apiClient('/virtual-accounts/dashboard'),
  });

  const { data: vas } = useQuery({
    queryKey: ['myVAs'],
    queryFn: () => apiClient('/virtual-accounts/me'),
  });

  const createVAMutation = useMutation({
    mutationFn: (data: any) => apiClient('/virtual-accounts/create', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Virtual Account generated!');
      setIsCreating(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Creation failed'),
  });

  const simulateMutation = useMutation({
    mutationFn: (accNo: string) => apiClient('/virtual-accounts/simulate-payment', { 
        method: 'POST', 
        body: JSON.stringify({ account_number: accNo, amount: 25000, sender_name: "ADEYEMI OLUWASEUN" }) 
    }),
    onSuccess: () => {
      toast.success('Simulated ₦25,000 incoming transfer');
      refetch();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) return <Layout><div className="p-8 text-center">Loading Collections Dashboard...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Business Collections <Landmark className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Generate dedicated Virtual NUBANs for automated customer payments.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-indigo-600">
            <Plus className="mr-2 h-4 w-4" /> Generate Virtual Account
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Collected</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{parseFloat(dashboard.total_collections).toLocaleString()}</div>
                    <p className="text-xs text-green-600 mt-1 flex items-center"><Activity className="h-3 w-3 mr-1" /> Auto-settled to parent</p>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Active Virtual Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{dashboard.active_accounts_count}</div>
                    <p className="text-xs text-gray-500 mt-1">Linked to NIBSS NIP</p>
                </CardContent>
            </Card>
            <Card className="bg-indigo-50 border-none shadow-sm ring-1 ring-indigo-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-indigo-700 uppercase">Settlement Target</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold text-indigo-900 font-mono">9990011223</div>
                    <p className="text-xs text-indigo-600 mt-1 uppercase tracking-tighter">Primary Operating Account</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Account List */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Your Virtual Accounts</h3>
              <div className="space-y-4">
                {vas?.map((va: any) => (
                    <Card key={va.id} className="border-none shadow-sm ring-1 ring-gray-200 hover:ring-indigo-300 transition-all overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <Badge className="bg-indigo-50 text-indigo-700 border-none mb-2">{va.label || 'Standard'}</Badge>
                                        <h4 className="text-lg font-bold">{va.account_name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{va.bank_name}</p>
                                        <p className="text-xs font-bold text-indigo-600">Code: {va.bank_code}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex-1">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold">Virtual NUBAN</p>
                                        <p className="text-xl font-mono font-bold tracking-widest">{va.account_number}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-indigo-600 hover:bg-indigo-50" onClick={() => copyToClipboard(va.account_number)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-10 text-xs" onClick={() => simulateMutation.mutate(va.account_number)}>
                                            {simulateMutation.isPending ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <ArrowDownLeft className="h-3 w-3 mr-1" />} Test Payout
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-600 md:w-2 flex flex-shrink-0" />
                        </div>
                    </Card>
                ))}
              </div>
           </div>

           {/* Recent Incoming */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200 h-full">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Recent Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dashboard.recent_payments?.length > 0 ? (
                            dashboard.recent_payments.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="bg-green-100 p-1.5 rounded-full">
                                            <ArrowDownLeft className="h-3 w-3 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold truncate max-w-[120px]">{p.sender_name || 'Transfer'}</p>
                                            <p className="text-[9px] text-gray-400">{new Date(p.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-green-600">+₦{parseFloat(p.amount).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground italic text-xs border border-dashed rounded-xl">
                                Waiting for incoming transfers...
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                    <Button variant="link" className="w-full text-indigo-600 text-xs font-bold">View Full Statement →</Button>
                </CardFooter>
              </Card>
           </div>
        </div>

        {/* Create VA Modal */}
        {isCreating && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-none shadow-2xl">
                    <CardHeader>
                        <CardTitle>Generate Virtual Account</CardTitle>
                        <CardDescription>Assign a dedicated payment link to a customer or service.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Account Display Name</Label>
                            <Input placeholder="e.g. ADE'S FASHION STORE" value={vaData.account_name} onChange={e => setVaData({...vaData, account_name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Internal Label (Optional)</Label>
                            <Input placeholder="e.g. Website Collections" value={vaData.label} onChange={e => setVaData({...vaData, label: e.target.value})} />
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-indigo-600 shrink-0" />
                                <p className="text-[11px] text-indigo-800 leading-relaxed">
                                    Funds sent to this virtual account will be automatically settled into your primary operating account (**9990011223**) instantly.
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 flex gap-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button className="flex-[2] bg-indigo-600" onClick={() => createVAMutation.mutate(vaData)} disabled={createVAMutation.isPending}>
                                {createVAMutation.isPending ? 'Generating...' : 'Confirm & Generate'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default VirtualAccounts;
