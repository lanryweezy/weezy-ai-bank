import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, ScanLine, Smartphone, Download, Share2, Copy, CheckCircle2, Loader2, Landmark, ShieldCheck, Cpu, Zap, Activity, Globe, Sparkles, X, Scan, ChevronRight, RefreshCw } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

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
      toast.success('QR Code generated! Node active.');
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
    onError: () => toast.error('Invalid QR Protocol'),
  });

  const payMutation = useMutation({
    mutationFn: (data: any) => apiClient('/qr/pay', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('P2B Settlement Successful!');
      setStep(5); // Success step
    },
  });

  const handleSimulatedScan = () => {
      const mockPayload = "NQR|01|999|9990011223|5000|Lunch at Ikeja|REF123";
      scanMutation.mutate(mockPayload);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                NQR Protocol <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><QrCode className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Globe className="h-4 w-4 text-indigo-500" /> NIBSS Standard Contactless Settlement
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setStep(1)} variant="outline" className="rounded-2xl h-14 px-8 border-white/5 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                Network Status
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Left: Action Selection */}
           <div className="space-y-10">
              {step === 1 && (
                <div className="grid grid-cols-1 gap-8">
                    <Card className="obsidian-card border-none hover:border-indigo-500/30 transition-all duration-700 group cursor-pointer overflow-hidden p-10 flex items-center gap-10 shadow-2xl" onClick={() => setStep(2)}>
                        <div className="bg-indigo-600/10 p-6 rounded-[32px] border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:rotate-6 shadow-xl">
                            <QrCode className="h-12 w-12" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Initialize Receive</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Synthesize a new collection node.</p>
                        </div>
                        <ChevronRight className="ml-auto h-8 w-8 text-slate-800 group-hover:text-white transition-colors" />
                    </Card>

                    <Card className="obsidian-card border-none hover:border-emerald-500/30 transition-all duration-700 group cursor-pointer overflow-hidden p-10 flex items-center gap-10 shadow-2xl" onClick={() => setStep(3)}>
                        <div className="bg-emerald-500/10 p-6 rounded-[32px] border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:-rotate-6 shadow-xl">
                            <ScanLine className="h-12 w-12" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Execute Payment</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Scan a merchant or peer node to settle.</p>
                        </div>
                        <ChevronRight className="ml-auto h-8 w-8 text-slate-800 group-hover:text-white transition-colors" />
                    </Card>
                </div>
              )}

              {step === 2 && (
                <Card className="obsidian-card border-indigo-500/20 overflow-hidden shadow-2xl">
                    <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02] text-center">
                        <CardTitle className="text-3xl font-black italic tracking-tighter text-white uppercase">Receive Assets</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4">Node Payload Configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 space-y-10">
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Target Value (Optional - ₦)</Label>
                            <Input placeholder="0.00" className="h-20 rounded-[32px] bg-white/5 border-white/5 px-10 font-black text-3xl text-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all tracking-tighter" value={qrAmount} onChange={e => setQrAmount(e.target.value)} />
                        </div>
                        <div className="pt-6 flex gap-6">
                            <Button variant="ghost" className="flex-1 h-18 rounded-[28px] font-black text-[11px] uppercase tracking-widest text-slate-600 hover:text-white" onClick={() => setStep(1)}>Abort</Button>
                            <Button className="flex-[2] bg-indigo-600 h-18 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none" onClick={() => generateMutation.mutate({ amount: qrAmount })}>
                                {generateMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin mr-3" /> : <QrCode className="h-6 w-6 mr-3" />} 
                                Synthesize Node
                            </Button>
                        </div>
                    </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="obsidian-card border-none overflow-hidden relative shadow-2xl min-h-[500px] flex flex-col">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 pointer-events-none" />
                    <CardHeader className="text-center relative z-10 p-12">
                        <CardTitle className="text-3xl font-black italic tracking-tighter text-white uppercase">Optical Scanner</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4 italic">Pointing at NQR Node...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center flex-1 relative z-10 py-10">
                        <div className="w-72 h-72 border-[12px] border-indigo-600/10 rounded-[60px] flex items-center justify-center relative overflow-hidden group shadow-[0_0_80px_rgba(99,102,241,0.1)] bg-slate-950">
                            <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl opacity-40" />
                            <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl opacity-40" />
                            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl opacity-40" />
                            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl opacity-40" />
                            
                            <div className="w-full h-1 bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,1)] animate-scan z-20" />
                            <QrCode className="h-24 w-24 text-slate-800 opacity-30 animate-pulse" />
                        </div>
                        <Button className="mt-16 bg-white text-black hover:bg-slate-200 rounded-[28px] px-12 h-16 font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all border-none italic" onClick={handleSimulatedScan}>
                            {scanMutation.isPending ? <RefreshCw className="h-6 w-6 animate-spin mr-4" /> : <Smartphone className="h-6 w-6 mr-4" />} Simulate Capture
                        </Button>
                    </CardContent>
                    
                    <style>{`
                        @keyframes scan {
                          0%, 100% { top: 10%; opacity: 0.2; }
                          50% { top: 90%; opacity: 1; }
                        }
                        .animate-scan {
                          position: absolute;
                          animation: scan 3s infinite ease-in-out;
                          width: 80%;
                        }
                    `}</style>
                </Card>
              )}

              {step === 4 && recipientInfo && (
                <Card className="obsidian-card border-indigo-500/20 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="bg-indigo-600 p-14 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-transparent pointer-events-none" />
                        <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-black text-[9px] tracking-widest px-5 py-2 uppercase rounded-lg mb-8 relative z-10 italic">NODE VERIFIED</Badge>
                        <h3 className="text-4xl font-black italic tracking-tighter relative z-10 uppercase leading-none">{recipientInfo.account_name}</h3>
                        <p className="text-[10px] text-indigo-100 font-bold mt-4 uppercase tracking-[0.4em] relative z-10 opacity-70 italic">{recipientInfo.bank_name || 'WEEZY NODE'} • NUBAN: {recipientInfo.account_number}</p>
                    </div>
                    <CardContent className="p-14 space-y-12">
                        <div className="space-y-4 max-w-sm mx-auto">
                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1 text-center block italic">Authorized Value (₦)</Label>
                            <Input 
                                type="number" 
                                value={payAmount} 
                                onChange={e => setPayAmount(e.target.value)} 
                                readOnly={!!recipientInfo.amount}
                                className="h-24 rounded-[40px] bg-white/5 border-white/10 px-10 text-4xl font-black text-indigo-400 text-center shadow-2xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all tracking-tighter"
                            />
                        </div>
                        <div className="pt-6">
                            <Button className="w-full bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none" 
                                onClick={() => payMutation.mutate({
                                    qr_payload: "NQR|01|999|9990011223|5000|Lunch at Ikeja|REF123",
                                    sender_account: "9990011223",
                                    amount: parseFloat(payAmount),
                                    pin: "1234"
                                })}
                                disabled={payMutation.isPending}
                            >
                                {payMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />} EXECUTE SETTLEMENT
                            </Button>
                            <Button variant="ghost" className="w-full h-14 font-black text-[10px] uppercase tracking-widest text-slate-600 mt-6 hover:text-white" onClick={() => setStep(3)}>Restart Optical Scan</Button>
                        </div>
                    </CardContent>
                </Card>
              )}

              {step === 5 && (
                <Card className="obsidian-card border-emerald-500/20 overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] text-center py-24 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                   <div className="bg-emerald-500/10 text-emerald-400 w-32 h-32 rounded-[48px] border border-emerald-500/20 flex items-center justify-center mb-12 shadow-2xl rotate-6">
                        <CheckCircle2 className="h-16 w-16" />
                   </div>
                   <div className="space-y-4 px-12">
                        <CardTitle className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Settlement Cleared</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4 italic leading-relaxed">
                            P2B Transaction synchronized across national ledger nodes. Finality achieved.
                        </CardDescription>
                   </div>
                   <div className="mt-16 w-full max-w-sm px-12">
                        <Button className="w-full h-20 rounded-[32px] bg-indigo-600 text-white font-black text-lg italic tracking-tighter uppercase shadow-2xl active:scale-95 border-none" onClick={() => setStep(1)}>Done</Button>
                   </div>
                </Card>
              )}
           </div>

           {/* Right: History / My Codes */}
           <div className="space-y-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1 text-white text-center">Collection Matrix</h3>
                <Card className="obsidian-card border-none overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 border-b border-white/5 bg-white/[0.01] flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase">Static Identifiers</CardTitle>
                            <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em] mt-2 italic">Authorized P2P Inlets</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-indigo-400 border-indigo-500/20 bg-indigo-500/5 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg italic">NIBSS ACTIVE</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {myQRs?.length > 0 ? (
                                myQRs.map((qr: any) => (
                                    <div key={qr.id} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer">
                                        <div className="flex items-center gap-8">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:rotate-6 shadow-xl">
                                                <QrCode className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-white italic uppercase tracking-tight leading-none">{qr.qr_type} NODE</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 italic">{qr.amount ? `PAYLOAD: ₦${parseFloat(qr.amount).toLocaleString()}` : 'VARIABLE LIQUIDITY'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-600 hover:text-indigo-400 hover:bg-white/5 transition-all border border-white/5" onClick={() => toast.success('Reference indexed.')}>
                                                <Copy className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-600 hover:text-indigo-400 hover:bg-white/5 transition-all border border-white/5">
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 text-center text-slate-700 flex flex-col items-center">
                                    <Activity className="h-12 w-12 text-slate-900 mb-6 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic px-10 leading-relaxed opacity-40">Zero collection nodes registered in the current vault cycle.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="obsidian-card bg-slate-900 border-none shadow-2xl rounded-[40px] overflow-hidden relative group h-[280px] flex flex-col justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                        <Landmark className="h-32 w-32 text-indigo-400" />
                    </div>
                    <CardHeader className="p-10 pb-4 relative z-10">
                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 flex items-center gap-4 italic leading-none">
                            <Cpu className="h-5 w-5" /> Switch Interoperability
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-10 pb-10 relative z-10">
                        <p className="text-sm text-slate-400 italic leading-relaxed font-medium">
                            "Weezy NQR nodes adhere to national biometric standards. Verified inbound liquidity from GTBank, Zenith, and Kuda nodes is processed in <span className="text-emerald-400 font-black">0.42ms</span>."
                        </p>
                    </CardContent>
                </Card>
           </div>
        </div>
    </div>
  );
};

export default QRPayments;
