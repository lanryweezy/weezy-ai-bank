import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Activity, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Server,
  Zap,
  Cpu,
  Database
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLog {
  id: number;
  timestamp: string;
  username_performing_action: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  ip_address: string;
  status: string;
}

interface PaginatedAuditLogs {
    items: AuditLog[];
    total: number;
}

const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', filterType],
    queryFn: () => apiClient<PaginatedAuditLogs>(`/admin/audit-logs/?limit=50${filterType !== 'ALL' ? `&action_type=${filterType}` : ''}`),
  });

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-rose-50 text-rose-700 ring-rose-500/20';
    if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 ring-emerald-500/20';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 ring-blue-500/20';
    if (action.includes('LOGIN_FAIL')) return 'bg-rose-100 text-rose-900 ring-rose-500/30';
    return 'bg-slate-50 text-slate-700 ring-slate-500/10';
  };

  const filteredLogs = logsData?.items?.filter(log => 
    log.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username_performing_action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                SYSTEM AUDIT <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><History className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Immutable Forensic Trail & Operational Governance Logs.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Export CSV
             </Button>
             <Button onClick={() => refetch()} className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 shadow-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Trail
             </Button>
          </div>
        </div>

        {/* Audit Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'Events Recorded', value: '1.2M', icon: Database, color: 'indigo' },
                { label: 'Security Flags', value: '4', icon: AlertTriangle, color: 'rose' },
                { label: 'Active Sessions', value: '142', icon: Activity, color: 'emerald' },
                { label: 'Integrity', value: 'SIGNED', icon: ShieldCheck, color: 'blue' },
            ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-700">
                        <stat.icon className="h-24 w-24" />
                    </div>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`bg-${stat.color}-50 p-3 rounded-2xl text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 group">
                <Search className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                    placeholder="Search logs by user, action, or summary..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 h-16 rounded-[24px] bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-4 focus-visible:ring-indigo-500/10 font-medium text-sm shadow-inner transition-all"
                />
            </div>
            <select 
                className="h-16 px-8 rounded-[24px] border-none ring-1 ring-slate-200 bg-white font-black text-[10px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
            >
                <option value="ALL">All Event Types</option>
                <option value="USER_LOGIN">Logins</option>
                <option value="BRANCH_CREATE">Infrastructure</option>
                <option value="AGENT_UPDATE">Field Ops</option>
                <option value="DELETE">Deletions</option>
            </select>
        </div>

        <div className="space-y-4">
            {isLoading ? (
                [1,2,3,4,5].map(i => <Card key={i} className="h-24 animate-pulse bg-slate-50 border-none rounded-[24px]" />)
            ) : filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                    <Card key={log.id} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[28px] bg-white hover:shadow-xl transition-all duration-500 group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-6 md:p-8 flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-[20px] shadow-inner transition-all group-hover:scale-110 ${log.action_type.includes('FAIL') ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {log.action_type.includes('USER') ? <User className="h-6 w-6" /> : <Server className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <p className="font-black text-slate-900 text-base tracking-tight">{log.summary}</p>
                                                <Badge className={`${getActionColor(log.action_type)} border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ring-1`}>
                                                    {log.action_type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-indigo-400" /> By: <span className="text-slate-600">{log.username_performing_action || 'SYSTEM'}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3 text-indigo-400" /> {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                    <Zap className="h-3 w-3 text-amber-400" /> {log.ip_address || '127.0.0.1'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-4 pl-10">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className={`bg-indigo-600 md:w-2 flex-shrink-0 ${log.action_type.includes('DELETE') ? 'bg-rose-500' : ''}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                    <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h4 className="text-lg font-black text-slate-900">End of Trail</h4>
                    <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">No records match your search criteria. The system is operating within normal parameters.</p>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default AuditTrail;
