import React, { useState } from 'react';
import Layout from '@/components/Layout';
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
  X
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MerchantConsole = () => {
  const merchantId = 1; // Demo merchant
  const [collectionAmount, setCollectionAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadQR = () => {
    setIsDownloading(true);
    setTimeout(() => {
        setIsDownloading(false);
        toast.success('Collection QR indexed to local storage.');
    }, 1500);
  };

  const handleShareQR = () => {
    if (navigator.share) {
        navigator.share({
            title: 'Weezy Bank Collection',
            text: `Pay ₦${parseFloat(collectionAmount).toLocaleString()} to ${dashboard.business_name}`,
            url: window.location.href
        }).catch(() => toast.error('Share failed'));
    } else {
        toast.info('Sharing protocol not supported on this node.');
    }
  };

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['merchantDashboard', merchantId],
    queryFn: () => apiClient<any>(`/merchant/${merchantId}/dashboard`),
  });

  const settlementMutation = useMutation({
    mutationFn: () => apiClient('/merchant/settlement/run-daily', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Daily T+1 Settlement Processed');
      refetch();
    },
  });

  if (isLoading) return <Layout><div className="p-10 text-center font-bold text-slate-400">Syncing Merchant Core...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                MERCHANT OPS <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Store className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Acquiring Governance, POS Management & T+1 Settlement Core.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => settlementMutation.mutate()} disabled={settlementMutation.isPending} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
              <RefreshCw className={`mr-2 h-4 w-4 ${settlementMutation.isPending ? 'animate-spin' : ''}`} /> Force Settlement
            </Button>
          </div>
        </div>

        <Tabs defaultValue="FLEET" className="w-full">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto inline-flex mb-8">
                <TabsTrigger value="FLEET" className="rounded-xl px-8 py-2.5 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    <Terminal className="w-3.5 h-3.5 mr-2" /> Terminal Fleet
                </TabsTrigger>
                <TabsTrigger value="COLLECTIONS" className="rounded-xl px-8 py-2.5 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                    <QrCode className="w-3.5 h-3.5 mr-2" /> Digital Collections
                </TabsTrigger>
            </TabsList>

            <TabsContent value="FLEET" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Settlement History */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payout Ledger</h3>
                        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" /> RECENT SETTLEMENTS
                                    </CardTitle>
                                    <CardDescription className="font-medium">Funds transferred to your primary NUBAN.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-50">
                                    {dashboard.recent_settlements?.length > 0 ? (
                                        dashboard.recent_settlements.map((s: any) => (
                                            <div key={s.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                                <div className="flex items-center gap-6">
                                                    <div className="bg-emerald-50 p-4 rounded-[20px] text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                        <ArrowUpRight className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg tracking-tight">₦{parseFloat(s.net_amount).toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{format(new Date(s.settlement_date), 'MMMM dd, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">{s.status}</Badge>
                                                    <p className="text-[9px] text-slate-400 mt-2 font-mono font-bold">{s.settlement_reference}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No settlement cycles recorded</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Terminal Activity Sidebar */}
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Acquiring Pulse</h3>
                        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                    <Terminal className="h-5 w-5 text-indigo-600" /> POS FLEET
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:border-indigo-100 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Terminal ID</p>
                                            <p className="text-sm font-black text-slate-900 font-mono">20459871</p>
                                        </div>
                                        <Badge className="bg-emerald-500 h-2 w-2 rounded-full p-0 min-w-0" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Model: PAX S90 • FIRMWARE v4.1</p>
                                    </div>
                                    <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Today's Gross</p>
                                            <p className="text-xl font-black text-indigo-600 tracking-tight">₦45,000.00</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-10 px-4 rounded-xl text-indigo-600 font-black text-[9px] uppercase tracking-widest hover:bg-indigo-50">Manage</Button>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full h-14 border-dashed border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-indigo-200 transition-all font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">
                                    + Deploy New Node
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="COLLECTIONS" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 rounded-[40px] bg-white overflow-hidden">
                            <CardHeader className="bg-indigo-600 text-white p-12 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="bg-white/20 w-20 h-20 rounded-[28px] flex items-center justify-center backdrop-blur-md rotate-3 shadow-2xl">
                                        <QrCode className="h-10 w-10 text-white" />
                                    </div>
                                    <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">DYNAMIC QR PROTOCOL</CardTitle>
                                    <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em]">Instant P2B Collection Engine</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-12 space-y-10">
                                <div className="space-y-4 max-w-sm mx-auto">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Collection Amount (₦)</Label>
                                    <Input 
                                        placeholder="0.00" 
                                        className="h-16 rounded-[24px] bg-slate-50 border-none px-8 text-2xl font-black text-indigo-600 text-center shadow-inner"
                                        value={collectionAmount}
                                        onChange={e => setCollectionAmount(e.target.value)}
                                    />
                                    <Button 
                                        className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95 border-none mt-4"
                                        onClick={() => setShowQR(true)}
                                        disabled={!collectionAmount}
                                    >
                                        Generate Collection Node
                                    </Button>
                                </div>

                                <div className="pt-8 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-6">
                                     {[
                                        { label: 'Settlement', value: 'Instant', icon: Zap, color: 'blue' },
                                        { label: 'Network', value: 'NQR Core', icon: Globe, color: 'emerald' },
                                        { label: 'Fee', value: '0.5%', icon: Activity, color: 'indigo' },
                                        { label: 'Security', value: 'Signed', icon: ShieldCheck, color: 'purple' }
                                     ].map((feat, i) => (
                                         <div key={i} className="text-center space-y-2">
                                            <div className={`w-10 h-10 bg-${feat.color}-50 rounded-xl flex items-center justify-center mx-auto text-${feat.color}-600`}>
                                                <feat.icon className="h-5 w-5" />
                                            </div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{feat.label}</p>
                                            <p className="text-[10px] font-black text-slate-900">{feat.value}</p>
                                         </div>
                                     ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Real-time Receipts</h3>
                         <div className="py-20 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Awaiting Payment Events...</p>
                         </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        {/* QR MODAL */}
        {showQR && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
                <Card className="w-full max-w-sm border-none shadow-2xl bg-white rounded-[48px] overflow-hidden">
                    <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                        <div className="bg-indigo-600 p-2 rounded-xl">
                            <QrCode className="h-5 w-5 text-white" />
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 rounded-full" onClick={() => setShowQR(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 text-center space-y-8">
                        <div className="space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan to Pay</p>
                             <h3 className="text-4xl font-black italic tracking-tighter text-slate-900">₦{parseFloat(collectionAmount).toLocaleString()}</h3>
                        </div>

                        {/* Simulated QR Code */}
                        <div className="aspect-square w-full bg-slate-50 rounded-[40px] border-8 border-white shadow-inner flex items-center justify-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />
                             <div className="w-48 h-48 border-4 border-slate-900/10 rounded-3xl flex items-center justify-center relative bg-white">
                                  <div className="grid grid-cols-4 grid-rows-4 gap-2 opacity-80">
                                      {[...Array(16)].map((_, i) => <div key={i} className={`w-6 h-6 rounded-md ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-slate-100'}`} />)}
                                  </div>
                                  <div className="absolute bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                                       <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />
                                  </div>
                             </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium px-4 leading-relaxed">
                            Certified NQR Transaction • Reference: <span className="font-mono font-bold text-slate-900">WZY-COLL-{Math.floor(1000 + Math.random() * 9000)}</span>
                        </p>

                        <div className="flex gap-4">
                             <Button 
                                variant="outline" 
                                className="flex-1 h-14 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-600"
                                onClick={handleDownloadQR}
                                disabled={isDownloading}
                             >
                                {isDownloading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {isDownloading ? 'Indexing...' : 'Save QR'}
                             </Button>
                             <Button 
                                className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest border-none shadow-xl shadow-indigo-100"
                                onClick={handleShareQR}
                             >
                                <Share2 className="mr-2 h-4 w-4" /> Share Node
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

export default MerchantConsole;
