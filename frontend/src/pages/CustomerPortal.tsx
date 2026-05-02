import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, Smartphone, ArrowRightLeft, PlusCircle, CheckCircle2, History } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const WalletPortal = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferData, setTransferData] = useState({ phone: '', amount: '', narration: '' });

  const { data: wallet, isLoading, refetch } = useQuery({
    queryKey: ['myWallet'],
    queryFn: () => apiClient('/wallets/me'),
  });

  const createWalletMutation = useMutation({
    mutationFn: (phone: string) => apiClient('/wallets/create', { method: 'POST', body: JSON.stringify({ phone_number: phone }) }),
    onSuccess: () => {
      toast.success('Wallet created successfully!');
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Could not create wallet'),
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => apiClient('/wallets/p2p-transfer', { 
      method: 'POST', 
      body: JSON.stringify({ 
        receiver_phone: data.phone, 
        amount: parseFloat(data.amount),
        narration: data.narration 
      }) 
    }),
    onSuccess: (res) => {
      toast.success(`₦${transferData.amount} sent to ${res.receiver_name}`);
      setIsTransferring(false);
      setTransferData({ phone: '', amount: '', narration: '' });
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Transfer failed'),
  });

  if (isLoading) return <Layout><div className="p-8 text-center">Loading your wallet...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Mobile Money Wallet <Wallet className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Bank with your phone number. Instant, secure, and always with you.</p>
          </div>
        </div>

        {!wallet ? (
          <Card className="max-w-md border-none shadow-xl ring-1 ring-gray-200">
            <CardHeader className="text-center">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle>Activate Your Wallet</CardTitle>
              <CardDescription>Enter your phone number to get started with Weezy Mobile Money.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 <div className="space-y-2">
                    <Label>Phone Number (MTN, Glo, Airtel, 9mobile)</Label>
                    <Input id="phone_input" placeholder="08137502933" />
                 </div>
                 <Button 
                   className="w-full bg-indigo-600" 
                   onClick={() => createWalletMutation.mutate((document.getElementById('phone_input') as HTMLInputElement).value)}
                   disabled={createWalletMutation.isPending}
                 >
                   {createWalletMutation.isPending ? 'Processing...' : 'Create My Wallet'}
                 </Button>
               </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Card */}
            <Card className="bg-gradient-to-br from-indigo-700 to-blue-900 text-white border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet className="h-32 w-32" />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Mobile Wallet</p>
                    <CardTitle className="text-2xl mt-1">{wallet.phone_number}</CardTitle>
                  </div>
                  <Badge className="bg-green-400/20 text-green-300 border-none">ACTIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-8">
                <p className="text-indigo-200 text-xs">Available Balance</p>
                <h3 className="text-4xl font-bold mt-1">₦{parseFloat(wallet.balance).toLocaleString()}</h3>
                
                <div className="mt-8 p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] text-indigo-100 uppercase tracking-tighter">Your Virtual NUBAN</p>
                  <p className="text-lg font-mono font-bold tracking-widest">{wallet.nuban_account_number}</p>
                  <p className="text-[10px] text-indigo-300">WEEZY BANK (999)</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions / Transfer */}
            <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-gray-200">
               <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{isTransferring ? 'Send to Phone Number' : 'Wallet Overview'}</CardTitle>
                    <CardDescription>Instant P2P transfers across the network.</CardDescription>
                  </div>
                  <Button variant={isTransferring ? "ghost" : "outline"} onClick={() => setIsTransferring(!isTransferring)}>
                    {isTransferring ? 'Cancel' : 'Send Money'}
                  </Button>
               </CardHeader>
               <CardContent>
                  {isTransferring ? (
                    <div className="max-w-md space-y-4">
                        <div className="space-y-2">
                            <Label>Receiver's Phone Number</Label>
                            <Input 
                                placeholder="09012345678" 
                                value={transferData.phone} 
                                onChange={e => setTransferData({...transferData, phone: e.target.value})} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount (₦)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="2000" 
                                    value={transferData.amount} 
                                    onChange={e => setTransferData({...transferData, amount: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Narration</Label>
                                <Input 
                                    placeholder="For lunch" 
                                    value={transferData.narration} 
                                    onChange={e => setTransferData({...transferData, narration: e.target.value})} 
                                />
                            </div>
                        </div>
                        <Button 
                            className="w-full bg-indigo-600" 
                            onClick={() => transferMutation.mutate(transferData)}
                            disabled={transferMutation.isPending}
                        >
                            {transferMutation.isPending ? 'Sending...' : 'Confirm Instant Transfer'}
                        </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <PlusCircle className="h-6 w-6 text-green-500 mb-2" />
                                <p className="text-xs font-semibold">Top Up</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <ArrowRightLeft className="h-6 w-6 text-blue-500 mb-2" />
                                <p className="text-xs font-semibold">Withdraw</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <History className="h-6 w-6 text-orange-500 mb-2" />
                                <p className="text-xs font-semibold">History</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-bold mb-4">Recent Wallet Activity</h4>
                            <div className="text-center py-8 text-muted-foreground italic text-xs border border-dashed rounded-lg">
                                Your instant P2P and virtual account history will appear here.
                            </div>
                        </div>
                    </div>
                  )}
               </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WalletPortal;
