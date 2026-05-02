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
            customer_id: 1, // Demo
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
      <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Tier 3 Identity Verification</h1>
            <p className="text-gray-500">Securely verify your identity using AI-powered biometrics.</p>
        </div>

        {status?.verification_status === 'VERIFIED' ? (
            <Card className="border-none shadow-2xl ring-1 ring-green-100 text-center py-16">
                <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="h-14 w-14" />
                </div>
                <CardHeader>
                    <CardTitle className="text-3xl text-green-800">You are Fully Verified</CardTitle>
                    <CardDescription>Your account has been upgraded to **Tier 3**.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="max-w-xs mx-auto space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Daily Limit</span>
                            <span className="font-bold text-gray-900">₦5,000,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Intl. Transfers</span>
                            <span className="font-bold text-green-600">Enabled</span>
                        </div>
                    </div>
                    <Button variant="outline" className="mt-8" onClick={() => window.history.back()}>Return to Dashboard</Button>
                </CardContent>
            </Card>
        ) : (
            <div className="flex justify-center">
                {step === 1 && (
                    <Card className="max-w-md border-none shadow-xl ring-1 ring-gray-200">
                        <CardHeader className="text-center">
                            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCheck className="h-8 w-8 text-indigo-600" />
                            </div>
                            <CardTitle>Verify Your Identity</CardTitle>
                            <CardDescription>Follow 2 simple steps to complete your Nigerian KYC.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">1</div>
                                    <div>
                                        <p className="text-sm font-bold">Liveness Check</p>
                                        <p className="text-xs text-gray-500">Take a quick selfie to confirm you are present.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">2</div>
                                    <div>
                                        <p className="text-sm font-bold">ID Matching</p>
                                        <p className="text-xs text-gray-500">Upload your NIN, Driver's License or Passport.</p>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full bg-indigo-600 h-12 shadow-lg" onClick={() => setStep(2)}>
                                Get Started
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="max-w-md border-none shadow-xl ring-1 ring-gray-200 w-full">
                        <CardHeader className="text-center">
                            <CardTitle>Step 1: Take a Selfie</CardTitle>
                            <CardDescription>Position your face in the center of the frame.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center border-4 border-dashed border-slate-200 relative overflow-hidden">
                                <Camera className="h-16 w-16 text-slate-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            <Button className="w-full bg-indigo-600 h-12" onClick={handleCaptureSelfie}>
                                <Camera className="mr-2 h-5 w-5" /> Capture Selfie
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="max-w-md border-none shadow-xl ring-1 ring-gray-200 w-full">
                        <CardHeader className="text-center">
                            <CardTitle>Step 2: Upload ID</CardTitle>
                            <CardDescription>Upload a clear photo of your government-issued ID.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Document Type</Label>
                                <select 
                                    className="w-full p-2 rounded-lg border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                >
                                    <option value="NIN_SLIP">NIN Slip / Card</option>
                                    <option value="DRIVERS_LICENSE">Driver's License</option>
                                    <option value="INTERNATIONAL_PASSPORT">Passport</option>
                                </select>
                            </div>
                            <div 
                                className="aspect-[3/2] bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 cursor-pointer hover:bg-indigo-50/50 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileCheck className="h-10 w-10 text-indigo-300 mb-2" />
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Tap to Upload</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadID} />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center px-4">
                                Ensure all text on the ID is clearly readable and no glare is present on the photo.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {step === 4 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-gray-200 w-full text-center py-12 bg-slate-900 text-white">
                        <div className="relative inline-block mb-8">
                             <div className="w-24 h-24 border-4 border-indigo-500/30 rounded-full animate-ping absolute inset-0" />
                             <div className="w-24 h-24 border-4 border-indigo-500 rounded-full flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                             </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center justify-center gap-2">
                                <Sparkles className="h-6 w-6 text-yellow-400" /> AI Analyzing...
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Weezy AI is matching your selfie against the ID biometrics. This usually takes 5-10 seconds.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                <p>Extracting NIN Data...</p>
                                <p>Analyzing facial nodes...</p>
                                <p>Verifying against NIMC database...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 5 && (
                    <Card className="max-w-md border-none shadow-2xl ring-1 ring-green-100 text-center py-12">
                        <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                             <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <CardHeader>
                             <CardTitle className="text-2xl text-green-800">Verification Success!</CardTitle>
                             <CardDescription>
                                Weezy AI has confirmed your identity. Your account is now fully active.
                             </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full bg-indigo-600" onClick={() => window.location.href='/dashboard'}>Go to Dashboard</Button>
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
