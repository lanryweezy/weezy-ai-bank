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
  const [step, setStep] = useState(1); // 1: Biller Select, 2: Details/Validate, 3: Confirm, 4: Success
  const [validationResult, setValidationResult] = useState<any>(null);

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
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Bills & Utility Payments <Zap className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-gray-600 mt-1">Pay for Airtime, Data, Power, and Cable TV instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Categories Sidebar */}
           <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase ml-2">Categories</Label>
              {['AIRTIME', 'DATA', 'CABLE_TV', 'ELECTRICITY', 'GOVERNMENT'].map((cat) => (
                <Button 
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 h-12 rounded-xl ${selectedCategory === cat ? 'bg-indigo-600' : 'hover:bg-indigo-50'}`}
                  onClick={() => { setSelectedCategory(cat); setStep(1); }}
                >
                  {categoryIcons[cat] || <Zap className="h-5 w-5" />}
                  <span className="capitalize">{cat.replace('_', ' ').toLowerCase()}</span>
                </Button>
              ))}
           </div>

           {/* Main Area */}
           <div className="lg:col-span-3">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loadingBillers ? (
                    [1,2,3].map(i => <Card key={i} className="h-32 animate-pulse bg-gray-100 border-none" />)
                  ) : billers?.map((biller: any) => (
                    <Card 
                      key={biller.id} 
                      className="cursor-pointer hover:scale-[1.03] transition-all border-none shadow-sm ring-1 ring-gray-200"
                      onClick={() => handleBillerSelect(biller)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-3">
                            {categoryIcons[biller.category] || <Zap className="h-6 w-6 text-indigo-600" />}
                        </div>
                        <p className="font-bold text-sm">{biller.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {step === 2 && (
                <Card className="max-w-md border-none shadow-xl ring-1 ring-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {categoryIcons[selectedBiller.category]} {selectedBiller.name}
                    </CardTitle>
                    <CardDescription>Enter your details to proceed with the payment.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{selectedBiller.requires_validation ? 'Smartcard/Meter Number' : 'Phone Number'}</Label>
                        <Input 
                            placeholder={selectedBiller.requires_validation ? "e.g. 45012345678" : "08137502933"} 
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Amount (₦)</Label>
                        <Input 
                            type="number" 
                            placeholder="1,000" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <Button className="w-full bg-indigo-600" onClick={handleNext} disabled={validateMutation.isPending}>
                        {validateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {selectedBiller.requires_validation ? 'Validate Account' : 'Continue'}
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Back</Button>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="max-w-md border-none shadow-xl ring-1 ring-gray-200 overflow-hidden">
                   <div className="bg-indigo-600 p-6 text-white text-center">
                        <p className="text-indigo-100 text-xs uppercase tracking-widest mb-1">Confirm Payment</p>
                        <h3 className="text-3xl font-bold">₦{parseFloat(amount).toLocaleString()}</h3>
                   </div>
                   <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 text-sm">Biller</span>
                        <span className="font-bold text-sm">{selectedBiller.name}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 text-sm">ID</span>
                        <span className="font-bold text-sm">{identifier}</span>
                      </div>
                      {validationResult?.customer_name && (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500 text-sm">Customer</span>
                            <span className="font-bold text-sm text-indigo-600">{validationResult.customer_name}</span>
                        </div>
                      )}
                      <Button className="w-full bg-indigo-600 h-12 mt-4 shadow-lg shadow-indigo-200" onClick={handlePay} disabled={payMutation.isPending}>
                        {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Confirm & Pay Now'}
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>Back</Button>
                   </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card className="max-w-md border-none shadow-2xl ring-1 ring-green-100 text-center py-10">
                   <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="h-12 w-12" />
                   </div>
                   <CardHeader>
                        <CardTitle className="text-2xl text-green-700">Payment Successful</CardTitle>
                        <CardDescription>₦{parseFloat(amount).toLocaleString()} paid to {selectedBiller.name}</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                        {validationResult?.token && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-xs text-gray-500 uppercase mb-2">Prepaid Token</p>
                                <p className="text-xl font-mono font-bold tracking-widest text-indigo-600">{validationResult.token}</p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground italic">Reference: {validationResult?.provider_reference}</p>
                        <Button className="w-full mt-6" onClick={reset}>Done</Button>
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
