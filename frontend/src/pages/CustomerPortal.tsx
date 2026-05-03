import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Smartphone, 
  ArrowRightLeft, 
  PlusCircle, 
  CheckCircle2, 
  History, 
  Activity, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles,
  Search,
  Zap,
  MoreVertical,
  QrCode,
  CreditCard,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const WalletPortal = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferData, setTransferData] = useState({ phone: '', amount: '', narration: '' });

  const { data: wallet, isLoading, refetch } = useQuery({
    queryKey: ['myWallet'],
    queryFn: () => apiClient('/wallets/me'),
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['walletTxns'],
    queryFn: () => apiClient('/transactions/history?limit=10'), // Mock filtering by wallet if needed
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

  if (isLoading) return <Layout><div className="p-10 text-center font-bold text-slate-400">Opening your identity vault...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                MOBILE WALLET <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Smartphone className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Instant P2P transfers & unified digital asset control.</p>
          </div>
          {wallet && (
            <div className="flex gap-3">
                <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all">
                    <QrCode className="mr-2 h-4 w-4" /> My Code
                </Button>
                <Button onClick={() => setIsTransferring(!isTransferring)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                    <ArrowUpRight className="mr-2 h-4 w-4" /> {isTransferring ? 'Overview' : 'Quick Send'}
                </Button>
            </div>
          )}
        </div>

        {!wallet ? (
          <Card className="max-w-md border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden mx-auto text-center">
            <div className="bg-indigo-600 p-12 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Wallet className="h-24 w-24" />
                </div>
                <div className="bg-white/20 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 backdrop-blur-md rotate-3 shadow-2xl">
                     <Smartphone className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Activate Wallet</CardTitle>
                <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Provisioning Secure Node</CardDescription>
            </div>
            <CardContent className="p-10 pt-8 space-y-6">
               <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">Link your phone number to a tiered mobile wallet and start transacting across the Weezy ecosystem instantly.</p>
               <div className="space-y-4">
                 <div className="space-y-2 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number (MTN/Glo/Airtel)</Label>
                    <Input id="phone_input" placeholder="081..." className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-lg shadow-inner" />
                 </div>
                 <Button 
                   className="w-full bg-indigo-600 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 active:scale-95 transition-all text-white border-none mt-4" 
                   onClick={() => createWalletMutation.mutate((document.getElementById('phone_input') as HTMLInputElement).value)}
                   disabled={createWalletMutation.isPending}
                 >
                   {createWalletMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                   Generate Wallet
                 </Button>
               </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Wallet Section */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Identity</h3>
                <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[40px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity group-hover:scale-110 duration-700">
                        <Wallet className="h-48 w-48" />
                    </div>
                    <CardHeader className="relative z-10 p-10 pb-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] tracking-widest px-3 py-1 uppercase mb-2">ACTIVE NODE</Badge>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Linked</p>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter mt-1">{wallet.phone_number}</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-10 pt-12 pb-12">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Available Liquidity</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic">₦{parseFloat(wallet.balance).toLocaleString()}</h2>
                        
                        <div className="mt-12 p-6 bg-white/5 rounded-[32px] border border-white/5 backdrop-blur-md">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-[0.3em] mb-2">Virtual NUBAN</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-mono font-black tracking-[0.15em] text-indigo-200">{wallet.nuban_account_number}</p>
                                <RefreshCw className="h-4 w-4 text-slate-600 hover:text-indigo-400 cursor-pointer transition-colors" />
                            </div>
                            <p className="text-[9px] text-slate-600 font-bold mt-2 tracking-widest">WEEZY BANK (999)</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white p-6 hover:shadow-xl transition-all group">
                         <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <ArrowDownLeft className="h-5 w-5" />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Cash</p>
                    </Card>
                    <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white p-6 hover:shadow-xl transition-all group">
                         <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 w-fit mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <ArrowUpRight className="h-5 w-5" />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdraw</p>
                    </Card>
                </div>
            </div>

            {/* Interaction Area */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Interaction Core</h3>
                {isTransferring ? (
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 rounded-[40px] bg-white overflow-hidden animate-in zoom-in-95 duration-500">
                        <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-4">
                                <ArrowRightLeft className="h-7 w-7 text-indigo-600" /> P2P SETTLEMENT
                            </CardTitle>
                            <CardDescription className="font-medium">Move funds instantly between wallet nodes.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Receiver Identity (Phone)</Label>
                                <div className="relative">
                                    <Input placeholder="090..." value={transferData.phone} onChange={e => setTransferData({...transferData, phone: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-black text-xl shadow-inner" />
                                    <div className="absolute right-4 top-4 bg-indigo-50 p-2 rounded-xl"><Smartphone className="h-4 w-4 text-indigo-400" /></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Disbursement Amount (₦)</Label>
                                    <Input type="number" placeholder="0.00" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-black text-xl text-indigo-600 shadow-inner" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Narration</Label>
                                    <Input placeholder="Reason for transfer" value={transferData.narration} onChange={e => setTransferData({...transferData, narration: e.target.value})} className="h-16 rounded-2xl bg-slate-50 border-none px-8 font-medium shadow-inner" />
                                </div>
                            </div>
                            <div className="pt-6">
                                <Button 
                                    className="w-full bg-indigo-600 h-16 rounded-[28px] font-black text-lg italic tracking-tighter shadow-2xl shadow-indigo-100 active:scale-95 transition-all text-white border-none"
                                    onClick={() => transferMutation.mutate(transferData)}
                                    disabled={transferMutation.isPending}
                                >
                                    {transferMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin mr-3" /> : <ShieldCheck className="h-6 w-6 mr-3" />}
                                    CONFIRM SETTLEMENT
                                </Button>
                                <Button variant="ghost" className="w-full h-12 font-bold text-slate-400 mt-4" onClick={() => setIsTransferring(false)}>Abort Protocol</Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[40px] bg-white overflow-hidden flex flex-col h-full min-h-[500px]">
                        <CardHeader className="p-10 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 italic tracking-tighter">LEDGER FEED</CardTitle>
                                <CardDescription className="font-medium">Recent autonomous movements across your wallet.</CardDescription>
                            </div>
                            <div className="flex -space-x-2">
                                 {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">W</div>)}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <div className="divide-y divide-slate-50">
                                {recentTransactions?.length > 0 ? (
                                    recentTransactions.map((t: any) => (
                                        <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-[20px] shadow-inner transition-all group-hover:scale-110 ${t.transaction_type === 'TRANSFER' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {t.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm tracking-tight">{t.narration || 'Wallet Movement'}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(t.initiated_at), 'MMM dd, HH:mm')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-black tracking-tighter ${t.transaction_type === 'TRANSFER' ? 'text-slate-900' : 'text-emerald-600'}`}>
                                                    {t.transaction_type === 'TRANSFER' ? '-' : '+'}₦{parseFloat(t.amount).toLocaleString()}
                                                </p>
                                                <Badge className="mt-1 bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest">{t.status}</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-32 text-center text-slate-400 flex flex-col items-center">
                                        <Activity className="h-10 w-10 text-slate-200 mb-4" />
                                        <p className="text-sm font-bold uppercase tracking-widest">End of Stream</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 p-6 border-t border-slate-100 justify-center">
                             <Button variant="link" className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:no-underline flex items-center gap-2">
                                Download Statement <ExternalLink className="h-3 w-3" />
                             </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WalletPortal;
