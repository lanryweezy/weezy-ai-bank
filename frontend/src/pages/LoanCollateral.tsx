import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Plus, Gavel, Car, Home, LineChart, Box, FileCheck, Search, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const LoanCollateral = () => {
  const [isPledging, setIsPledging] = useState(false);
  const [formData, setFormData] = useState({
      customer_id: 1,
      collateral_type: 'VEHICLE',
      description: '',
      estimated_market_value: '',
      document_reference: '',
      physical_custody_location: ''
  });

  const { data: collaterals, isLoading, refetch } = useQuery({
    queryKey: ['myCollaterals'],
    queryFn: () => apiClient('/corebanking/loans/collateral/me'),
  });

  const pledgeMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/loans/collateral/pledge', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Collateral pledged and sent for AI valuation.');
      setIsPledging(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Pledge failed'),
  });

  const handlePledge = () => {
      pledgeMutation.mutate({
          ...formData,
          estimated_market_value: parseFloat(formData.estimated_market_value)
      });
  };

  const getIcon = (type: string) => {
      switch (type) {
          case 'VEHICLE': return <Car className="h-6 w-6" />;
          case 'LAND_PROPERTY': return <Home className="h-6 w-6" />;
          case 'MARKETABLE_SECURITIES': return <LineChart className="h-6 w-6" />;
          case 'INVENTORY_COMMODITY': return <Box className="h-6 w-6" />;
          default: return <Gavel className="h-6 w-6" />;
      }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                ASSET VAULT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Gavel className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Secured Collateral Management & AI-Assisted Asset Appraisal.</p>
          </div>
          <Button onClick={() => setIsPledging(true)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Pledge New Asset
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Asset List */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pledged Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collaterals?.map((asset: any) => (
                        <Card key={asset.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity group-hover:scale-110 duration-700">
                                {getIcon(asset.collateral_type)}
                            </div>
                            <CardHeader className="pb-2 p-8">
                                <Badge className="bg-indigo-50 text-indigo-700 border-none font-black text-[9px] tracking-widest px-3 py-1 uppercase w-fit mb-2">{asset.collateral_type.replace('_', ' ')}</Badge>
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight">{asset.description}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                        <div>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Declared Value</p>
                                            <p className="text-lg font-black text-slate-900">₦{parseFloat(asset.estimated_market_value).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Forced Sale</p>
                                            <p className="text-sm font-bold text-rose-600">₦{parseFloat(asset.forced_sale_value).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{asset.status}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] h-5 border-slate-200 text-slate-400 font-black uppercase">REF: {asset.document_reference || 'N/A'}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {collaterals?.length === 0 && (
                        <div className="md:col-span-2 py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                            <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900">No Assets Pledged</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2">Add collateral to strengthen your loan eligibility and access higher credit limits.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: AI Appraisal Note */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Intelligence</h3>
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[32px] overflow-hidden relative group">
                    <Activity className="absolute bottom-[-10px] left-[-10px] h-32 w-32 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Automated Valuation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                            "Weezy Prime uses local market data from Nigerian marketplaces (Jiji, Cars45) to cross-reference declared collateral values in real-time."
                        </p>
                        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valuation Accuracy</span>
                            <Badge className="bg-emerald-500 text-white border-none font-black text-[10px]">94%</Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Policy Update
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "For Land/Property assets, a valid C of O or Registered Deed of Assignment must be submitted to our legal unit within 48 hours of pledging."
                    </p>
                </div>
            </div>
        </div>

        {/* Pledge Modal */}
        {isPledging && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Gavel className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Pledge Asset</CardTitle>
                        <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Register Secured Collateral</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Category</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    value={formData.collateral_type}
                                    onChange={e => setFormData({...formData, collateral_type: e.target.value})}
                                >
                                    <option value="VEHICLE">Vehicle (Car/Truck)</option>
                                    <option value="LAND_PROPERTY">Land or Building</option>
                                    <option value="MARKETABLE_SECURITIES">Stocks / Treasury Bills</option>
                                    <option value="INVENTORY_COMMODITY">Business Inventory</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Description</Label>
                                <Input placeholder="e.g. Mercedes GLK 350, 2015 model" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estimated Market Value (₦)</Label>
                                <Input placeholder="0.00" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-indigo-600 text-xl" value={formData.estimated_market_value} onChange={e => setFormData({...formData, estimated_market_value: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title Document Ref</Label>
                                <Input placeholder="e.g. RC Number / Deed Ref" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.document_reference} onChange={e => setFormData({...formData, document_reference: e.target.value})} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsPledging(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-indigo-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 border-none" onClick={handlePledge} disabled={pledgeMutation.isPending}>
                            {pledgeMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Pledge'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default LoanCollateral;
