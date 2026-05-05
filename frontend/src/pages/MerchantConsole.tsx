import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Monitor, 
  ArrowUpRight, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Smartphone, 
  TrendingUp,
  QrCode,
  Scan,
  Download,
  Share2,
  ChevronRight,
  Sparkles,
  X,
  Globe,
  Zap,
  Cpu
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const MerchantConsole = () => {
  const merchantId = 1; // Demo merchant
  const [collectionAmount, setCollectionAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadQR = () => {
    setIsDownloading(true);
    setTimeout(() => {
        setIsDownloading(false);
        toast.success('Collection QR indexed to secure vault.');
    }, 1500);
  };

  const handleShareQR = () => {
    if (navigator.share) {
        navigator.share({
            title: 'Weezy Bank Collection',
            text: `Authorize ₦${parseFloat(collectionAmount).toLocaleString()} transfer to Merchant`,
            url: window.location.href
        }).catch(() => toast.error('Share protocol interrupted'));
    } else {
        toast.info('Sharing requires Level 3 biometric handshake.');
    }
  };

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['merchantDashboard', merchantId],
    queryFn: () => apiClient<any>(`/merchant/${merchantId}/dashboard`),
  });

  const settlementMutation = useMutation({
    mutationFn: () => apiClient('/merchant/settlement/run-daily', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Autonomous T+0 Settlement Synchronized');
      refetch();
    },
  });

  if (isLoading) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Synchronizing Merchant Core...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Merchant Ops <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Store className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Cpu className="h-4 w-4 text-indigo-500" /> Authorized Acquiring Infrastructure
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => settlementMutation.mutate()} disabled={settlementMutation.isPending} className="rounded-2xl h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-slate-300">
              <RefreshCw className={`mr-3 h-5 w-5 ${settlementMutation.isPending ? 'animate-spin' : ''}`} /> T+0 Sync
            </Button>
          </div>
        </div>

        <Tabs defaultValue="FLEET" className="w-full">
            <TabsList className="bg-white/5 p-2 rounded-[24px] h-auto inline-flex mb-12 border border-white/5">
                <TabsTrigger value="FLEET" className="rounded-2xl px-10 py-3 font-black text-[11px] tracking-[0.2em] uppercase data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                    <Terminal className="w-4 h-4 mr-3" /> Hardware Fleet
                </TabsTrigger>
                <TabsTrigger value="COLLECTIONS" className="rounded-2xl px-10 py-3 font-black text-[11px] tracking-[0.2em] uppercase data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                    <QrCode className="w-4 h-4 mr-3" /> Liquid Collections
                </TabsTrigger>
            </TabsList>

            <TabsContent value="FLEET" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Settlement History */}
                    <div className="lg:col-span-2 space-y-10">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Settlement Ledger</h3>
                        <Card className="obsidian-card border-none overflow-hidden flex flex-col min-h-[500px]">
                            <CardHeader className="p-12 border-b border-white/5 flex flex-row items-center justify-between bg-white/[0.01]">
                                <div>
                                    <CardTitle className="text-2xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                                        <TrendingUp className="h-6 w-6 text-indigo-400" /> Network Payouts
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-3">Verified Settlement Nodes</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                <div className="divide-y divide-white/5">
                                    {dashboard.recent_settlements?.length > 0 ? (
                                        dashboard.recent_settlements.map((s: any) => (
                                            <div key={s.id} className="p-10 flex items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                                <div className="flex items-center gap-8">
                                                    <div className="bg-emerald-500/10 p-5 rounded-[24px] border border-emerald-500/20 text-emerald-400 transition-all group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6">
                                                        <ArrowUpRight className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-xl tracking-tight uppercase italic">₦{parseFloat(s.net_amount).toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{format(new Date(s.settlement_date), 'MMMM dd, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">SYNCHRONIZED</Badge>
                                                    <p className="text-[9px] text-slate-600 mt-2 font-mono font-bold tracking-widest">{s.settlement_reference}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-32 text-center text-slate-700 flex flex-col items-center">
                                            <Activity className="h-12 w-12 text-slate-900 mb-6 animate-pulse" />
                                            <p className="text-sm font-black uppercase tracking-[0.4em]">Zero Ledger Events</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 border-t border-white/5 justify-center bg-white/[0.01]">
                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Encrypted Secure Tunnel Node</p>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Terminal Activity Sidebar */}
                    <div className="space-y-10">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Terminal Pulse</h3>
                        <Card className="obsidian-card border-indigo-500/20 overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-10">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 text-indigo-400">
                                    <Terminal className="h-5 w-5" /> Hardware Fleet
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                                <div className="p-8 glass-dark rounded-[32px] border border-white/5 relative group hover:border-indigo-500/30 transition-all shadow-2xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Node Physical ID</p>
                                            <p className="text-lg font-black text-white font-mono tracking-widest uppercase italic">2045-9871</p>
                                        </div>
                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-10">
                                        <Smartphone className="h-4 w-4 text-indigo-400" />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-60">PAX S90 • FIRMWARE CL-v4.1</p>
                                    </div>
                                    <div className="flex justify-between items-end pt-6 border-t border-white/5">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Live Throughput</p>
                                            <p className="text-2xl font-black text-white tracking-tighter uppercase italic">₦45,000</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-10 px-6 rounded-xl text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 border border-white/5">Manage</Button>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full h-20 border-dashed border-2 border-white/5 rounded-[32px] hover:bg-white/5 hover:border-indigo-500/30 transition-all font-black text-[11px] uppercase tracking-[0.2em] text-slate-600 hover:text-white group">
                                    <Plus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" /> Provision Node
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="COLLECTIONS" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <Card className="obsidian-card border-none overflow-hidden ring-1 ring-white/5 shadow-2xl">
                            <CardHeader className="bg-indigo-600 text-white p-14 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 shimmer opacity-20" />
                                <div className="relative z-10 flex flex-col items-center gap-8">
                                    <div className="bg-white/20 w-24 h-24 rounded-[40px] flex items-center justify-center backdrop-blur-3xl rotate-6 shadow-2xl border border-white/20">
                                        <QrCode className="h-12 w-12 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">Dynamic NQR Protocol</CardTitle>
                                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.5em] mt-4 opacity-70 italic">Sovereign P2B Liquidity Engine</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-14 space-y-12">
                                <div className="space-y-6 max-w-md mx-auto">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 text-center block italic">Desired Payload Value (₦)</Label>
                                    <Input 
                                        placeholder="0.00" 
                                        className="h-24 rounded-[40px] bg-white/5 border-white/10 px-10 text-4xl font-black text-indigo-400 text-center shadow-2xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all tracking-tighter"
                                        value={collectionAmount}
                                        onChange={e => setCollectionAmount(e.target.value)}
                                    />
                                    <Button 
                                        className="w-full h-20 bg-white text-black rounded-[32px] font-black text-base uppercase tracking-[0.3em] italic shadow-2xl active:scale-95 border-none mt-8 hover:bg-slate-200 transition-all"
                                        onClick={() => setShowQR(true)}
                                        disabled={!collectionAmount}
                                    >
                                        Synthesize Node
                                    </Button>
                                </div>

                                <div className="pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                                     {[
                                        { label: 'Settlement', value: 'T+0 Instant', icon: Zap, color: 'blue' },
                                        { label: 'Protocol', value: 'NQR High-Res', icon: Globe, color: 'emerald' },
                                        { label: 'Commission', value: '0.50% FIXED', icon: Activity, color: 'indigo' },
                                        { label: 'Encryption', value: 'HMAC-SHA256', icon: ShieldCheck, color: 'purple' }
                                     ].map((feat, i) => (
                                         <div key={i} className="text-center space-y-3 group">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-500 group-hover:bg-white/10 group-hover:text-indigo-400 transition-all border border-white/5">
                                                <feat.icon className="h-6 w-6" />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{feat.label}</p>
                                            <p className="text-[11px] font-black text-white uppercase tracking-tighter italic">{feat.value}</p>
                                         </div>
                                     ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-10">
                         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Live Collection Feed</h3>
                         <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
                            <Activity className="h-16 w-16 text-slate-900 mx-auto mb-6 animate-pulse" />
                            <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.4em] italic px-8">Listening for inbound liquidity events...</p>
                         </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        {/* QR MODAL (LUXURY OVERLAY) */}
        {showQR && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-700">
                <Card className="w-full max-w-md border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.2)] obsidian-card rounded-[60px] overflow-hidden">
                    <CardHeader className="p-12 pb-6 flex flex-row items-center justify-between">
                        <div className="bg-indigo-600 p-3 rounded-2xl border border-indigo-500/30 shadow-2xl">
                            <QrCode className="h-6 w-6 text-white" />
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-red-500 rounded-full h-12 w-12 hover:bg-white/5" onClick={() => setShowQR(false)}>
                            <X className="h-8 w-8" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-12 pt-0 text-center space-y-10">
                        <div className="space-y-3">
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Scan for Instant Liquidity</p>
                             <h3 className="text-5xl font-black italic tracking-tighter text-white uppercase">₦{parseFloat(collectionAmount).toLocaleString()}</h3>
                        </div>

                        {/* Simulated High-Res QR Code */}
                        <div className="aspect-square w-full bg-white p-12 rounded-[56px] shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] flex items-center justify-center relative overflow-hidden group border-[12px] border-indigo-600/10">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
                             <div className="w-full h-full rounded-[32px] flex items-center justify-center relative bg-white overflow-hidden p-2">
                                  <div className="grid grid-cols-6 grid-rows-6 gap-2 opacity-90 w-full h-full">
                                      {[...Array(36)].map((_, i) => <div key={i} className={`rounded-md ${Math.random() > 0.4 ? 'bg-black' : 'bg-slate-100'}`} />)}
                                  </div>
                                  <div className="absolute bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
                                       <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
                                  </div>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">
                                SECURE NQR PROTOCOL • ID: <span className="font-mono font-black text-white">WZY-NODE-{Math.floor(10000 + Math.random() * 90000)}</span>
                            </p>
                        </div>

                        <div className="flex gap-6">
                             <Button 
                                variant="outline" 
                                className="flex-1 h-16 rounded-2xl border-white/10 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white transition-all shadow-2xl"
                                onClick={handleDownloadQR}
                                disabled={isDownloading}
                             >
                                {isDownloading ? <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> : <Download className="mr-3 h-5 w-5" />}
                                {isDownloading ? 'VAULTING...' : 'SAVE NODE'}
                             </Button>
                             <Button 
                                className="flex-1 h-16 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest border-none shadow-2xl shadow-indigo-500/30 active:scale-95 hover:bg-indigo-500 transition-all"
                                onClick={handleShareQR}
                             >
                                <Share2 className="mr-3 h-5 w-5" /> BROADCAST
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
};

export default MerchantConsole;
