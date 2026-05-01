
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, History, Database, User, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLogEntry {
  log_id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: any;
  new_values: any;
  user_id: string;
  created_at: string;
  username?: string;
}

const AuditTrail: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => apiClient<AuditLogEntry[]>('/admin/audit-logs'), // Assuming this endpoint
  });

  const getOperationColor = (op: string) => {
    switch (op) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = auditLogs?.filter(log =>
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <History className="h-8 w-8 text-indigo-600" /> System Audit Trail
          </h2>
          <p className="text-gray-500 mt-1">Immutable record of all system operations and data mutations.</p>
        </div>

        <Card className="border-none ring-1 ring-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Filter logs by table, user, or operation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-200"
                />
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="h-10 px-4 bg-white flex gap-2 items-center"><Database className="h-3 w-3" /> All Tables</Badge>
                <Badge variant="outline" className="h-10 px-4 bg-white flex gap-2 items-center"><User className="h-3 w-3" /> All Users</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
                <div className="p-6 space-y-4">
                    {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-100">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Operation</th>
                                <th className="px-6 py-4">Target Table</th>
                                <th className="px-6 py-4">Record ID</th>
                                <th className="px-6 py-4">Changes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredLogs.map((log) => (
                                <tr key={log.log_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss.SSS')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {log.username || log.user_id.substring(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={`${getOperationColor(log.operation)} shadow-none border-none text-[10px] font-black`}>
                                            {log.operation}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {log.table_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                        {log.record_id.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        <details className="cursor-pointer group">
                                            <summary className="text-indigo-600 text-xs font-semibold hover:underline">View Diff</summary>
                                            <div className="mt-2 p-3 bg-gray-900 rounded-lg text-[10px] font-mono text-gray-300 max-w-md overflow-hidden">
                                                {log.operation === 'UPDATE' ? (
                                                    <div className="space-y-2">
                                                        <p className="text-red-400">- {JSON.stringify(log.old_values)}</p>
                                                        <p className="text-green-400">+ {JSON.stringify(log.new_values)}</p>
                                                    </div>
                                                ) : (
                                                    <p>{JSON.stringify(log.new_values || log.old_values)}</p>
                                                )}
                                            </div>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-20 text-center">
                    <ShieldAlert className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No audit logs found matching your criteria.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AuditTrail;
