import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Download,
  FileText,
  Activity,
  Users,
  Key,
  ShieldCheck,
  Zap,
  Fingerprint,
  ChevronRight,
  Database
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SecurityDashboard: React.FC = () => {
  const { data: securityEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => [
        { id: '1', message: 'Anomalous Transfer Detected', severity: 'high', user: 'admin', timestamp: '2 mins ago', agent: 'FraudDetector-01' },
        { id: '2', message: 'Failed Login Attempt', severity: 'medium', user: 'j.doe', timestamp: '15 mins ago' },
        { id: '3', message: 'API Key Rotated', severity: 'low', user: 'system', timestamp: '1 hour ago' },
    ]
  });

  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient<any[]>('/admin/audit-logs').catch(() => [
        { id: '101', action: 'Update Account Balance', details: 'Added $5000.00 to savings', user: 'Staff-42', timestamp: '2023-11-15 14:22' },
        { id: '102', action: 'Approve Loan Application', details: 'LN-9921 Approved', user: 'Agent-Credit', timestamp: '2023-11-15 13:45' }
    ])
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge className="bg-rose-50 text-rose-700 border-none font-bold">Critical</Badge>;
      case 'medium': return <Badge className="bg-amber-50 text-amber-700 border-none font-bold">Warning</Badge>;
      case 'low': return <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">Info</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-indigo-600" /> Security Center
          </h2>
          <p className="text-gray-500 mt-1">Compliance monitoring, threat detection, and audit transparency.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold shadow-lg shadow-indigo-100">
            <FileText className="h-4 w-4 mr-2" />
            Security Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Security Score', value: '98%', icon: <Shield className="text-emerald-600" />, color: 'bg-emerald-50' },
            { label: 'Threat Alerts', value: '3', icon: <AlertTriangle className="text-rose-600" />, color: 'bg-rose-50' },
            { label: 'Logs Collected', value: '24.1k', icon: <Activity className="text-indigo-600" />, color: 'bg-indigo-50' },
            { label: 'Active Sessions', value: '12', icon: <Users className="text-amber-600" />, color: 'bg-amber-50' }
        ].map((stat, i) => (
            <Card key={i} className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            {React.cloneElement(stat.icon as React.ReactElement, { className: 'h-6 w-6' })}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Tabs defaultValue="events" className="w-full">
                <TabsList className="bg-gray-100 p-1 rounded-xl mb-6 w-full sm:w-auto">
                    <TabsTrigger value="events" className="rounded-lg px-6 font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Live Events
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="rounded-lg px-6 font-bold flex items-center gap-2 text-gray-500 data-[state=active]:text-indigo-600">
                        <Fingerprint className="h-4 w-4" /> Comprehensive Audit
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="space-y-4 outline-none">
                    {isLoadingEvents ? (
                        [1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                    ) : (
                        securityEvents?.map((event: any) => (
                            <Card key={event.id} className="group border-none bg-white shadow-sm ring-1 ring-gray-100 hover:ring-indigo-500 transition-all rounded-2xl overflow-hidden">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${event.severity === 'high' ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400'}`}>
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{event.message}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {event.user}
                                                </span>
                                                {event.agent && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Zap className="h-3 w-3" /> {event.agent}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {getSeverityBadge(event.severity)}
                                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{event.timestamp}</span>
                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="audit" className="space-y-4 outline-none">
                     {auditLogs?.map((log: any) => (
                        <Card key={log.id} className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-400 rounded-lg">
                                            <Eye className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{log.action}</p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{log.details}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 bg-indigo-50/30 border-indigo-100">
                                                    BY: {log.user}
                                                </Badge>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {log.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-gray-900">
                                        Trace <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-6">
            <Card className="border-none bg-indigo-900 text-white shadow-xl shadow-indigo-100 rounded-2xl overflow-hidden">
                <CardHeader className="p-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Enforcement
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                    {[
                        { label: '2FA Enforcement', active: true },
                        { label: 'Session Hardening', active: true },
                        { label: 'IP Whitelisting', active: false },
                        { label: 'Data Encryption', active: true }
                    ].map((policy, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                            <span className="text-xs font-bold text-indigo-100">{policy.label}</span>
                            {policy.active ? (
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-[10px]">Active</Badge>
                            ) : (
                                <Badge className="bg-white/10 text-white/40 border-transparent font-bold text-[10px]">Disabled</Badge>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                <CardHeader className="p-6">
                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Key className="h-4 w-4" /> Agent Vault
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-700">Credit Analyzer Access</p>
                        <div className="flex gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">READ</Badge>
                            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">WRITE</Badge>
                            <Badge className="bg-rose-50 text-rose-300 border-none text-[10px] opacity-40">ADMIN</Badge>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-700">Fraud Engine Access</p>
                        <div className="flex gap-2">
                            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">READ</Badge>
                            <Badge className="bg-rose-50 text-rose-300 border-none text-[10px] opacity-40">WRITE</Badge>
                            <Badge className="bg-rose-50 text-rose-300 border-none text-[10px] opacity-40">ADMIN</Badge>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                        Manage IAM Policies
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
