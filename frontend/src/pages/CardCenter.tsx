import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, Lock, Unlock, Plus, Activity, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const CardCenter = () => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  const { data: cards, isLoading, refetch } = useQuery({
    queryKey: ['myCards'],
    queryFn: () => apiClient('/wallets/cards/me'),
  });

  const requestCardMutation = useMutation({
    mutationFn: (data: any) => apiClient('/wallets/cards/request', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Card issued successfully!');
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Card request failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiClient(`/wallets/cards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ new_status: status }) }),
    onSuccess: () => {
      toast.success('Card status updated');
      refetch();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 border-none">ACTIVE</Badge>;
      case 'INACTIVE': return <Badge className="bg-yellow-100 text-yellow-700 border-none">INACTIVE</Badge>;
      case 'BLOCKED_PERM': return <Badge className="bg-red-100 text-red-700 border-none">BLOCKED</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-center">Loading your cards...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Naira Card Center <CreditCard className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Manage your Verve and Mastercard digital and physical cards.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => requestCardMutation.mutate({ 
                card_type: 'VIRTUAL', 
                card_scheme: 'VERVE', 
                cardholder_name: 'WEEZY CUSTOMER',
                account_id: 1 // Demo
              })} 
              className="bg-indigo-600"
              disabled={requestCardMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" /> Get Virtual Card
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Card Display */}
           <div className="space-y-6">
              {cards?.length > 0 ? (
                cards.map((card: any) => (
                  <Card key={card.id} className={`border-none shadow-2xl relative overflow-hidden text-white transition-all duration-500 ${card.status === 'BLOCKED_PERM' ? 'grayscale opacity-60' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.card_scheme === 'VERVE' ? 'from-emerald-600 to-teal-900' : 'from-indigo-600 to-blue-900'}`} />
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <CreditCard className="h-40 w-40" />
                    </div>
                    <CardHeader className="relative z-10">
                      <div className="flex justify-between items-start">
                         <div className="bg-white/20 px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
                            {card.card_type} {card.card_scheme}
                         </div>
                         {getStatusBadge(card.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-4 pb-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-mono tracking-[0.2em] font-bold">
                                {showFullDetails ? card.card_number_masked.replace(/\*/g, '•') : card.card_number_masked}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowFullDetails(!showFullDetails)} className="text-white hover:bg-white/10">
                                {showFullDetails ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                        </div>
                        <div className="flex gap-12">
                            <div>
                                <p className="text-[10px] text-white/60 uppercase">Expiry</p>
                                <p className="font-bold">{card.expiry_date}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/60 uppercase">CVV</p>
                                <p className="font-bold">{showFullDetails ? '•••' : '***'}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="relative z-10 bg-black/20 backdrop-blur-sm flex justify-between py-4">
                        <p className="text-xs font-semibold tracking-wider uppercase">{card.cardholder_name}</p>
                        <div className="flex gap-2">
                            {card.status === 'ACTIVE' ? (
                                <Button size="sm" variant="ghost" className="h-8 text-white hover:bg-red-500/20" onClick={() => statusMutation.mutate({ id: card.id, status: 'BLOCKED_PERM' })}>
                                    <Lock className="h-3 w-3 mr-1" /> Block
                                </Button>
                            ) : (
                                <Button size="sm" variant="ghost" className="h-8 text-white hover:bg-green-500/20" onClick={() => statusMutation.mutate({ id: card.id, status: 'ACTIVE' })}>
                                    <Unlock className="h-3 w-3 mr-1" /> Activate
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-gray-50/50">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 italic">No active cards found. Request one to get started.</p>
                </div>
              )}
           </div>

           {/* Controls & Security */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" /> Security Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { label: 'Online Payments', desc: 'Enable for web transactions', active: true },
                        { label: 'International Spend', desc: 'Allow FX transactions (USD)', active: false },
                        { label: 'ATM Withdrawals', desc: 'Allow cash withdrawals', active: true },
                        { label: 'Contactless (NFC)', desc: 'Tap to pay enabled', active: false },
                    ].map((ctrl, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="text-sm font-bold">{ctrl.label}</p>
                                <p className="text-[10px] text-gray-500">{ctrl.desc}</p>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${ctrl.active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ctrl.active ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm ring-1 ring-gray-200 bg-indigo-50/30">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-indigo-600" /> Card Usage Tips
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-xs text-gray-600 leading-relaxed">
                        • Never share your CVV or PIN with anyone, including bank staff.<br/>
                        • Your Verve card is accepted at all Interswitch-enabled points in Nigeria.<br/>
                        • Virtual cards have a ₦50,000 daily spend limit for Tier 1 users.
                    </p>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardCenter;
