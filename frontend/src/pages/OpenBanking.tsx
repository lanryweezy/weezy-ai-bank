import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, ShieldCheck, Globe, ExternalLink, Trash2, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const OpenBanking = () => {
  const { data: apps, isLoading: loadingApps } = useQuery({
    queryKey: ['openBankingApps'],
    queryFn: () => apiClient('/open-banking/apps'),
  });

  const { data: myConsents, refetch: refetchConsents } = useQuery({
    queryKey: ['myConsents'],
    queryFn: () => apiClient('/open-banking/me'), # Placeholder
  });

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Nigerian Open Banking <Lock className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Control which fintech apps have secure access to your bank data.</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-none px-4 py-1">STET STANDARD</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Authorized Apps Column */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Authorized Applications</h3>
              <div className="space-y-4">
                {apps?.length > 0 ? (
                    apps.map((app: any) => (
                        <Card key={app.id} className="border-none shadow-sm ring-1 ring-gray-200 hover:ring-indigo-300 transition-all overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-3 rounded-2xl">
                                        <Smartphone className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold">{app.app_name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Permissions: READ_BALANCES, READ_HISTORY</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-green-100 text-green-700 border-none px-3">ACTIVE</Badge>
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-gray-50/50">
                        <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 italic">No external apps connected. Your data is private.</p>
                    </div>
                )}
              </div>
           </div>

           {/* Security & Info Sidebar */}
           <div className="space-y-6">
              <Card className="border-none shadow-xl ring-1 ring-indigo-200 bg-indigo-600 text-white">
                 <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" /> Secure API Control
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-[11px] text-indigo-100 leading-relaxed mb-4">
                        Weezy Bank follows the **Nigerian Open Banking Standard**. We never share your PIN or password with third-party apps. You remain in 100% control of your consent.
                    </p>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs">
                        Learn about Open Banking
                    </Button>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Recent Consent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-1 rounded-full mt-0.5">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold">Kuda Finance Authorized</p>
                            <p className="text-[9px] text-gray-400">2 days ago • Permanent Consent</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-orange-100 p-1 rounded-full mt-0.5">
                            <AlertCircle className="h-3 w-3 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold">PiggyVest Consent Expired</p>
                            <p className="text-[9px] text-gray-400">Yesterday • Auto-revoked</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default OpenBanking;
