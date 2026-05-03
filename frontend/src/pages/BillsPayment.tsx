import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, Tv, Zap, Wifi, Landmark, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const categoryIcons: any = {
  'AIRTIME': <Phone className="h-5 w-5" />,
  'CABLE_TV': <Tv className="h-5 w-5" />,
  'ELECTRICITY': <Zap className="h-5 w-5" />,
  'INTERNET': <Wifi className="h-5 w-5" />,
  'GOVERNMENT': <Landmark className="h-5 w-5" />,
};

const BillsPayment = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBiller, setSelectedBiller] = useState<any>(null);
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [debitAccount, setDebitAccount] = useState('');
  const [step, setStep] = useState(1);

  const { data: myAccounts } = useQuery<any[]>({
    queryKey: ['myAccounts'],
    queryFn: () => apiClient('/corebanking/alm/accounts/me'),
  });

  const { data: billers, isLoading: loadingBillers } = useQuery({
    queryKey: ['billers', selectedCategory],
    queryFn: () => apiClient(`/bills/billers${selectedCategory ? `?category=${selectedCategory}` : ''}`),
  });

  const validateMutation = useMutation({
    mutationFn: (data: any) => apiClient('/bills/validate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setValidationResult(data);
      setStep(3);
    },
    onError: (err: any) => toast.error(err.message || 'Validation failed'),
  });

  const payMutation = useMutation({
    mutationFn: (data: any) => apiClient('/bills/pay', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setStep(4);
      setValidationResult(data);
      toast.success('Payment Successful!');
    },
    onError: (err: any) => toast.error(err.message || 'Payment failed'),
  });

  const handleBillerSelect = (biller: any) => {
    setSelectedBiller(biller);
    setStep(2);
  };

  const handleNext = () => {
    if (!identifier) {
      toast.error('Please enter a valid identifier');
      return;
    }
    if (selectedBiller.requires_validation) {
      validateMutation.mutate({ biller_code: selectedBiller.biller_code, customer_identifier: identifier });
    } else {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      setStep(3);
    }
  };

  const handlePay = () => {
    payMutation.mutate({
      biller_code: selectedBiller.biller_code,
      amount: parseFloat(amount),
      customer_identifier: identifier,
      account_number: '9990011223', // Demo
    });
  };

  const reset = () => {
    setStep(1);
    setSelectedBiller(null);
    setIdentifier('');
    setAmount('');
    setValidationResult(null);
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                LIFESTYLE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Zap className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Instant Utility, Power, and Airtime Settlement Core.</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1.5 font-black text-[9px] tracking-widest uppercase">Real-time Provisioning</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
           {/* Categories Sidebar */}
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Services</h3>
              <div className="grid grid-cols-1 gap-2">
                {['AIRTIME', 'DATA', 'CABLE_TV', 'ELECTRICITY', 'GOVERNMENT'].map((cat) => (
                    <Button 
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-4 h-14 rounded-2xl transition-all duration-300 ${selectedCategory === cat ? 'bg-indigo-600 shadow-xl shadow-indigo-200 translate-x-2' : 'hover:bg-indigo-50 text-slate-600'}`}
                    onClick={() => { setSelectedCategory(cat); setStep(1); }}
                    >
                    <div className={`p-2 rounded-lg ${selectedCategory === cat ? 'bg-white/20' : 'bg-slate-100'}`}>
                        {categoryIcons[cat] || <Zap className="h-4 w-4" />}
                    </div>
                    <span className="font-bold text-xs uppercase tracking-widest">{cat.replace('_', ' ')}</span>
                    </Button>
                ))}
              </div>
           </div>

           {/* Main Area */}
           <div className="lg:col-span-3">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {loadingBillers ? (
                    [1,2,3,4,5,6].map(i => <Card key={i} className="h-40 animate-pulse bg-slate-50 border-none rounded-[32px]" />)
                  ) : billers?.map((biller: any) => (
                    <Card 
                      key={biller.id} 
                      className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden"
                      onClick={() => handleBillerSelect(biller)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="bg-slate-50 p-5 rounded-3xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                            {categoryIcons[biller.category] || <Zap className="h-8 w-8" />}
                        </div>
                        <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{biller.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {step === 2 && (
                <Card className="max-w-md border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden mx-auto">
                  <CardHeader className="bg-slate-50/50 p-10 pb-6 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black italic tracking-tighter">
                        <div className="bg-indigo-600 p-2 rounded-lg">{categoryIcons[selectedBiller.category]}</div>
                        {selectedBiller.name}
                    </CardTitle>
                    <CardDescription className="font-medium mt-2">Provisioning details required for settlement.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Debit Account</Label>
                        <select 
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                            value={debitAccount}
                            onChange={e => setDebitAccount(e.target.value)}
                        >
                            <option value="">Select account to debit</option>
                            {myAccounts?.map((acc: any) => (
                                <option key={acc.account_number} value={acc.account_number}>
                                    {acc.account_number} (₦{parseFloat(acc.ledger_balance).toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            {selectedBiller.requires_validation ? 'Smartcard / Meter Reference' : 'Recipient Phone Number'}
                        </Label>
                        <Input 
                            placeholder={selectedBiller.requires_validation ? "e.g. 45012345678" : "08137502933"} 
                            value={identifier}
                            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg"
                            onChange={e => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Amount (₦)</Label>
                        <Input 
                            type="number" 
                            placeholder="1,000" 
                            value={amount}
                            className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg"
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <Button className="w-full bg-indigo-600 h-14 rounded-2xl font-black shadow-xl shadow-indigo-100 mt-4 text-white border-none" onClick={handleNext} disabled={validateMutation.isPending || !debitAccount}>
                        {validateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-3 text-white" /> : null}
                        {selectedBiller.requires_validation ? 'Verify Credential' : 'Continue to Payment'}
                    </Button>
                    <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-slate-400" onClick={() => setStep(1)}>Cancel Request</Button>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="max-w-md border-none shadow-2xl ring-1 ring-indigo-200 bg-white rounded-[40px] overflow-hidden mx-auto">
                   <div className="bg-indigo-600 p-10 text-white text-center relative">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Sparkles className="h-20 w-20" />
                        </div>
                        <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Confirm Transaction</p>
                        <h3 className="text-5xl font-black tracking-tighter">₦{parseFloat(amount).toLocaleString()}</h3>
                   </div>
                   <CardContent className="p-10 space-y-5">
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                        <span className="text-slate-400 text-[10px] font-black uppercase">Service</span>
                        <span className="font-black text-slate-900 text-sm">{selectedBiller.name}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                        <span className="text-slate-400 text-[10px] font-black uppercase">Identifier</span>
                        <span className="font-mono font-black text-slate-900 text-sm">{identifier}</span>
                      </div>
                      {validationResult?.customer_name && (
                        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Verified Owner</span>
                            <span className="font-black text-indigo-700 text-sm">{validationResult.customer_name}</span>
                        </div>
                      )}
                      <div className="pt-4 space-y-4">
                        <Button className="w-full bg-indigo-600 h-16 rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-100 active:scale-95 transition-all text-white border-none" onClick={handlePay} disabled={payMutation.isPending}>
                            {payMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin mr-3 text-white" /> : <ShieldCheck className="h-6 w-6 mr-3 text-white" />}
                            Confirm & Pay Now
                        </Button>
                        <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => setStep(2)}>Modify Details</Button>
                      </div>
                   </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card className="max-w-md border-none shadow-2xl ring-1 ring-green-100 bg-white rounded-[40px] text-center py-20 mx-auto">
                   <div className="bg-green-50 text-green-600 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-50 animate-bounce">
                        <CheckCircle2 className="h-12 w-12" />
                   </div>
                   <CardHeader>
                        <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">Settlement Successful</CardTitle>
                        <CardDescription className="font-bold text-slate-500 uppercase tracking-widest mt-2">₦{parseFloat(amount).toLocaleString()} paid to {selectedBiller.name}</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6 pt-6 px-10">
                        {validationResult?.token && (
                            <div className="p-6 bg-slate-900 rounded-3xl border-2 border-dashed border-indigo-500/30 relative group">
                                <div className="absolute top-2 right-4 text-[8px] font-black text-indigo-400 uppercase tracking-widest">Prepaid Token</div>
                                <p className="text-2xl font-mono font-black tracking-[0.2em] text-white py-2">{validationResult.token}</p>
                                <Button variant="ghost" className="mt-2 text-[9px] font-black text-indigo-400 uppercase hover:bg-white/5 h-8" onClick={() => copyToClipboard(validationResult.token)}>Copy Token</Button>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reference</p>
                            <p className="text-xs font-mono font-bold text-slate-600">{validationResult?.provider_reference}</p>
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-indigo-600 font-black text-white border-none shadow-xl shadow-indigo-100" onClick={reset}>Close Receipt</Button>
                   </CardContent>
                </Card>
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillsPayment;
