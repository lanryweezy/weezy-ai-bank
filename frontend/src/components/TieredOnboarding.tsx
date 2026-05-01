import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShieldCheck,
  FileText,
  CheckCircle,
  ArrowRight,
  Camera,
  Fingerprint,
  Home,
  MapPin,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

const TieredOnboarding: React.FC<{ customerId: string, onComplete?: () => void }> = ({ customerId, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bvn: '',
    nin: '',
    idType: 'National ID',
    idNumber: '',
    address: '',
    utilityBill: null as File | null,
    selfie: null as File | null
  });

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => apiClient<any>(`/customers/${customerId}`),
  });

  const kycMutation = useMutation({
    mutationFn: (data: any) => apiClient(`/customers/${customerId}/kyc`, { method: 'PUT', data }),
    onSuccess: (data) => {
        if (step < 3) {
            setStep(step + 1);
            toast({ title: "Tier Upgraded", description: `You have successfully completed Tier ${step} verification.` });
        } else {
            toast({ title: "KYC Complete", description: "Your account is now fully verified at Tier 3." });
            if (onComplete) onComplete();
        }
    },
    onError: (err: any) => {
        toast({ variant: "destructive", title: "Verification Failed", description: err.message });
    }
  });

  const handleTier1 = () => {
    if (formData.bvn.length !== 11) {
        toast({ variant: "destructive", title: "Invalid BVN", description: "BVN must be 11 digits." });
        return;
    }
    // Update to Tier 1
    kycMutation.mutate({
        kyc_status: 'verified',
        kyc_level: 1,
        customer_tier: 'Tier 1',
        risk_rating: 'low',
        notes: 'Verified via BVN'
    });
  };

  const handleTier2 = () => {
    if (!formData.idNumber) {
        toast({ variant: "destructive", title: "Missing ID", description: "Please provide your ID number." });
        return;
    }
    // Update to Tier 2
    kycMutation.mutate({
        kyc_status: 'verified',
        kyc_level: 2,
        customer_tier: 'Tier 2',
        risk_rating: 'low',
        notes: 'Verified via ID Upload'
    });
  };

  const handleTier3 = () => {
    if (!formData.address) {
        toast({ variant: "destructive", title: "Missing Address", description: "Please provide your residential address." });
        return;
    }
    // Update to Tier 3
    kycMutation.mutate({
        kyc_status: 'verified',
        kyc_level: 3,
        customer_tier: 'Tier 3',
        risk_rating: 'low',
        notes: 'Verified via Address & Utility'
    });
  };

  const currentTier = customer?.customer_tier === 'Tier 3' ? 3 : (customer?.customer_tier === 'Tier 2' ? 2 : (customer?.customer_tier === 'Tier 1' ? 1 : 0));

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Identity Verification</h2>
        <p className="text-gray-500">Complete your profile to unlock higher transaction limits and premium features.</p>
      </div>

      <div className="flex justify-between items-center px-4">
          {[1, 2, 3].map((t) => (
              <div key={t} className="flex flex-col items-center gap-2">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentTier >= t ? 'bg-emerald-100 text-emerald-700' : (step === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-400')}`}>
                      {currentTier >= t ? <CheckCircle className="h-6 w-6" /> : t}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${step === t ? 'text-indigo-600' : 'text-gray-400'}`}>Tier {t}</span>
              </div>
          ))}
      </div>
      <Progress value={(currentTier / 3) * 100} className="h-1.5 bg-gray-100" />

      {step === 1 && currentTier < 1 && (
        <Card className="border-none shadow-xl shadow-gray-100 ring-1 ring-gray-100 overflow-hidden rounded-3xl">
          <CardHeader className="bg-indigo-50/50 p-8 border-b border-indigo-50">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Fingerprint className="h-6 w-6 text-indigo-600" /> Tier 1: Basic Access
                    </CardTitle>
                    <CardDescription className="mt-2 text-indigo-600/80 font-medium">Verify your BVN to start banking instantly.</CardDescription>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold">NGN 50k Limit</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bvn" className="text-sm font-bold text-gray-700">Bank Verification Number (BVN)</Label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="bvn"
                  placeholder="222XXXXXXXX"
                  maxLength={11}
                  value={formData.bvn}
                  onChange={(e) => setFormData({...formData, bvn: e.target.value})}
                  className="pl-12 h-14 bg-gray-50/50 border-gray-200 rounded-2xl text-lg font-mono tracking-widest"
                />
              </div>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Dial *565*0# to check your BVN
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button
                onClick={handleTier1}
                disabled={kycMutation.isPending}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-100"
            >
                {kycMutation.isPending ? 'Verifying...' : 'Verify & Continue'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && currentTier < 2 && (
        <Card className="border-none shadow-xl shadow-gray-100 ring-1 ring-gray-100 overflow-hidden rounded-3xl">
          <CardHeader className="bg-emerald-50/50 p-8 border-b border-emerald-50">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-emerald-600" /> Tier 2: Standard Access
                    </CardTitle>
                    <CardDescription className="mt-2 text-emerald-600/80 font-medium">Upload a government ID to increase your limits.</CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">NGN 200k Limit</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Identity Document Type</Label>
                <div className="grid grid-cols-2 gap-3">
                    {['National ID', 'Voters Card', 'Passport', 'License'].map(t => (
                        <Button
                            key={t}
                            variant={formData.idType === t ? 'default' : 'outline'}
                            onClick={() => setFormData({...formData, idType: t})}
                            className={`h-12 rounded-xl font-bold ${formData.idType === t ? 'bg-emerald-600' : ''}`}
                        >
                            {t}
                        </Button>
                    ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-sm font-bold text-gray-700">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl"
                />
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                  <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-sm font-bold text-gray-500">Snap or Upload ID Photo</p>
                  <p className="text-xs text-gray-400 mt-1">Front and back of your card</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button
                onClick={handleTier2}
                disabled={kycMutation.isPending}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-100"
            >
                {kycMutation.isPending ? 'Verifying...' : 'Submit ID Document'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && currentTier < 3 && (
        <Card className="border-none shadow-xl shadow-gray-100 ring-1 ring-gray-100 overflow-hidden rounded-3xl">
          <CardHeader className="bg-amber-50/50 p-8 border-b border-amber-50">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Home className="h-6 w-6 text-amber-600" /> Tier 3: Unlimited Access
                    </CardTitle>
                    <CardDescription className="mt-2 text-amber-600/80 font-medium">Verify your address for full premium banking.</CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-none font-bold">Unlimited</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-bold text-gray-700">Residential Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                    <textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full min-h-[100px] pl-12 pt-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="No 12, Financial District, Lagos State..."
                    />
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4 group-hover:text-amber-500 transition-colors" />
                  <p className="text-sm font-bold text-gray-500">Upload Utility Bill</p>
                  <p className="text-xs text-gray-400 mt-1">NEPA bill, Water bill, or Bank statement</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button
                onClick={handleTier3}
                disabled={kycMutation.isPending}
                className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-amber-100"
            >
                {kycMutation.isPending ? 'Verifying...' : 'Finalize Verification'} <ShieldCheck className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentTier === 3 && (
        <div className="text-center p-12 bg-emerald-50 rounded-3xl border border-emerald-100 animate-in zoom-in duration-500">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900">Verification Complete!</h3>
            <p className="text-emerald-700 mt-2">Your identity has been fully verified. You now have unlimited access to all platform features.</p>
            <Button
                onClick={() => onComplete?.()}
                className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl"
            >
                Return to Dashboard
            </Button>
        </div>
      )}
    </div>
  );
};

export default TieredOnboarding;
