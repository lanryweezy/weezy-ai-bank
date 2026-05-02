import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, UserPlus, MapPin, Wallet, Activity, Search, ShieldCheck, RefreshCw, TrendingUp, Network, Smartphone, Building2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AgentBankingPage = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    business_name: '',
    state: '',
    lga: '',
    address: '',
    tier: 'RETAIL_AGENT'
  });

  const { data: agents, isLoading, refetch } = useQuery({
    queryKey: ['agentNetwork'],
    queryFn: () => apiClient<any[]>('/agent-banking/agents'),
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiClient('/agent-banking/register', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Agent registered successfully!');
      setIsRegistering(false);
      refetch();
    },
    onError: (err: any) => toast.error(err.message || 'Registration failed'),
  });

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                AGENT NETWORK <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Network className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Distributed Financial Access & SANEF Standard Agency Operations.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => navigate('/agent-earnings')} className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">
                <TrendingUp className="mr-2 h-4 w-4" /> Revenue Hub
             </Button>
             <Button onClick={() => setIsRegistering(!isRegistering)} className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white border-none">
                <UserPlus className="mr-2 h-4 w-4" /> {isRegistering ? 'Network Roster' : 'Onboard Agent'}
             </Button>
          </div>
        </div>

        {isRegistering ? (
          <Card className="max-w-2xl border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden mx-auto">
            <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100">
              <CardTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
                 <Building2 className="h-6 w-6 text-indigo-600" /> Merchant Identity
              </CardTitle>
              <CardDescription className="font-medium mt-2">Register a verified customer as an active bank agent point.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer Profile ID</Label>
                  <Input placeholder="e.g. 101" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trading Name</Label>
                  <Input placeholder="e.g. Ade Ventures" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operations State</Label>
                  <Input placeholder="e.g. Lagos" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">LGA</Label>
                  <Input placeholder="e.g. Ikeja" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Point Address</Label>
                <Input placeholder="Full shop address" className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <Button 
                onClick={() => registerMutation.mutate({...formData, customer_id: parseInt(formData.customer_id)})} 
                disabled={registerMutation.isPending}
                className="w-full bg-indigo-600 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-100 mt-4 text-white border-none"
              >
                {registerMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                Authorize Merchant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {/* Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                    <CardHeader className="pb-2 p-8">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Points</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            {agents?.length || '1,248'} <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-2">+12 nodes onboarded this week</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white group hover:shadow-xl transition-all duration-500">
                    <CardHeader className="pb-2 p-8">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Float Liquidity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="text-3xl font-black text-indigo-600">₦45.2M</div>
                        <p className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-2"><Wallet className="h-3 w-3" /> Digital funds across field</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 p-8 relative z-10">
                        <CardTitle className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Commission Pool</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 relative z-10">
                        <div className="text-3xl font-black tracking-tighter">₦2.1M</div>
                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Due for midnight settlement</p>
                    </CardContent>
                </Card>
            </div>

            {/* Network Roster */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight italic">Field Infrastructure</CardTitle>
                        <CardDescription className="font-medium">Real-time status of all verified SANEF agent points.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input placeholder="Search agent code or name..." className="pl-12 h-12 rounded-2xl bg-white border-none ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20 shadow-inner font-medium text-xs" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        {agents?.map((agent: any) => (
                            <div key={agent.id} className="p-8 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="bg-indigo-50 p-4 rounded-[24px] text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{agent.business_name}</p>
                                            <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">ONLINE</Badge>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">ID: {agent.agent_code}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {agent.lga}, {agent.state}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Current Float</p>
                                        <p className="text-lg font-black text-slate-900">₦{parseFloat(agent.float_balance || 0).toLocaleString()}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                        <Activity className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        
                        {(!agents || agents.length === 0) && (
                            <div className="py-32 text-center border-4 border-dashed border-slate-50 m-10 rounded-[40px] bg-slate-50/30">
                                <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <h4 className="text-lg font-black text-slate-900">Network Idle</h4>
                                <p className="text-sm text-slate-400 font-medium mt-2">No agents registered in the system. Use the 'Onboard' tool to begin.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">System connected to SANEF National Registry</p>
                </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgentBankingPage;
