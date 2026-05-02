import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, ShieldCheck, AlertTriangle, Search, Activity, RefreshCw, Lock, Trash2, CheckCircle2, BookOpen } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ChequeManagement = () => {
  const [isStopping, setIsStopping] = useState(false);
  const [stopData, setStopData] = useState({
      cheque_number: '',
      account_number: '9990011223',
      reason: 'LOST',
      details: ''
  });

  const { data: books, isLoading, refetch } = useQuery({
    queryKey: ['myChequeBooks'],
    queryFn: () => apiClient('/corebanking/cheques/leaves/my-books'),
  });

  const stopMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/cheques/leaves/stop-payment', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Stop payment order registered.');
      setIsStopping(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Action failed'),
  });

  const handleStop = () => {
      if(!stopData.cheque_number) {
          toast.error("Cheque number is required.");
          return;
      }
      stopMutation.mutate(stopData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'UNUSED': return <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-black uppercase">Unused</Badge>;
        case 'STOPPED': return <Badge className="bg-rose-50 text-rose-700 border-none text-[8px] font-black uppercase">Stopped</Badge>;
        case 'LOST': return <Badge className="bg-amber-50 text-amber-700 border-none text-[8px] font-black uppercase">Lost</Badge>;
        case 'USED': return <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase">Used</Badge>;
        default: return <Badge variant="outline" className="text-[8px]">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                CHEQUE VAULT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><BookOpen className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Manage leaf lifecycle, stop payments, and digital clearing.</p>
          </div>
          <Button onClick={() => setIsStopping(true)} className="rounded-2xl h-12 px-6 bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
            <Lock className="mr-2 h-4 w-4" /> Stop Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Books Column */}
            <div className="lg:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Issued Inventory</h3>
                {books?.map((book: any) => (
                    <Card key={book.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group">
                        <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 border border-slate-100">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">Range: {book.start_leaf_number} - {book.end_leaf_number}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Account: {book.account_number} • {book.total_leaves} Leaves</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase">Active Book</Badge>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-5 md:grid-cols-10 gap-3">
                            {book.leaves.map((leaf: any) => (
                                <div key={leaf.id} className="group relative">
                                    <div className={`aspect-square rounded-xl border-2 flex items-center justify-center text-[10px] font-mono font-black transition-all cursor-default
                                        ${leaf.status === 'UNUSED' ? 'border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600' : 
                                          leaf.status === 'STOPPED' ? 'border-rose-100 bg-rose-50 text-rose-600' :
                                          leaf.status === 'USED' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                                        {leaf.leaf_number.slice(-2)}
                                    </div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                        <div className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-xl whitespace-nowrap">
                                            Leaf #{leaf.leaf_number} • {leaf.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {books?.length === 0 && (
                    <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                        <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-slate-900">No Cheque Books Issued</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2">Request a new cheque book from your branch to start using paper payments.</p>
                    </div>
                )}
            </div>

            {/* Side Column */}
            <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Operational Pulse</h3>
                <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[32px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Fraud Protection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10 text-white">
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                            "Always report lost or stolen cheques immediately. Stop payment instructions are effective within 2 seconds of system registration."
                        </p>
                    </CardContent>
                </Card>

                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
                    <AlertTriangle className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Clearing Notice
                    </h4>
                    <p className="text-xs text-indigo-600 italic leading-relaxed font-medium relative z-10">
                        "Inbound cheques are cleared via NACS in 2 business days (T+1). Ensure sufficient funds are available for all issued cheques to avoid N5,000 bounce fees."
                    </p>
                </div>
            </div>
        </div>

        {/* Stop Payment Modal */}
        {isStopping && (
             <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-rose-600 text-white p-10 text-center relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Lock className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter">Stop Payment</CardTitle>
                        <CardDescription className="text-rose-100 font-medium opacity-80 mt-2 italic uppercase text-[10px] tracking-widest">Digital Block Instruction</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cheque Number</Label>
                                <Input placeholder="e.g. 00012345" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-mono font-black text-lg text-rose-600" value={stopData.cheque_number} onChange={e => setStopData({...stopData, cheque_number: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Blocking Reason</Label>
                                <select 
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-rose-600/20 transition-all"
                                    value={stopData.reason}
                                    onChange={e => setStopData({...stopData, reason: e.target.value})}
                                >
                                    <option value="LOST">Lost Cheque</option>
                                    <option value="STOLEN">Stolen Cheque</option>
                                    <option value="WRONG_AMOUNT">Wrong Amount Issued</option>
                                    <option value="DISPUTED_TRANSACTION">Disputed Transaction</option>
                                    <option value="OTHERS">Others</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Additional Details</Label>
                                <Input placeholder="Optional context" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-medium" value={stopData.details} onChange={e => setStopData({...stopData, details: e.target.value})} />
                            </div>
                        </div>
                        <div className="p-5 bg-rose-50 rounded-3xl border border-rose-100 flex gap-4">
                            <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                            <p className="text-[10px] text-rose-800 leading-relaxed font-medium italic">
                                Blocking a cheque is permanent. A stop-payment fee may apply to your account upon approval.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 flex gap-3">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]" onClick={() => setIsStopping(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-rose-600 h-14 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl shadow-rose-100 border-none" onClick={handleStop} disabled={stopMutation.isPending}>
                            {stopMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Stop'}
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )}
      </div>
    </Layout>
  );
};

export default ChequeManagement;
