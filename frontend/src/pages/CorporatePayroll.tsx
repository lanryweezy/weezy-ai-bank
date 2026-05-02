import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, Search, FileJson, Activity, AlertTriangle, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const CorporatePayroll = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<number | null>(null);

  const { data: activeBatch, refetch: refetchBatch } = useQuery({
    queryKey: ['payrollBatch', activeBatchId],
    queryFn: () => apiClient(`/payroll/${activeBatchId}`),
    enabled: !!activeBatchId,
    refetchInterval: (data) => data?.status === 'AI_SCANNING' ? 3000 : false,
  });

  const uploadMutation = useMutation({
    mutationFn: (data: any) => apiClient('/payroll/upload', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      toast.success('Payroll uploaded. AI scan initiated.');
      setActiveBatchId(data.id);
      setIsUploading(false);
    },
    onError: (err: any) => toast.error(err.message || 'Upload failed'),
  });

  const disburseMutation = useMutation({
    mutationFn: (id: number) => apiClient(`/payroll/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Disbursement started!');
      refetchBatch();
    },
  });

  const handleDemoUpload = () => {
    const demoData = {
        corporate_customer_id: 1,
        items: [
            { recipient_name: "John Doe", recipient_account: "0011223344", recipient_bank_code: "058", amount: 150000 },
            { recipient_name: "Jane Smith", recipient_account: "9988776655", recipient_bank_code: "044", amount: 200000 },
            { recipient_name: "S. O. Adebayo", recipient_account: "0011223344", recipient_bank_code: "011", amount: 150000 } // Duplicate account check
        ]
    };
    uploadMutation.mutate(demoData);
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Corporate Payroll & Bulk Payments <Building2 className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">High-volume salary disbursement with AI-driven anomaly detection.</p>
          </div>
          <Button onClick={() => setIsUploading(true)} className="bg-indigo-600">
            <Upload className="mr-2 h-4 w-4" /> Upload Payroll File
          </Button>
        </div>

        {isUploading ? (
          <Card className="max-w-xl border-none shadow-xl ring-1 ring-gray-200">
            <CardHeader>
              <CardTitle>Payroll Instruction Upload</CardTitle>
              <CardDescription>Support for JSON and CSV salary schedules.</CardDescription>
            </CardHeader>
            <CardContent className="py-10 text-center border-2 border-dashed rounded-xl mx-6 mb-6">
                <FileJson className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500 mb-6">Drag and drop your payroll file or use demo data</p>
                <Button variant="outline" onClick={handleDemoUpload} disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? 'Processing...' : 'Upload Demo Payroll Data'}
                </Button>
            </CardContent>
          </Card>
        ) : activeBatch ? (
          <div className="space-y-6">
            {/* Batch Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Batch Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold font-mono">{activeBatch.batch_reference}</div>
                        <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-none">{activeBatch.status}</Badge>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">₦{parseFloat(activeBatch.total_amount).toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">{activeBatch.item_count} Employees</p>
                    </CardContent>
                </Card>
                <Card className={`border-none shadow-sm ring-1 ring-gray-200 ${activeBatch.ai_risk_score > 50 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase">AI Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold ${activeBatch.ai_risk_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {activeBatch.ai_risk_score || 'Scanning...'} / 100
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <ShieldCheck className="h-3 w-3 mr-1" /> Verified by Weezy AI
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Report */}
            {activeBatch.ai_anomaly_report && (
              <Card className="border-none shadow-lg ring-1 ring-red-200 bg-white">
                <CardHeader className="bg-red-50/50 border-b border-red-100">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" /> AI Audit Observations
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-2">
                        {activeBatch.ai_anomaly_report.anomalies?.map((a: string, i: number) => (
                            <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5" /> {a}
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50/50 justify-between py-3">
                    <p className="text-xs italic text-gray-500">Recommendation: {activeBatch.ai_anomaly_report.recommendation}</p>
                    {activeBatch.status === 'AWAITING_APPROVAL' && (
                        <Button size="sm" className="bg-indigo-600" onClick={() => disburseMutation.mutate(activeBatch.id)}>
                            Approve & Disburse
                        </Button>
                    )}
                </CardFooter>
              </Card>
            )}

            {/* Item List */}
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle>Payroll Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {activeBatch.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 p-2 rounded-lg">
                                        <Users className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{item.recipient_name}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">{item.recipient_account}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">₦{parseFloat(item.amount).toLocaleString()}</p>
                                    <Badge variant="outline" className="text-[9px] h-4">{item.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        ) : (
           <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-gray-50/50">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 italic">No payroll batches active. Start by uploading a salary schedule.</p>
           </div>
        )}
      </div>
    </Layout>
  );
};

export default CorporatePayroll;
