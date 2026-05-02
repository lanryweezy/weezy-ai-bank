import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, MessageSquare, PhoneCall, Calendar, CheckCircle2, AlertCircle, RefreshCw, TrendingDown } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const LoanRecoveryDashboard = () => {
  const { data: actions, isLoading, refetch } = useQuery({
    queryKey: ['recoveryActions'],
    queryFn: () => apiClient('/recovery/actions/recent'),
    refetchInterval: 30000,
  });

  const scanMutation = useMutation({
    mutationFn: () => apiClient('/recovery/scan-overdue', { method: 'POST' }),
    onSuccess: () => {
      toast.success('AI Recovery Scan Started');
      refetch();
    },
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'DELINQUENT': return 'bg-yellow-100 text-yellow-700';
      case 'DEFAULT': return 'bg-orange-100 text-orange-700';
      case 'RECOVERY': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                AI Collections & Recovery <ShieldAlert className="h-6 w-6 text-orange-600" />
            </h1>
            <p className="text-gray-600 mt-1">Personalized, AI-driven debt recovery for the Nigerian credit market.</p>
          </div>
          <Button onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className={`mr-2 h-4 w-4 ${scanMutation.isPending ? 'animate-spin' : ''}`} /> Run AI Recovery Scan
          </Button>
        </div>

        {/* Recovery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { label: 'Delinquent Volume', value: '₦12.4M', icon: TrendingDown, color: 'red' },
                { label: 'Active Reminders', value: '458', icon: MessageSquare, color: 'blue' },
                { label: 'AI Success Rate', value: '68%', icon: CheckCircle2, color: 'green' },
                { label: 'Legal Escallations', value: '12', icon: ShieldAlert, color: 'orange' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                                <h3 className="text-xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Actions */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">Recent AI Recovery Actions</CardTitle>
                    <CardDescription>Automated personalized messages sent to delinquent borrowers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {actions?.length > 0 ? (
                            actions.map((action: any) => (
                                <div key={action.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStageColor(action.stage)}>{action.stage}</Badge>
                                            <span className="text-[10px] text-gray-400 font-mono">Loan #{action.loan_account_id}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{new Date(action.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-700 leading-relaxed italic">"{action.ai_drafted_message}"</p>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">via SMS</Badge>
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter text-green-600 border-green-200 bg-green-50">Delivered</Badge>
                                        </div>
                                        <Button size="sm" variant="ghost" className="h-7 text-[10px] text-indigo-600">View Account</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground italic border-2 border-dashed rounded-2xl">
                                No recovery actions logged yet. Run a scan to begin.
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Manual Controls */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-indigo-600" /> Collector Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-xs h-10 gap-3">
                        <MessageSquare className="h-4 w-4 text-blue-500" /> Send WhatsApp Warning
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs h-10 gap-3">
                        <PhoneCall className="h-4 w-4 text-green-500" /> Log Physical Visit
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs h-10 gap-3">
                        <Calendar className="h-4 w-4 text-orange-500" /> Record Repayment Promise
                    </Button>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-none shadow-sm ring-1 ring-red-200">
                <CardHeader>
                    <CardTitle className="text-xs font-bold flex items-center gap-2 text-red-800 uppercase">
                        <ShieldAlert className="h-4 w-4" /> CBN GSI Enforcement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                        The **Global Standing Instruction (GSI)** allows the bank to recover overdue debt from the borrower's accounts in other Nigerian banks via NIBSS.
                    </p>
                    <Button size="sm" variant="link" className="p-0 h-auto text-[10px] text-red-800 font-bold mt-2">Trigger GSI Request →</Button>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoanRecoveryDashboard;
