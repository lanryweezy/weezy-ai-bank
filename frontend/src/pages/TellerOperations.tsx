import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, User, Lock, Unlock, ArrowDownLeft, ArrowUpRight, ShieldCheck, RefreshCw, Activity, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const TellerOperations = () => {
  const [activeTab, setActiveTab] = useState('DEPOSIT'); // DEPOSIT, WITHDRAWAL, VAULT
  const [validatedAccount, setValidatedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer_account_number: '',
    amount: '',
    narration: '',
    depositor_name: '',
    depositor_phone: ''
  });

  const { data: tillStatus, isLoading: loadingStatus, refetch } = useQuery({
    queryKey: ['tillStatus'],
    queryFn: () => apiClient('/corebanking/teller/till/status'),
  });

  const validateAccountMutation = useMutation({
    mutationFn: (nuban: string) => apiClient(`/corebanking/alm/accounts/verify?account_number=${nuban}`),
    onSuccess: (data) => {
        setValidatedAccount(data);
    },
    onError: () => {
        setValidatedAccount(null);
    }
  });

  const handleAccountBlur = () => {
    if (formData.customer_account_number.length === 10) {
        validateAccountMutation.mutate(formData.customer_account_number);
    }
  };

  const openTillMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/teller/till/open', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Till opened successfully. Ready for transactions.');
      refetch();
    },
  });

  const closeTillMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/teller/till/close', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Till closed. Shift ended.');
      refetch();
    },
  });

  const postTxnMutation = useMutation({
    mutationFn: (data: any) => apiClient('/corebanking/teller/post', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      toast.success(`Transaction posted successfully. Ref: ${res.reference}`);
      setFormData({ customer_account_number: '', amount: '', narration: '', depositor_name: '', depositor_phone: '' });
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Transaction failed'),
  });

  const handlePost = () => {
      if(!formData.customer_account_number || !formData.amount) {
          toast.error("Account and Amount are required.");
          return;
      }
      
      const payload = {
          ...formData,
          posting_type: activeTab === 'DEPOSIT' ? 'CASH_DEPOSIT' : 'CASH_WITHDRAWAL',
          amount: parseFloat(formData.amount)
      };
      
      postTxnMutation.mutate(payload);
  };

  const isTillOpen = tillStatus?.status === 'OPEN';

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                TELLER OPS <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Store className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Branch Cash Management & Over-the-Counter Transactions.</p>
          </div>
          {tillStatus && (
            <div className="flex gap-3">
                {isTillOpen ? (
                    <Button onClick={() => closeTillMutation.mutate()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                        <Lock className="mr-2 h-4 w-4" /> End Shift (Close Till)
                    </Button>
                ) : (
                    <Button onClick={() => openTillMutation.mutate()} className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                        <Unlock className="mr-2 h-4 w-4" /> Start Shift (Open Till)
                    </Button>
                )}
            </div>
          )}
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Till Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        {tillStatus?.status || 'UNKNOWN'}
                        <div className={`w-3 h-3 rounded-full ${isTillOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-2">{tillStatus?.branch_name || 'Branch Loading...'}</p>
                </CardContent>
            </Card>
            <Card className="border-none shadow-xl ring-1 ring-indigo-500/20 rounded-3xl bg-indigo-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Activity className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Current Cash Balance</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-4xl font-black tracking-tighter drop-shadow-md">
                        ₦{parseFloat(tillStatus?.current_cash_balance || 0).toLocaleString()}
                    </div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-slate-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Holding Limit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-700 tracking-tight">
                        ₦{parseFloat(tillStatus?.max_holding_limit || 5000000).toLocaleString()}
                    </div>
                    <div className="w-full bg-slate-200 h-2 mt-4 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${parseFloat(tillStatus?.current_cash_balance) > parseFloat(tillStatus?.max_holding_limit) * 0.8 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min((parseFloat(tillStatus?.current_cash_balance || 0) / parseFloat(tillStatus?.max_holding_limit || 1)) * 100, 100)}%` }} 
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        {isTillOpen ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Actions Panel */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[32px] overflow-hidden">
                        <div className="flex border-b border-slate-100 bg-slate-50/50">
                            {['DEPOSIT', 'WITHDRAWAL', 'VAULT'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-600 bg-white shadow-sm border-b-2 border-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <CardContent className="p-10 space-y-6">
                            {(activeTab === 'DEPOSIT' || activeTab === 'WITHDRAWAL') && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer NUBAN</Label>
                                            <div className="relative">
                                                <Input 
                                                    value={formData.customer_account_number}
                                                    onChange={e => setFormData({...formData, customer_account_number: e.target.value})}
                                                    onBlur={handleAccountBlur}
                                                    placeholder="e.g. 0011223344" 
                                                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" 
                                                />
                                                {validateAccountMutation.isPending && (
                                                    <div className="absolute right-4 top-4 h-6 w-6">
                                                        <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                                                    </div>
                                                )}
                                            </div>
                                            {validatedAccount && (
                                                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                                                        <User className="h-3 w-3 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-950 uppercase tracking-tight">{validatedAccount.account_name}</p>
                                                        <p className="text-[9px] text-indigo-600 font-bold">BAL: ₦{parseFloat(validatedAccount.ledger_balance).toLocaleString()}</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase">Verified</Badge>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount (₦)</Label>
                                            <Input 
                                                type="number"
                                                value={formData.amount}
                                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                                placeholder="0.00" 
                                                className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-xl text-indigo-600" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Narration</Label>
                                        <Input 
                                            value={formData.narration}
                                            onChange={e => setFormData({...formData, narration: e.target.value})}
                                            placeholder={`CASH ${activeTab} BY ...`} 
                                            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-medium" 
                                        />
                                    </div>

                                    {activeTab === 'DEPOSIT' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Depositor Name</Label>
                                                <Input 
                                                    value={formData.depositor_name}
                                                    onChange={e => setFormData({...formData, depositor_name: e.target.value})}
                                                    placeholder="Third-party name" 
                                                    className="h-12 rounded-xl bg-white border-none px-4" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Depositor Phone</Label>
                                                <Input 
                                                    value={formData.depositor_phone}
                                                    onChange={e => setFormData({...formData, depositor_phone: e.target.value})}
                                                    placeholder="080..." 
                                                    className="h-12 rounded-xl bg-white border-none px-4" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        className={`w-full h-16 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl text-white border-none ${activeTab === 'DEPOSIT' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
                                        onClick={handlePost}
                                        disabled={postTxnMutation.isPending}
                                    >
                                        {postTxnMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : null}
                                        Post {activeTab}
                                    </Button>
                                </>
                            )}
                            
                            {activeTab === 'VAULT' && (
                                <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                                    <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Vault Operations</h4>
                                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Request cash from the main branch vault or retire excess holding.</p>
                                    <div className="flex justify-center gap-4 mt-8">
                                        <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white font-bold">Request Cash</Button>
                                        <Button className="bg-indigo-600 h-12 rounded-2xl text-white font-bold shadow-lg shadow-indigo-100">Retire Cash</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    <Card className="bg-slate-950 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <CardHeader className="p-8 pb-4 relative z-10">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Compliance Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 relative z-10">
                            <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">
                                CBN AML/CFT regulations mandate that all cash deposits exceeding ₦5,000,000 for individuals must be flagged. Ensure depositor details are captured accurately for third-party deposits.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        ) : (
            <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                <div className="bg-white p-8 rounded-[32px] shadow-sm inline-block mb-6 ring-1 ring-slate-100">
                    <Lock className="h-12 w-12 text-slate-300" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Till is Closed</h4>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm mx-auto">You must open your till and start your shift before posting any over-the-counter transactions.</p>
                <Button onClick={() => openTillMutation.mutate()} className="mt-8 rounded-2xl h-14 px-10 bg-indigo-600 hover:bg-indigo-700 shadow-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                    Start Shift
                </Button>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default TellerOperations;
