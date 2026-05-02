import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertCircle, CheckCircle2, UserCheck, Activity, Search, RefreshCw, Info } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const ComplianceDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: alerts, isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => apiClient('/risk/alerts/elevated'),
    refetchInterval: 30000,
  });

  const assessMutation = useMutation({
    mutationFn: (customerId: number) => apiClient(`/risk/${customerId}/assess`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Risk assessment completed by Weezy AI');
      refetchAlerts();
    },
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Compliance & AML Control <ShieldAlert className="h-6 w-6 text-red-600" />
            </h1>
            <p className="text-gray-600 mt-1">AI-driven risk monitoring and Nigerian regulatory compliance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Alerts Column */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Elevated Risk Alerts</CardTitle>
                        <CardDescription>Real-time notifications from the AI Auditor.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => refetchAlerts()}>
                        <RefreshCw className={`h-4 w-4 ${loadingAlerts ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {alerts?.length > 0 ? (
                            alerts.map((alert: any) => (
                                <div key={alert.id} className="flex items-start justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                                    <div className="flex gap-4">
                                        <div className="p-2 bg-red-100 rounded-full h-fit">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{alert.event_type}</p>
                                            <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                                            <p className="text-[10px] text-gray-400 mt-2">{new Date(alert.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <Badge className={getRiskColor(alert.severity)}>{alert.severity}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground italic border-2 border-dashed rounded-2xl">
                                No critical AML alerts at this time.
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Quick Actions & Stats */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Manual Risk Check</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Enter Customer ID</Label>
                        <div className="flex gap-2">
                            <Input placeholder="e.g. 123" id="risk_cust_id" />
                            <Button size="icon" onClick={() => {
                                const id = (document.getElementById('risk_cust_id') as HTMLInputElement).value;
                                if(id) assessMutation.mutate(parseInt(id));
                            }} disabled={assessMutation.isPending}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {assessMutation.isPending && (
                        <div className="p-4 bg-indigo-50 rounded-lg flex items-center gap-3">
                            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                            <span className="text-xs text-indigo-700 italic">Weezy is analyzing transaction patterns...</span>
                        </div>
                    )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 text-white border-none shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-400" /> CBN AML Guidelines
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3 text-[11px] text-gray-400">
                    <p>• High-velocity movements in Tier 1 accounts must be flagged.</p>
                    <p>• Sanction list matches require immediate account suspension.</p>
                    <p>• PEPs (Politically Exposed Persons) require Enhanced Due Diligence (EDD).</p>
                    <p>• Cash transactions above ₦5,000,000 (Individual) or ₦10,000,000 (Corporate) must be reported to NFIU.</p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComplianceDashboard;
