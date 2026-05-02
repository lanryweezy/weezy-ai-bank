import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Monitor, Plus, ShieldCheck, RefreshCw, Activity, AlertTriangle, Building2, Trash2, MapPin, Calculator, Cpu } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const FixedAssets = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      category_id: 1,
      purchase_price: '',
      purchase_date: format(new Date(), 'yyyy-MM-dd'),
      location: '',
      serial_number: ''
  });

  const { data: inventory, isLoading, refetch } = useQuery({
    queryKey: ['assetInventory'],
    queryFn: () => apiClient('/corebanking/assets/inventory'),
  });

  const { data: categories } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: () => apiClient('/corebanking/assets/categories'),
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/assets/register', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Asset registered and acquisition posted to ledger.');
      setIsRegistering(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Registration failed'),
  });

  const deprMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/assets/depreciation/run-batch', { method: 'POST' }),
    onSuccess: (res) => {
      toast.success(`Depreciation batch successful. Processed ${res.assets_processed} assets.`);
      refetch();
    },
  });

  const handleRegister = () => {
      registerMutation.mutate({
          ...formData,
          purchase_price: parseFloat(formData.purchase_price)
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'ACTIVE': return <Badge className="bg-emerald-50 text-emerald-700 border-none">ACTIVE</Badge>;
        case 'FULLY_DEPRECIATED': return <Badge className="bg-indigo-50 text-indigo-700 border-none">FULLY DEPR</Badge>;
        case 'DISPOSED': return <Badge className="bg-slate-100 text-slate-500 border-none">DISPOSED</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                FIXED ASSETS <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Building2 className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Internal Inventory Control & Automated Depreciation Engine.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => deprMutation.mutate()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none" disabled={deprMutation.isPending}>
                <Calculator className="mr-2 h-4 w-4" /> Run Depreciation
            </Button>
            <Button onClick={() => setIsRegistering(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <Plus className="mr-2 h-4 w-4" /> Register Asset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Inventory Column */}
            <div className="lg:col-span-3 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Bank Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inventory?.map((asset: any) => (
                        <Card key={asset.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Badge className="bg-indigo-50 text-indigo-700 border-none text-[8px] font-black tracking-widest uppercase mb-2">{asset.asset_tag}</Badge>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{asset.name}</h4>
                                    </div>
                                    {getStatusBadge(asset.status)}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Book Value</p>
                                        <p className="text-lg font-black text-indigo-600">₦{parseFloat(asset.current_book_value).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Acquisition</p>
                                        <p className="text-sm font-bold text-slate-700">₦{parseFloat(asset.purchase_price).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/60">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <p className="text-[10px] text-slate-500 font-medium">{asset.location || 'Unknown Location'}</p>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Bought {format(new Date(asset.purchase_date), 'MMM yyyy')}</p>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {inventory?.length === 0 && (
                        <div className="md:col-span-2 py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">Vault Empty</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2">No internal assets registered. Acquisition entries will hit the GL automatically.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Policy</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> IAS 16 Compliance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                            "Weezy Core automatically posts depreciation to the Contra-Asset and P&L Expense GLs on the 28th of every month."
                        </p>
                        <div className="mt-6 space-y-3">
                            {categories?.map((cat: any) => (
                                <div key={cat.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase">{cat.category_name}</span>
                                    <span className="text-[10px] font-black text-indigo-400">{cat.annual_depreciation_pct}% P.A</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <Cpu className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Ledger Sync
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "Every asset registration triggers a Debit to the Asset GL and a Credit to the Payables/Cash GL in real-time."
                    </p>
                </div>
            </div>
        </div>

        {/* Register Modal */}
        {isRegistering && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Monitor className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Acquisition</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Register Internal Asset</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Name</Label>
                                <Input placeholder="e.g. MacBook Pro M3" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    value={formData.category_id}
                                    onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}
                                >
                                    {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Purchase Price (₦)</Label>
                                    <Input placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-indigo-600" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</Label>
                                    <Input placeholder="e.g. HQ" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsRegistering(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none" onClick={handleRegister} disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Acquisition'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default FixedAssets;
