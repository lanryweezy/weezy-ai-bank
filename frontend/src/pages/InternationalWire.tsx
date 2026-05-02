import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Plane, Landmark, FileText, CheckCircle2, ShieldCheck, RefreshCw, Send, Loader2, Info } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const InternationalWire = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: Review, 3: Success
  const [wireData, setWireData] = useState({
    beneficiary_name: '',
    beneficiary_account: '',
    beneficiary_bank_name: '',
    beneficiary_bank_swift_bic: '',
    amount: '',
    currency: 'USD',
    purpose_of_payment: 'Tuition Fees',
    source_account_number: 'DOM-USD-001'
  });

  const { data: wires, refetch: refetchWires } = useQuery({
    queryKey: ['myWires'],
    queryFn: () => apiClient('/fx/wire/history'),
  });

  const initiateMutation = useMutation({
    mutationFn: (data: any) => apiClient('/fx/wire/initiate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Wire Request Submitted. Awaiting Compliance Review.');
      setStep(3);
      refetchWires();
    },
    onError: (err: any) => toast.error(err.message || 'Wire initiation failed'),
  });

  const handleNext = () => {
    if (!wireData.beneficiary_name || !wireData.beneficiary_account || !wireData.beneficiary_bank_swift_bic || !wireData.amount) {
        toast.error('Please fill all required fields');
        return;
    }
    setStep(2);
  };

  const handleConfirm = () => {
    initiateMutation.mutate({ ...wireData, amount: parseFloat(wireData.amount), customer_id: 1 });
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                International SWIFT Transfer <Plane className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Send funds worldwide via our correspondent banking network.</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1">DOMICILIARY ACCESS</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Wire Form Column */}
           <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <Card className="border-none shadow-xl ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle>Transfer Details</CardTitle>
                        <CardDescription>Enter the recipient's bank information accurately.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Beneficiary Name</Label>
                                <Input placeholder="Legal name of recipient" value={wireData.beneficiary_name} onChange={e => setWireData({...wireData, beneficiary_name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Beneficiary Account / IBAN</Label>
                                <Input placeholder="Account or IBAN" value={wireData.beneficiary_account} onChange={e => setWireData({...wireData, beneficiary_account: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input placeholder="e.g. JPMorgan Chase" value={wireData.beneficiary_bank_name} onChange={e => setWireData({...wireData, beneficiary_bank_name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank SWIFT / BIC</Label>
                                <Input placeholder="8 or 11 characters" maxLength={11} value={wireData.beneficiary_bank_swift_bic} onChange={e => setWireData({...wireData, beneficiary_bank_swift_bic: e.target.value.toUpperCase()})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <div className="flex gap-2">
                                    <Input type="number" placeholder="0.00" className="text-lg font-bold" value={wireData.amount} onChange={e => setWireData({...wireData, amount: e.target.value})} />
                                    <select 
                                        className="p-2 rounded-lg border bg-white text-xs font-bold outline-none"
                                        value={wireData.currency}
                                        onChange={e => setWireData({...wireData, currency: e.target.value})}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Purpose of Payment</Label>
                                <Input placeholder="e.g. School Fees, Personal" value={wireData.purpose_of_payment} onChange={e => setWireData({...wireData, purpose_of_payment: e.target.value})} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 justify-end py-4">
                        <Button className="bg-indigo-600 px-8" onClick={handleNext}>Review Wire Request</Button>
                    </CardFooter>
                </Card>
              )}

              {step === 2 && (
                <Card className="border-none shadow-xl ring-2 ring-indigo-500 overflow-hidden">
                    <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Review SWIFT Message</CardTitle>
                            <p className="text-indigo-100 text-xs mt-1">Please verify all details before final submission.</p>
                        </div>
                        <Globe className="h-10 w-10 opacity-20" />
                    </div>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-y-6">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Recipient</p>
                                <p className="text-sm font-bold">{wireData.beneficiary_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Account / IBAN</p>
                                <p className="text-sm font-mono font-bold">{wireData.beneficiary_account}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Bank</p>
                                <p className="text-sm font-bold">{wireData.beneficiary_bank_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">SWIFT Code</p>
                                <p className="text-sm font-mono font-bold text-indigo-600">{wireData.beneficiary_bank_swift_bic}</p>
                            </div>
                            <div className="col-span-2 border-t pt-4">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Total Amount to Wire</p>
                                <h3 className="text-3xl font-bold">{wireData.currency} {parseFloat(wireData.amount).toLocaleString()}</h3>
                                <p className="text-[10px] text-slate-400 mt-1 italic">+ $25.00 SWIFT Settle Fee</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 flex gap-3 py-4">
                        <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Edit</Button>
                        <Button className="flex-[2] bg-indigo-600" onClick={handleConfirm} disabled={initiateMutation.isPending}>
                            {initiateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />} 
                            Submit Wire Transfer
                        </Button>
                    </CardFooter>
                </Card>
              )}

              {step === 3 && (
                <Card className="border-none shadow-2xl ring-1 ring-green-100 text-center py-16">
                    <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="h-14 w-14" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-3xl text-green-800">Request Received</CardTitle>
                        <CardDescription>Your international wire is now being processed by our Compliance Team.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl max-w-sm mx-auto border border-dashed">
                             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Transaction Ref</p>
                             <p className="text-lg font-mono font-bold tracking-widest text-indigo-600">SWIFT-WZY-204598</p>
                        </div>
                        <Button variant="outline" className="mt-8" onClick={() => setStep(1)}>Make Another Transfer</Button>
                    </CardContent>
                </Card>
              )}
           </div>

           {/* History & Compliance Sidebar */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <History className="h-4 w-4 text-indigo-600" /> Recent Wires
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {wires?.length > 0 ? (
                            wires.map((w: any) => (
                                <div key={w.id} className="p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-bold">{w.beneficiary_name}</p>
                                        <Badge variant="outline" className="text-[8px] h-4 uppercase">{w.status}</Badge>
                                    </div>
                                    <p className="text-[10px] text-gray-500">{w.currency} {parseFloat(w.amount).toLocaleString()}</p>
                                    <p className="text-[8px] text-gray-400 mt-2 font-mono uppercase">{w.reference_number}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground italic text-xs">No wire history.</div>
                        )}
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 text-indigo-400">
                        <Info className="h-4 w-4" /> CBN Compliance (Nigeria)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-[10px] font-bold text-indigo-200">Form M Requirement</p>
                        <p className="text-[9px] text-slate-400 mt-1">Transfers for trade purposes above $10,000 require an approved Form M from CBN.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-[10px] font-bold text-indigo-200">PTA / BTA Allowances</p>
                        <p className="text-[9px] text-slate-400 mt-1">Personal Travel Allowance is capped at $4,000 per quarter per individual.</p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default InternationalWire;
