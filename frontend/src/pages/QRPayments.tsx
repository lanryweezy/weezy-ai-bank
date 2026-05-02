import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, ScanLine, Smartphone, Download, Share2, Copy, CheckCircle2, Loader2, Landmark, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const QRPayments = () => {
  const [step, setStep] = useState(1); // 1: Select, 2: Generate/Receive, 3: Scan/Pay
  const [qrAmount, setQrAmount] = useState('');
  const [scannedPayload, setScannedPayload] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<any>(null);

  const { data: myQRs, refetch: refetchMyQRs } = useQuery({
    queryKey: ['myQRs'],
    queryFn: () => apiClient('/qr/my-codes'),
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiClient('/qr/generate', { 
        method: 'POST', 
        body: JSON.stringify({ 
            account_number: '9990011223', // Demo
            qr_type: data.amount ? 'DYNAMIC' : 'STATIC',
            amount: data.amount ? parseFloat(data.amount) : null,
            account_name: 'WEEZY BANK CUSTOMER'
        }) 
    }),
    onSuccess: () => {
      toast.success('QR Code generated!');
      refetchMyQRs();
    },
  });

  const scanMutation = useMutation({
    mutationFn: (payload: string) => apiClient('/qr/scan', { method: 'POST', body: JSON.stringify({ qr_payload: payload }) }),
    onSuccess: (data) => {
      setRecipientInfo(data);
      if (data.amount) setPayAmount(data.amount.toString());
      setStep(4); // Pay details step
    },
    onError: () => toast.error('Invalid QR Code'),
  });

  const payMutation = useMutation({
    mutationFn: (data: any) => apiClient('/qr/pay', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Payment Sent Successfully!');
      setStep(5); // Success step
    },
  });

  const handleSimulatedScan = () => {
      // Simulating a real NIBSS NQR scan
      const mockPayload = "NQR|01|999|9990011223|5000|Lunch at Ikeja|REF123";
      scanMutation.mutate(mockPayload);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                NQR Contactless Payments <QrCode className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">NIBSS standard QR payments for personal and business use.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setStep(1)} variant={step === 1 ? 'default' : 'outline'} className={step === 1 ? 'bg-indigo-600' : ''}>
                Overview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Left: Action Selection */}
           <div className="space-y-6">
              {step === 1 && (
                <div className="grid grid-cols-1 gap-4">
                    <Card className="cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all border-none shadow-sm ring-1 ring-gray-200" onClick={() => setStep(2)}>
                        <CardContent className="flex items-center gap-6 p-8">
                            <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
                                <QrCode className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Generate QR</h3>
                                <p className="text-sm text-gray-500">Create a code to receive money instantly.</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all border-none shadow-sm ring-1 ring-gray-200" onClick={() => setStep(3)}>
                        <CardContent className="flex items-center gap-6 p-8">
                            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                                <ScanLine className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Scan to Pay</h3>
                                <p className="text-sm text-gray-500">Pay a merchant or friend via their NQR code.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
              )}

              {step === 2 && (
                <Card className="border-none shadow-xl ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle>Receive Money (NQR)</CardTitle>
                        <CardDescription>Specify an amount or leave blank for a flexible payment code.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Amount (Optional - ₦)</Label>
                            <Input placeholder="e.g. 5,000" value={qrAmount} onChange={e => setQrAmount(e.target.value)} />
                        </div>
                        <Button className="w-full bg-indigo-600 h-12" onClick={() => generateMutation.mutate({ amount: qrAmount })}>
                            {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />} 
                            Generate My Code
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Back</Button>
                    </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="border-none shadow-2xl ring-1 ring-gray-200 bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <CardHeader className="text-center relative z-10">
                        <CardTitle>Simulated Scanner</CardTitle>
                        <CardDescription className="text-slate-400">Pointing camera at NQR code...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-12 relative z-10">
                        <div className="w-64 h-64 border-4 border-indigo-500 rounded-3xl flex items-center justify-center relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                            
                            <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan" />
                            <QrCode className="h-20 w-20 text-slate-700 opacity-50" />
                        </div>
                        <Button className="mt-12 bg-white text-slate-900 hover:bg-slate-100" onClick={handleSimulatedScan}>
                            {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />} Simulate Scan Result
                        </Button>
                    </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card className="border-none shadow-xl ring-1 ring-indigo-100">
                    <div className="bg-indigo-600 p-6 text-white text-center">
                        <Badge className="bg-white/20 text-white border-none mb-2">SCAN SUCCESS</Badge>
                        <h3 className="text-2xl font-bold">{recipientInfo.account_name}</h3>
                        <p className="text-xs text-indigo-100 mt-1 uppercase tracking-widest">{recipientInfo.bank_name} (Code: {recipientInfo.bank_code})</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label>Amount to Pay (₦)</Label>
                            <Input 
                                type="number" 
                                value={payAmount} 
                                onChange={e => setPayAmount(e.target.value)} 
                                readOnly={!!recipientInfo.amount}
                                className="text-xl font-bold h-12"
                            />
                        </div>
                        <Button className="w-full h-12 bg-indigo-600 text-lg shadow-lg shadow-indigo-100" 
                            onClick={() => payMutation.mutate({
                                qr_payload: "NQR|01|999|9990011223|5000|Lunch at Ikeja|REF123",
                                sender_account: "9990011223",
                                amount: parseFloat(payAmount),
                                pin: "1234"
                            })}
                            disabled={payMutation.isPending}
                        >
                            {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />} Confirm & Pay
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setStep(3)}>Back to Scan</Button>
                    </CardContent>
                </Card>
              )}

              {step === 5 && (
                <Card className="border-none shadow-2xl ring-1 ring-green-100 text-center py-12">
                   <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="h-12 w-12" />
                   </div>
                   <CardHeader>
                        <CardTitle className="text-2xl text-green-800">Transaction Successful</CardTitle>
                        <CardDescription>Your NQR payment has been settled instantly.</CardDescription>
                   </CardHeader>
                   <CardFooter>
                        <Button className="w-full bg-indigo-600" onClick={() => setStep(1)}>Done</Button>
                   </CardFooter>
                </Card>
              )}
           </div>

           {/* Right: History / My Codes */}
           <div className="space-y-6">
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">My Collection Codes</CardTitle>
                            <CardDescription>Your personal NQR identifiers.</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50">NIBSS Verified</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myQRs?.length > 0 ? (
                                myQRs.map((qr: any) => (
                                    <div key={qr.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-2 rounded-lg border">
                                                <QrCode className="h-6 w-6 text-slate-800" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{qr.qr_type} Code</p>
                                                <p className="text-[10px] text-gray-500">{qr.amount ? `₦${parseFloat(qr.amount).toLocaleString()}` : 'Flexible Amount'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" onClick={() => toast.success('Link copied')}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground italic text-xs">
                                    No QR codes generated yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Landmark className="h-4 w-4 text-blue-400" /> NQR Interoperability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Weezy Bank NQR codes follow the Nigerian national standard. You can accept payments from **any** bank app in Nigeria including GTB, Zenith, and Kuda.
                        </p>
                    </CardContent>
                </Card>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan {
          position: absolute;
          animation: scan 3s infinite linear;
          width: 100%;
        }
      `}</style>
    </Layout>
  );
};

export default QRPayments;
