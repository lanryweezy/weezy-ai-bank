import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, UserCheck, ShieldCheck, FileCheck, RefreshCw, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const Onboarding = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: Selfie, 3: ID Upload, 4: Verifying, 5: Success
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [docType, setDocType] = useState('NIN_SLIP');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => JSON.parse(localStorage.getItem('user') || '{}'),
  });

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['biometricStatus'],
    queryFn: () => apiClient('/biometric/me'),
    retry: false,
  });

  const verifyMutation = useMutation({
    mutationFn: (data: any) => apiClient('/biometric/verify-face', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
        if (data.match_confirmed) {
            setStep(5);
            toast.success('Identity Verified Successfully!');
        } else {
            setStep(1);
            toast.error(`Verification Failed: ${data.reasoning}`);
        }
    },
    onError: (err: any) => {
        setStep(1);
        toast.error(err.message || 'Verification Error');
    }
  });

  const handleCaptureSelfie = () => {
    // Simulating camera capture
    setSelfie("data:image/jpeg;base64,...mock_selfie...");
    setStep(3);
  };

  const handleUploadID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDoc(reader.result as string);
        setStep(4);
        // Trigger AI Verification
        verifyMutation.mutate({
            customer_id: user?.id || 1,
            selfie_b64: selfie,
            document_b64: reader.result as string,
            document_type: docType
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto py-10">
        <div className="text-center space-y-3">
            <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1 uppercase tracking-widest font-black text-[9px]">Security Protocol</Badge>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Digital Identity Vault</h1>
            <p className="text-slate-500 font-medium max-w-lg mx-auto">Verify your biometric data using Weezy's proprietary AI Vision core to unlock Tier 3 banking privileges.</p>
        </div>

        {status?.verification_status === 'VERIFIED' ? (
            <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 text-center py-20 bg-white rounded-[40px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <ShieldCheck className="h-64 w-64 text-indigo-600" />
                </div>
                <div className="bg-emerald-50 text-emerald-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 rotate-3">
                    <ShieldCheck className="h-12 w-12" />
                </div>
                <CardHeader className="relative z-10">
                    <CardTitle className="text-4xl font-black text-slate-900 tracking-tighter">Identity Authenticated</CardTitle>
                    <CardDescription className="text-slate-500 font-bold mt-2 uppercase tracking-widest">Account Status: Tier 3 (Full Access)</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Daily Limit</p>
                            <p className="text-xl font-black text-slate-900">₦5,000,000</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Global Access</p>
                            <p className="text-xl font-black text-emerald-600 flex items-center justify-center gap-2">ENABLED <CheckCircle2 className="h-4 w-4" /></p>
                        </div>
                    </div>
                    <Button variant="ghost" className="mt-8 font-bold text-indigo-600 hover:bg-indigo-50 px-8 h-12 rounded-2xl" onClick={() => window.location.href='/dashboard'}>
                        Go to Control Center
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <div className="flex justify-center">
                {step === 1 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[32px] p-2 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white rounded-[24px] text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles className="h-20 w-20" />
                            </div>
                            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                <UserCheck className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">KYC Authentication</CardTitle>
                            <CardDescription className="text-indigo-100 font-medium opacity-80 mt-2">Required for Tier 3 limits & FX banking.</CardDescription>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-5 group">
                                    <div className="bg-slate-100 text-slate-400 font-black h-10 w-10 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">1</div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Liveness Biometrics</p>
                                        <p className="text-xs text-slate-500">Real-time facial integrity check.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group">
                                    <div className="bg-slate-100 text-slate-400 font-black h-10 w-10 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">2</div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Credential Scan</p>
                                        <p className="text-xs text-slate-500">NIN Slip, Driver's License or Passport.</p>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full bg-indigo-600 h-14 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all text-white border-none" onClick={() => setStep(2)}>
                                Begin Secure Session
                            </Button>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[32px] w-full overflow-hidden">
                        <CardHeader className="text-center p-8 pb-4">
                            <CardTitle className="text-2xl font-black">Biometric Capture</CardTitle>
                            <CardDescription className="font-medium">Position your face within the frame.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-10 space-y-8">
                            <div className="aspect-square bg-slate-50 rounded-[40px] flex items-center justify-center border-4 border-dashed border-indigo-100 relative overflow-hidden group">
                                <Camera className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/40 border-dashed rounded-full" />
                            </div>
                            <Button className="w-full bg-indigo-600 h-14 rounded-2xl font-black shadow-lg shadow-indigo-100" onClick={handleCaptureSelfie}>
                                <Camera className="mr-3 h-5 w-5" /> Authenticate Liveness
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[32px] w-full overflow-hidden">
                        <CardHeader className="text-center p-8 pb-4">
                            <CardTitle className="text-2xl font-black text-slate-900">ID Document Scan</CardTitle>
                            <CardDescription className="font-medium">NIMC / FRSC Standard credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-10 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Type</Label>
                                <select 
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                >
                                    <option value="NIN_SLIP">NIN Slip (Digital/Card)</option>
                                    <option value="DRIVERS_LICENSE">Driver's License (FRSC)</option>
                                    <option value="INTERNATIONAL_PASSPORT">E-Passport</option>
                                </select>
                            </div>
                            <div 
                                className="aspect-[3/2] bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 cursor-pointer hover:bg-indigo-50/50 transition-all relative overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileCheck className="h-12 w-12 text-indigo-300 mb-3" />
                                <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">Click to Scan ID</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadID} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 4 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-slate-900 bg-slate-950 text-white rounded-[40px] w-full text-center py-16 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />
                        <div className="relative inline-block mb-12">
                             <div className="w-32 h-32 border-4 border-indigo-500/20 rounded-full animate-ping absolute inset-0" />
                             <div className="w-32 h-32 border-4 border-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                                <RefreshCw className="h-12 w-12 animate-spin text-indigo-400" />
                             </div>
                        </div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-3xl font-black flex items-center justify-center gap-3 italic">
                                <Sparkles className="h-7 w-7 text-yellow-400" /> AI REASONING
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium px-10">
                                Weezy AI Vision core is matching facial nodes and verifying NIN integrity with NIMC servers...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 mt-6">
                            <div className="space-y-3 text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" /> EXTRACTING DOCUMENT DATA
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-75" /> PERFORMING FACE MATCH
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-150" /> VERIFYING INTEGRITY
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 5 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-green-100 bg-white rounded-[40px] w-full text-center py-16">
                        <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-50 animate-bounce">
                             <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <CardHeader>
                             <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">Success!</CardTitle>
                             <CardDescription className="text-slate-500 font-bold uppercase tracking-widest mt-2 px-10">
                                Identity Confirmed. Welcome to Tier 3 Banking.
                             </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-10">
                            <Button className="w-full bg-indigo-600 h-14 rounded-2xl font-black shadow-xl shadow-indigo-100 text-white border-none" onClick={() => window.location.href='/dashboard'}>Launch Dashboard</Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default Onboarding;
