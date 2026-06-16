import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ShieldAlert,
  Cpu,
  BrainCircuit,
  Target,
  Compass,
  TrendingUp,
  Globe
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

import TransactionDisputeModal from '@/components/TransactionDisputeModal';
import StatementModal from '@/components/StatementModal';
import GenerativeLifePath from '@/components/GenerativeLifePath';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import NeuralHandshake from '@/components/ui/NeuralHandshake';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import WealthAgentOrb from '@/components/ui/WealthAgentOrb';
import ThinkingStream from '@/components/ui/ThinkingStream';

const WalletPortal = () => {
  const [isTransferring, setIsTransferring] = useState(false);
  const [isHandshakeOpen, setIsHandshakeOpen] = useState(false);
  const [transferData, setTransferData] = useState({ phone: '', amount: '', narration: '' });
  const [previewAmount, setPreviewAmount] = useState(0);
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
      toast.success('Wallet synthesized successfully!');
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

  const handleExecuteSettlement = () => {
    if (!transferData.phone || !transferData.amount) {
        toast.error("Protocol requires destination and value.");
        return;
    }
    setIsHandshakeOpen(true);
  };

  const onHandshakeSuccess = () => {
    setIsHandshakeOpen(false);
    transferMutation.mutate(transferData);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
            <Cpu className="w-12 h-12 text-indigo-500 animate-spin-slow" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Initializing_Sovereign_Node</div>
        </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen text-white selection:bg-indigo-500/30 overflow-x-hidden pb-20"
    >
      <NeuralBackdrop />
      
      <main className="max-w-7xl mx-auto px-8 pt-16 space-y-16 relative z-10">
        
        {/* Executive Header */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[2px] bg-indigo-500" 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Node_Identity_Verified</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Sovereign <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Wallet</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Personal Node #WZY-{user?.id || '8820'} // PQC SECURED
            </p>
          </div>
          
          {wallet && (
            <div className="flex gap-6">
                <button className="h-16 px-10 rounded-[24px] bg-white/[0.02] backdrop-blur-xl border border-white/5 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 group shadow-2xl">
                    <QrCode className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" /> Receive_Value
                </button>
                <button 
                  onClick={() => setIsTransferring(!isTransferring)} 
                  className="h-16 px-10 rounded-[24px] bg-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.3)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 duration-300"
                >
                    <ArrowUpRight className="w-5 h-5" /> {isTransferring ? 'Lattice_Home' : 'Instant_Settlement'}
                </button>
            </div>
          )}
        </section>

        <AnimatePresence>
            {isHandshakeOpen && (
                <NeuralHandshake 
                    amount={parseFloat(transferData.amount)} 
                    onSuccess={onHandshakeSuccess} 
                    onCancel={() => setIsHandshakeOpen(false)} 
                />
            )}
        </AnimatePresence>

        {!wallet ? (
          <HolographicCard className="max-w-xl mx-auto p-16 text-center">
            <div className="space-y-10 relative z-10">
                <div className="bg-indigo-600/10 w-28 h-28 rounded-[40px] flex items-center justify-center mx-auto mb-12 border border-indigo-500/20 shadow-2xl">
                     <BrainCircuit className="h-12 w-12 text-indigo-400 animate-pulse" />
                </div>
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Initialize Hub</h2>
                    <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.5em] mt-4 italic">Neural Identity Handshake Required</p>
                </div>
                <div className="space-y-8 pt-8 text-left">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Phone_Identity_Link</Label>
                    <Input id="phone_input" placeholder="+234..." className="h-20 rounded-3xl bg-white/[0.03] border-white/5 px-10 font-black text-2xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20 placeholder:text-white/5" />
                 </div>
                 <Button 
                   className="w-full bg-indigo-600 h-20 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all" 
                   onClick={() => createWalletMutation.mutate((document.getElementById('phone_input') as HTMLInputElement).value)}
                   disabled={createWalletMutation.isPending}
                 >
                   {createWalletMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin mr-4" /> : <ShieldCheck className="h-6 w-6 mr-4" />}
                   Synthesize Wallet Node
                 </Button>
                </div>
            </div>
          </HolographicCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Wallet Identity Section */}
            <div className="lg:col-span-4 space-y-12">
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node_Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                        </div>
                    </div>
                    <HolographicCard className="p-10 relative overflow-hidden group min-h-[400px]">
                        <div className="absolute top-0 right-0 p-8">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] tracking-widest px-4 py-1.5 uppercase rounded-full">ACTIVE_SYNC</Badge>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Total_Value_Locked</p>
                            <h2 className="text-6xl font-black text-white tracking-tighter italic">₦{parseFloat(wallet.balance).toLocaleString()}</h2>
                        </div>
                        
                        <div className="mt-16 p-8 bg-white/[0.02] rounded-[40px] border border-white/5 backdrop-blur-2xl flex flex-col gap-6 group-hover:border-indigo-500/30 transition-colors">
                            <div className="space-y-2">
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.4em]">Virtual_NUBAN</p>
                                <p className="text-2xl font-mono font-black tracking-[0.25em] text-indigo-400">{wallet.nuban_account_number}</p>
                            </div>
                            <div className="h-[1px] w-full bg-white/5" />
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>{wallet.phone_number}</span>
                                </div>
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                    </HolographicCard>
                </div>

                <SentientFrame intent="neutral" title="Neural Life Path" subtitle="Cognitive Financial Growth Analysis">
                    <GenerativeLifePath previewAmount={previewAmount} />
                </SentientFrame>
            </div>

            {/* Main Interaction Area */}
            <div className="lg:col-span-8 space-y-12">
                {isTransferring ? (
                    <SentientFrame intent="growth" title="Value Settlement" subtitle="Autonomous Node-to-Node Protocol">
                        <div className="p-8 space-y-12">
                            <div className="space-y-6">
                                <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Destination_Node (Identity_Link)</Label>
                                <div className="relative group">
                                    <Input placeholder="Enter Phone or Node ID..." value={transferData.phone} onChange={e => setTransferData({...transferData, phone: e.target.value})} className="h-24 rounded-[32px] bg-white/[0.03] border-white/5 px-12 font-black text-3xl text-white focus-visible:ring-2 focus-visible:ring-indigo-500/20 placeholder:text-white/5 transition-all" />
                                    <div className="absolute right-8 top-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform"><Target className="h-6 w-6" /></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Value_Quantity (₦)</Label>
                                    <Input type="number" placeholder="0.00" value={transferData.amount} onChange={e => handleAmountChange(e.target.value)} className="h-24 rounded-[32px] bg-white/[0.03] border-white/5 px-12 font-black text-4xl text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all" />
                                </div>
                                <div className="space-y-6">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Narration_String</Label>
                                    <Input placeholder="Logic reference..." value={transferData.narration} onChange={e => setTransferData({...transferData, narration: e.target.value})} className="h-24 rounded-[32px] bg-white/[0.03] border-white/5 px-12 font-bold text-xl text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all" />
                                </div>
                            </div>
                            <div className="pt-8 space-y-6">
                                <Button 
                                    className="w-full bg-indigo-600 h-24 rounded-[40px] font-black text-2xl italic tracking-tighter shadow-[0_0_50px_rgba(99,102,241,0.4)] hover:bg-indigo-500 active:scale-95 transition-all text-white border-none"
                                    onClick={handleExecuteSettlement}
                                    disabled={transferMutation.isPending}
                                >
                                    {transferMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-6" /> : <Zap className="h-8 w-8 mr-6 fill-white" />}
                                    EXECUTE_SETTLEMENT
                                </Button>
                                <button className="w-full py-4 text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-rose-400 transition-colors font-bold" onClick={() => setIsTransferring(false)}>Abort_Protocol</button>
                            </div>
                        </div>
                    </SentientFrame>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 shadow-2xl">
                                    <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-[0.3em]">Ledger Stream</h3>
                            </div>
                            <div className="flex gap-4">
                                <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 shadow-xl"><Search className="w-4 h-4 text-slate-400" /></button>
                                <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 shadow-xl"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                            </div>
                        </div>

                        <HolographicCard className="p-0 overflow-hidden flex flex-col min-h-[650px]">
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="divide-y divide-white/[0.03]">
                                    {recentTransactions?.length > 0 ? (
                                        recentTransactions.map((t: any, idx: number) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={t.id} 
                                                className="p-10 flex items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-500"
                                            >
                                                <div className="flex items-center gap-10">
                                                    <div className={cn(
                                                        "p-6 rounded-[28px] shadow-2xl transition-all group-hover:scale-110",
                                                        t.transaction_type === 'TRANSFER' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                                                    )}>
                                                        {t.transaction_type === 'TRANSFER' ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownLeft className="h-8 w-8" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-xl tracking-tight uppercase italic group-hover:text-indigo-400 transition-colors">{t.narration || 'Autonomous Settlement'}</p>
                                                        <div className="flex items-center gap-6 mt-3">
                                                            <div className="flex items-center gap-2">
                                                                <History className="w-3.5 h-3.5 text-slate-600" />
                                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{format(new Date(t.initiated_at), 'MMM dd // HH:mm')}</span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setDisputeTxnId(t.id); }}
                                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors flex items-center gap-2 opacity-60 group-hover:opacity-100"
                                                            >
                                                                <ShieldAlert className="h-3.5 h-3.5" /> Open_Dispute
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-3">
                                                    <p className={`text-3xl font-black tracking-tighter italic ${t.transaction_type === 'TRANSFER' ? 'text-white' : 'text-emerald-400'}`}>
                                                        {t.transaction_type === 'TRANSFER' ? '-' : '+'}₦{parseFloat(t.amount).toLocaleString()}
                                                    </p>
                                                    <Badge className="bg-white/5 text-slate-500 border-none text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full">LATTICE_FINAL_{t.status}</Badge>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-48 text-center flex flex-col items-center">
                                            <Activity className="h-16 w-16 text-slate-900 mb-8 animate-pulse" />
                                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700">Lattice_Stream_Terminal</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-10 border-t border-white/5 bg-white/[0.01]">
                                <button 
                                    onClick={() => setShowStatement(true)} 
                                    className="w-full h-16 rounded-2xl border border-white/5 font-black text-[11px] uppercase tracking-[0.4em] text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-500 shadow-2xl flex items-center justify-center gap-4 group"
                                >
                                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                                    Generate_Forensic_Statement
                                </button>
                            </div>
                        </HolographicCard>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* Floating Forensic HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-10 py-5 rounded-full border border-white/5 flex items-center gap-12 shadow-2xl shadow-black/80 border border-white/10">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node: <span className="text-white">ENFORCED</span></span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-4">
                    <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Handshake: <span className="text-white">ACTIVE</span></span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-4">
                    <Cpu className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync: <span className="text-white italic">v4.0.8</span></span>
                </div>
            </div>
        </div>

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
        
        <WealthAgentOrb />
        <ThinkingStream />
      </main>
    </motion.div>
  );
};

export default WalletPortal;
