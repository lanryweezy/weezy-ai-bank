import React, { useState } from 'react';
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
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

import TransactionDisputeModal from '@/components/TransactionDisputeModal';
import StatementModal from '@/components/StatementModal';
import GenerativeLifePath from '@/components/GenerativeLifePath';

const WalletPortal = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferData, setTransferData] = useState({ phone: '', amount: '', narration: '' });
  const [disputeTxnId, setDisputeTxnId] = useState<string | null>(null);
  const [showStatement, setShowStatement] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => JSON.parse(localStorage.getItem('user') || '{}'),
  });

  const { data: wallet, isLoading, refetch } = useQuery({
    queryKey: ['myWallet'],
    queryFn: () => apiClient('/wallets/me'),
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['walletTxns'],
    queryFn: () => apiClient('/transactions/history?limit=10'),
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
      toast.success(`₦${transferData.amount} sent successfully`);
      setIsTransferring(false);
      setTransferData({ phone: '', amount: '', narration: '' });
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Transfer failed'),
  });

  if (isLoading) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Initializing Identity Vault...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Sovereign Wallet <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Wallet className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic">Personal Node #WZY-{user?.id || '8820'}</p>
          </div>
          {wallet && (
            <div className="flex gap-4">
                <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/5 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                    <QrCode className="mr-3 h-5 w-5" /> Receive
                </Button>
                <Button onClick={() => setIsTransferring(!isTransferring)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all text-white border-none">
                    <ArrowUpRight className="mr-3 h-5 w-5" /> {isTransferring ? 'Dashboard' : 'Quick Send'}
                </Button>
            </div>
          )}
        </div>

        {!wallet ? (
          <Card className="max-w-md obsidian-card overflow-hidden mx-auto text-center p-12 border-indigo-500/20">
            <div className="space-y-8">
                <div className="bg-indigo-600/20 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-indigo-500/30">
                     <Smartphone className="h-12 w-12 text-indigo-400" />
                </div>
                <div>
                    <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">Initialize Node</CardTitle>
                    <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-3">Identity Handshake Required</CardDescription>
                </div>
                <div className="space-y-6 pt-6">
                 <div className="space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Identity</Label>
                    <Input id="phone_input" placeholder="+234..." className="h-16 rounded-2xl bg-white/5 border-white/5 px-8 font-black text-xl text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50" />
                 </div>
                 <Button 
                   className="w-full bg-indigo-600 h-16 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none" 
                   onClick={() => createWalletMutation.mutate((document.getElementById('phone_input') as HTMLInputElement).value)}
                   disabled={createWalletMutation.isPending}
                 >
                   {createWalletMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin mr-4" /> : <ShieldCheck className="h-6 w-6 mr-4" />}
                   Provision Wallet
                 </Button>
                </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Wallet Identity Section */}
            <div className="space-y-10">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Node Status</h3>
                    <Card className="obsidian-card border-none overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent" />
                        <CardHeader className="relative z-10 p-10 pb-4">
                            <div className="flex justify-between items-start">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] tracking-widest px-3 py-1 uppercase">SYNCED</Badge>
                                <Button variant="ghost" size="icon" className="text-slate-600 hover:text-white rounded-xl hover:bg-white/5"><MoreVertical className="h-5 w-5" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 p-10 pt-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Available Balance</p>
                            <h2 className="text-6xl font-black text-white tracking-tighter italic">₦{parseFloat(wallet.balance).toLocaleString()}</h2>
                            
                            <div className="mt-12 p-6 bg-white/5 rounded-[32px] border border-white/5 backdrop-blur-md flex flex-col gap-4">
                                <div>
                                    <p className="text-[8px] text-slate-600 uppercase font-black tracking-[0.3em] mb-2">Virtual NUBAN</p>
                                    <p className="text-xl font-mono font-black tracking-[0.2em] text-indigo-300">{wallet.nuban_account_number}</p>
                                </div>
                                <div className="h-[1px] w-full bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Phone: {wallet.phone_number}</span>
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <GenerativeLifePath />
            </div>

            {/* Main Interaction Area */}
            <div className="lg:col-span-2 space-y-10">
                {isTransferring ? (
                    <Card className="obsidian-card border-indigo-500/20 overflow-hidden animate-in zoom-in-95 duration-500">
                        <CardHeader className="p-12 border-b border-white/5">
                            <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-5 text-white uppercase">
                                <ArrowRightLeft className="h-10 w-10 text-indigo-500" /> Settlement
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium text-lg italic mt-2">Instant Node-to-Node Transfer Protocol</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <div className="space-y-4">
                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Destination Node (Phone)</Label>
                                <div className="relative">
                                    <Input placeholder="081..." value={transferData.phone} onChange={e => setTransferData({...transferData, phone: e.target.value})} className="h-20 rounded-3xl bg-white/5 border-white/5 px-10 font-black text-2xl text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50" />
                                    <div className="absolute right-6 top-5 bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-400"><Smartphone className="h-5 w-5" /></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Value (₦)</Label>
                                    <Input type="number" placeholder="0.00" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} className="h-20 rounded-3xl bg-white/5 border-white/5 px-10 font-black text-2xl text-emerald-400 focus-visible:ring-1 focus-visible:ring-emerald-500/50" />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Narration</Label>
                                    <Input placeholder="Optional remark" value={transferData.narration} onChange={e => setTransferData({...transferData, narration: e.target.value})} className="h-20 rounded-3xl bg-white/5 border-white/5 px-10 font-bold text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50" />
                                </div>
                            </div>
                            <div className="pt-10">
                                <Button 
                                    className="w-full bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none"
                                    onClick={() => transferMutation.mutate(transferData)}
                                    disabled={transferMutation.isPending}
                                >
                                    {transferMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                                    EXECUTE SETTLEMENT
                                </Button>
                                <Button variant="ghost" className="w-full h-14 font-black text-[10px] uppercase tracking-widest text-slate-600 mt-4 hover:text-white" onClick={() => setIsTransferring(false)}>Abort Protocol</Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="obsidian-card border-none overflow-hidden flex flex-col h-full min-h-[600px]">
                        <CardHeader className="p-12 border-b border-white/5 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase">Ledger Stream</CardTitle>
                                <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-2 italic">Autonomous Transaction Feed</CardDescription>
                            </div>
                            <div className="bg-indigo-500/10 p-4 rounded-3xl border border-indigo-500/20">
                                <Activity className="h-6 w-6 text-indigo-400 animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <div className="divide-y divide-white/5">
                                {recentTransactions?.length > 0 ? (
                                    recentTransactions.map((t: any) => (
                                        <div key={t.id} className="p-10 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                            <div className="flex items-center gap-8">
                                                <div className={`p-5 rounded-[24px] shadow-2xl transition-all group-hover:scale-110 ${t.transaction_type === 'TRANSFER' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {t.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-lg tracking-tight uppercase italic">{t.narration || 'Autonomous Settlement'}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{format(new Date(t.initiated_at), 'MMM dd, HH:mm')}</p>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setDisputeTxnId(t.id); }}
                                                            className="text-[9px] font-black text-red-500 uppercase tracking-tighter hover:text-red-400 transition-colors flex items-center gap-2"
                                                        >
                                                            <ShieldAlert className="h-3 w-3" /> Dispute
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black tracking-tighter italic ${t.transaction_type === 'TRANSFER' ? 'text-white' : 'text-emerald-400'}`}>
                                                    {t.transaction_type === 'TRANSFER' ? '-' : '+'}₦{parseFloat(t.amount).toLocaleString()}
                                                </p>
                                                <Badge className="mt-2 bg-white/5 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-3">{t.status}</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-40 text-center text-slate-700 flex flex-col items-center">
                                        <Activity className="h-12 w-12 text-slate-900 mb-6 animate-pulse" />
                                        <p className="text-sm font-black uppercase tracking-[0.4em]">End of Stream</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 border-t border-white/5 justify-center">
                             <Button variant="link" onClick={() => setShowStatement(true)} className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-300 transition-colors flex items-center gap-3">
                                <ExternalLink className="h-4 w-4" /> Download Node Statement
                             </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
          </div>
        )}

        {showStatement && wallet && (
            <StatementModal 
                customerName={user?.full_name || 'Valued Customer'} 
                accountNumber={wallet.nuban_account_number}
                transactions={recentTransactions || []}
                balance={wallet.balance}
                onClose={() => setShowStatement(false)}
            />
        )}

        {disputeTxnId && (
            <TransactionDisputeModal 
                transactionId={disputeTxnId} 
                onClose={() => setDisputeTxnId(null)} 
            />
        )}
    </div>
  );
};

export default WalletPortal;
