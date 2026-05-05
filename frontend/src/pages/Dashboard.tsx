import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  Brain, 
  Smartphone,
  Activity,
  Zap,
  Lock,
  ChevronRight,
  ChevronLeft,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TransferModal from '@/components/TransferModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.full_name || user.username || 'User');
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const { data: accounts, refetch: refetchSummary } = useQuery({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const displayAccounts = accounts || [
    { id: 1, account_number: '9990011223', ledger_balance: '12450000.00', currency: 'NGN', account_name: 'GLOBAL SAVINGS' },
    { id: 2, account_number: '9991100224', ledger_balance: '4250.00', currency: 'USD', account_name: 'DOMICILIARY PLATINUM' }
  ];

  const getCardStyle = (currency: string) => {
    if (currency === 'USD') return 'bg-slate-900 border-indigo-500/30 text-white';
    return 'bg-indigo-600 border-transparent text-white';
  };

  const getSymbol = (curr: string) => curr === 'USD' ? '$' : '₦';

  return (
    <div className="space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                {greeting}, {userName.split(' ')[0]} <Sparkles className="h-10 w-10 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-slate-500 font-medium text-xl uppercase tracking-widest italic">Cognitive Banking Cockpit Online.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsTransferModalOpen(true)} className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
              <ArrowUpRight className="mr-3 h-5 w-5" /> Send Assets
            </Button>
            <Button onClick={() => navigate('/cognitive-core')} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all text-white border-none">
              <Brain className="mr-3 h-5 w-5" /> Execute Prime
            </Button>
          </div>
        </div>

        <TransferModal 
          isOpen={isTransferModalOpen} 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={() => refetchSummary()}
        />

        {/* Account Vault */}
        <div className="space-y-6 text-white">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Globe className="h-3 w-3 text-indigo-500" /> GLOBAL LIQUIDITY MESH
                </h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/5 text-slate-500"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/5 text-slate-500"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
            
            <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar snap-x snap-mandatory">
                <Card className="min-w-[380px] obsidian-card border-none snap-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
                    <div className="p-10 relative z-10 space-y-10">
                        <div className="flex justify-between items-start">
                             <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
                                <TrendingUp className="h-6 w-6 text-indigo-400" />
                             </div>
                             <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] px-3 tracking-widest uppercase">Aggregated</Badge>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Net Liquidity</p>
                            <h3 className="text-5xl font-black italic tracking-tighter">₦22.4M</h3>
                        </div>
                        <div className="pt-4 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">3 COGNITIVE NODES ACTIVE</span>
                        </div>
                    </div>
                </Card>

                {displayAccounts.map((acc, i) => (
                    <Card key={i} className={`min-w-[380px] border-none shadow-2xl rounded-[40px] overflow-hidden snap-center shrink-0 relative group transition-all duration-700 ${getCardStyle(acc.currency)}`}>
                        <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity group-hover:rotate-12 duration-1000 pointer-events-none">
                            <CreditCard className="h-56 w-56" />
                        </div>
                        <CardContent className="p-10 space-y-12">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{acc.account_name}</p>
                                    <h4 className="text-md font-black mt-1 italic tracking-tight">{acc.currency} NODE</h4>
                                </div>
                                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                                    <Smartphone className="h-6 w-6 opacity-80" />
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Available Funds</p>
                                <h3 className="text-5xl font-black tracking-tighter italic">
                                    {getSymbol(acc.currency)}{parseFloat(acc.ledger_balance).toLocaleString()}
                                </h3>
                            </div>

                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Virtual NUBAN</p>
                                    <p className="text-sm font-mono font-bold tracking-[0.3em]">{acc.account_number}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {/* Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="obsidian-card p-10 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-all" onClick={() => navigate('/fraud-shield')}>
                <div className="flex justify-between items-start">
                    <div className="p-5 bg-red-500/10 rounded-3xl text-red-500 border border-red-500/20 shadow-2xl shadow-red-500/10 transition-transform group-hover:scale-110">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <Lock className="h-5 w-5 text-slate-700" />
                </div>
                <div className="mt-12 space-y-2">
                    <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase">Fraud Shield</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-3 w-3 text-emerald-500" /> Perimeter Secure
                    </p>
                </div>
            </Card>

            <Card className="obsidian-card p-10 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-all" onClick={() => navigate('/cognitive-core')}>
                <div className="flex justify-between items-start">
                    <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 transition-transform group-hover:scale-110">
                        <Brain className="h-8 w-8" />
                    </div>
                    <Zap className="h-5 w-5 text-slate-700 animate-pulse" />
                </div>
                <div className="mt-12 space-y-2">
                    <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase">Weezy Prime</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 italic">
                        Sentient Core Active
                    </p>
                </div>
            </Card>

            <Card className="obsidian-card p-10 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-all" onClick={() => navigate('/agent-banking')}>
                <div className="flex justify-between items-start">
                    <div className="p-5 bg-emerald-500/10 rounded-3xl text-emerald-400 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 transition-transform group-hover:scale-110">
                        <Users className="h-8 w-8" />
                    </div>
                    <Globe className="h-5 w-5 text-slate-700" />
                </div>
                <div className="mt-12 space-y-2">
                    <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase">Agent Mesh</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        Real-time SANEF Node
                    </p>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default Dashboard;
