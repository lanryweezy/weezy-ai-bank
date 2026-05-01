import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Globe,
  Lock,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Building
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const ConsentManager: React.FC<{ accountId: string }> = ({ accountId }) => {
  const queryClient = useQueryClient();

  const { data: consents, isLoading, refetch } = useQuery({
    queryKey: ['consents', accountId],
    queryFn: () => apiClient<any[]>(`/open-banking/account/${accountId}`),
  });

  const revokeMutation = useMutation({
    mutationFn: (consentId: string) => apiClient(`/open-banking/${consentId}/revoke`, { method: 'POST' }),
    onSuccess: () => {
        toast({ title: "Consent Revoked", description: "The third-party app no longer has access to your data." });
        queryClient.invalidateQueries({ queryKey: ['consents', accountId] });
    },
    onError: (err: any) => {
        toast({ variant: "destructive", title: "Revocation Failed", description: err.message });
    }
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Connected Third-Party Apps</h3>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-3 py-1 font-bold">
            PSD2 Compliant
        </Badge>
      </div>

      {consents?.length === 0 ? (
        <Card className="border-none bg-gray-50/50 p-12 text-center rounded-3xl ring-1 ring-gray-100">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No external apps have access to this account.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Open banking allows you to securely share data with licensed financial providers.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {consents?.map((consent) => (
            <Card key={consent.consent_id} className="group overflow-hidden border-none bg-white shadow-sm ring-1 ring-gray-100 hover:ring-indigo-500 transition-all rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600 border border-indigo-100">
                                {consent.tpp_name[0].toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    {consent.tpp_name} <ExternalLink className="h-3 w-3 text-gray-400" />
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="secondary" className={`${consent.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} border-none font-bold text-[10px] uppercase px-2 py-0.5`}>
                                        {consent.status}
                                    </Badge>
                                    <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                                        <Clock className="h-3 w-3" /> Valid until {new Date(consent.expires_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Shared Permissions</p>
                            <div className="flex flex-wrap gap-2">
                                {consent.permissions.map((p: string) => (
                                    <Badge key={p} variant="outline" className="bg-gray-50/50 border-gray-100 text-gray-600 text-[10px] font-bold">
                                        {p.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {consent.status === 'active' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => revokeMutation.mutate(consent.consent_id)}
                                    className="h-10 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Revoke Access
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsentManager;
