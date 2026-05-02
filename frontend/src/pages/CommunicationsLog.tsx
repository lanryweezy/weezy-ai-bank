import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Smartphone, Clock, ShieldCheck, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

const CommunicationsLog = () => {
  const [filter, setFilter] = useState('ALL');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['communicationLogs'],
    queryFn: () => apiClient('/messaging/me/logs'),
    refetchInterval: 30000,
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
        case 'SMS': return <Smartphone className="h-4 w-4" />;
        case 'EMAIL': return <Mail className="h-4 w-4" />;
        default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'SENT': case 'DELIVERED': return <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 text-[8px] font-black uppercase">Delivered</Badge>;
        case 'FAILED': return <Badge className="bg-rose-50 text-rose-700 border-none px-2 text-[8px] font-black uppercase">Failed</Badge>;
        default: return <Badge variant="outline" className="text-[8px] font-black uppercase">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                ALERTS HUB <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><MessageSquare className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Real-time Transaction Communications & Security Notices.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2 mr-2">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white"><Mail className="h-3 w-3 text-indigo-600" /></div>
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white"><Smartphone className="h-3 w-3 text-emerald-600" /></div>
             </div>
             <Badge className="bg-slate-900 text-indigo-400 border-none px-4 py-1.5 font-black text-[9px] tracking-widest uppercase">Verified Channels</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Sidebar Filters */}
            <div className="space-y-6">
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Filter className="h-3 w-3" /> Filter Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        {['ALL', 'SMS', 'EMAIL', 'SECURITY'].map(f => (
                            <Button 
                                key={f}
                                variant="ghost" 
                                onClick={() => setFilter(f)}
                                className={`w-full justify-start rounded-xl font-bold text-xs uppercase tracking-widest h-12 ${filter === f ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                            >
                                {f}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-indigo-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <ShieldCheck className="h-20 w-20" />
                    </div>
                    <CardHeader className="p-8 pb-4 relative z-10">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Channel Integrity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10">
                        <p className="text-xs text-indigo-100/80 leading-relaxed italic">
                            "Alerts are end-to-end encrypted and routed via verified Nigerian telco gateways for maximum delivery speed."
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Log */}
            <div className="lg:col-span-3 space-y-4">
                {isLoading ? (
                    [1,2,3,4,5].map(i => <Card key={i} className="h-24 animate-pulse bg-slate-50 border-none rounded-[24px]" />)
                ) : logs?.length > 0 ? (
                    logs.map((log: any) => (
                        <Card key={log.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[24px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                            <div className="p-6 flex items-start gap-6">
                                <div className={`p-4 rounded-2xl shadow-inner transition-all group-hover:scale-110 ${log.channel === 'SMS' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {getChannelIcon(log.channel)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-black text-slate-900 text-sm tracking-tight">{log.subject || 'Transaction Notice'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                To: {log.recipient} • {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                                            </p>
                                        </div>
                                        {getStatusBadge(log.status)}
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-50 mt-4 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{log.message_body}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                        <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-slate-900">No Messages Found</h4>
                        <p className="text-sm text-slate-400 font-medium mt-2">All your transaction alerts and security codes will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommunicationsLog;
