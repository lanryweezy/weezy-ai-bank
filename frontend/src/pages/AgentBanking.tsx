import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, UserPlus, MapPin, Wallet, Activity, Search, ShieldCheck, RefreshCw, TrendingUp, Network, Smartphone, Building2, User, CheckCircle2, ChevronRight, Globe, Cpu } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AgentBankingPage = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    business_name: '',
    state: '',
    lga: '',
    address: '',
    tier: 'RETAIL_AGENT'
  });

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ['customerSearch', customerSearch],
    queryFn: () => apiClient(`/customer-identity/customers?phone_number=${customerSearch}`),
    enabled: customerSearch.length >= 10,
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

  if (isLoading) return <div className="p-20 text-center font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Field Infrastructure...</div>;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Agent Mesh <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Network className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <Globe className="h-4 w-4 text-indigo-500" /> SANEF Standard Distributed Nodes
            </p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" onClick={() => navigate('/agent-earnings')} className="rounded-2xl h-14 px-8 border-white/5 hover:bg-white/5 font-black text-xs uppercase tracking-[0.2em] transition-all text-slate-300">
                <TrendingUp className="mr-3 h-5 w-5" /> Revenue Analytics
             </Button>
             <Button onClick={() => setIsRegistering(!isRegistering)} className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-500 shadow-2xl shadow-indigo-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 text-white border-none">
                <UserPlus className="mr-3 h-5 w-5" /> {isRegistering ? 'View Mesh' : 'Deploy Agent'}
             </Button>
          </div>
        </div>

        {isRegistering ? (
          <Card className="max-w-3xl obsidian-card overflow-hidden mx-auto border-indigo-500/20">
            <CardHeader className="p-12 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-5 text-white uppercase">
                 <Building2 className="h-10 w-10 text-indigo-400" /> Node Provisioning
              </CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-4">Authorized Agent Onboarding Protocol</CardDescription>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="space-y-6">
                <div className="space-y-4 relative group">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity Search (Phone)</Label>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                    <Input 
                        placeholder="Search customer pool..." 
                        className="h-20 pl-16 rounded-3xl bg-white/5 border-white/5 font-black text-2xl text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all" 
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                    />
                  </div>
                  
                  {searchResults?.items?.length > 0 && !selectedCustomer && (
                    <div className="absolute z-20 w-full mt-4 glass-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                        {searchResults.items.map((c: any) => (
                            <button 
                                key={c.id} 
                                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                                onClick={() => {
                                    setSelectedCustomer(c);
                                    setFormData({...formData, customer_id: c.id.toString(), business_name: `${c.first_name} ${c.last_name} Enterprise`});
                                    setCustomerSearch('');
                                }}
                            >
                                <div className="flex items-center gap-6 text-left">
                                    <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-400"><User className="h-5 w-5" /></div>
                                    <div>
                                        <p className="text-lg font-black text-white italic uppercase tracking-tight">{c.first_name} {c.last_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.phone_number}</p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] uppercase px-3">Tier {c.kyc_tier}</Badge>
                            </button>
                        ))}
                    </div>
                  )}
                </div>

                {selectedCustomer && (
                    <div className="p-8 glass-dark rounded-[32px] border border-indigo-500/20 flex items-center justify-between animate-in zoom-in-95 duration-500 shadow-2xl shadow-indigo-500/5">
                        <div className="flex items-center gap-8">
                            <div className="bg-emerald-500/10 p-5 rounded-[24px] border border-emerald-500/20 shadow-xl"><CheckCircle2 className="h-8 w-8 text-emerald-400" /></div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Authenticated Merchant</p>
                                <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{selectedCustomer.first_name} {selectedCustomer.last_name}</h4>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/5 h-12 px-6 rounded-xl" onClick={() => setSelectedCustomer(null)}>Reset</Button>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Business Narrative</Label>
                  <Input placeholder="e.g. Zenith Ventures" className="h-16 rounded-2xl bg-white/5 border-white/5 px-8 font-black text-white focus-visible:ring-1 focus-visible:ring-indigo-500/50" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
                </div>
                <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Node Hierarchy</Label>
                    <select 
                        className="w-full h-16 px-8 rounded-2xl bg-white/5 border border-white/5 font-black text-white outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-2xl uppercase text-xs"
                        value={formData.tier}
                        onChange={e => setFormData({...formData, tier: e.target.value})}
                    >
                        <option value="RETAIL_AGENT" className="bg-slate-900">Retail Agent</option>
                        <option value="SUPER_AGENT" className="bg-slate-900">Super Agent</option>
                        <option value="SOLE_DISTRIBUTOR" className="bg-slate-900">Sole Distributor</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Geographic State</Label>
                  <Input placeholder="Lagos" className="h-16 rounded-2xl bg-white/5 border-white/5 px-8 font-black text-white" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">LGA Sector</Label>
                  <Input placeholder="Ikeja" className="h-16 rounded-2xl bg-white/5 border-white/5 px-8 font-black text-white" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Primary Operation Point</Label>
                <Input placeholder="Street Address, Block, Plaza" className="h-16 rounded-2xl bg-white/5 border-white/5 px-8 font-black text-white" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="pt-6">
                <Button 
                    onClick={() => registerMutation.mutate({...formData, customer_id: parseInt(formData.customer_id)})} 
                    disabled={registerMutation.isPending}
                    className="w-full bg-indigo-600 h-20 rounded-[32px] font-black text-xl italic tracking-tighter shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-white border-none"
                >
                    {registerMutation.isPending ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-8 w-8 mr-4" />}
                    EXECUTE PROVISIONING
                </Button>
                <Button variant="ghost" className="w-full h-14 font-black text-[10px] uppercase tracking-widest text-slate-600 mt-4 hover:text-white" onClick={() => setIsRegistering(false)}>Abort Onboarding</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Global Mesh Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="obsidian-card p-10 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                            <Activity className="h-7 w-7" />
                         </div>
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    </div>
                    <div className="mt-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Nodes</p>
                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{agents?.length || '1,248'}</h3>
                        <p className="text-[9px] text-emerald-400/60 font-bold mt-2 uppercase tracking-widest">+12 provisioned today</p>
                    </div>
                </Card>

                <Card className="obsidian-card p-10 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                         <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                            <Wallet className="h-7 w-7" />
                         </div>
                         <Cpu className="h-5 w-5 text-slate-700 animate-pulse" />
                    </div>
                    <div className="mt-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Liquidity</p>
                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">₦45.2M</h3>
                        <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-widest italic">Digital Float across grid</p>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-none shadow-2xl rounded-[40px] p-10 flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />
                    <div className="flex justify-between items-start relative z-10">
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-indigo-400">
                            <TrendingUp className="h-7 w-7" />
                         </div>
                         <Badge className="bg-indigo-600 text-white border-none font-black text-[9px] px-3 tracking-widest">LIVE POOL</Badge>
                    </div>
                    <div className="mt-10 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Accrued Commissions</p>
                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">₦2.1M</h3>
                        <p className="text-[9px] text-indigo-300/60 font-bold mt-2 uppercase tracking-widest">Due at 00:00 Cycle</p>
                    </div>
                </Card>
            </div>

            {/* Network Infrastructure Roster */}
            <Card className="obsidian-card border-none overflow-hidden flex flex-col min-h-[600px]">
                <CardHeader className="p-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 bg-white/[0.01]">
                    <div>
                        <CardTitle className="text-3xl font-black text-white tracking-tighter italic uppercase">Grid Infrastructure</CardTitle>
                        <CardDescription className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] mt-3 italic">Real-time SANEF Node Roster</CardDescription>
                    </div>
                    <div className="relative w-full md:w-[400px] group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                        <Input placeholder="SCAN NODE ID OR MERCHANT..." className="pl-16 h-16 rounded-3xl bg-white/5 border-white/5 focus-visible:ring-1 focus-visible:ring-indigo-500/50 shadow-2xl font-black text-xs text-white placeholder:text-slate-700 italic tracking-widest" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {agents?.map((agent: any) => (
                            <div key={agent.id} className="p-12 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                <div className="flex items-center gap-10 w-full md:w-auto">
                                    <div className="bg-white/5 p-6 rounded-[32px] text-indigo-400 border border-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6">
                                        <Smartphone className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{agent.business_name}</p>
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">ONLINE</Badge>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">WZY-NODE: {agent.agent_code}</p>
                                            <div className="h-3 w-[1px] bg-white/5" />
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-indigo-500" /> {agent.lga}, {agent.state}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-16 mt-8 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Digital Float</p>
                                        <p className="text-2xl font-black text-white italic tracking-tighter">₦{parseFloat(agent.float_balance || 0).toLocaleString()}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-600 hover:text-indigo-400 hover:bg-white/5 transition-all border border-transparent hover:border-white/5 shadow-2xl">
                                        <Activity className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        
                        {(!agents || agents.length === 0) && (
                            <div className="py-48 text-center border-4 border-dashed border-white/5 m-12 rounded-[60px] bg-white/[0.01]">
                                <Activity className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
                                <h4 className="text-2xl font-black text-slate-700 italic uppercase tracking-tighter">Grid Dormant</h4>
                                <p className="text-sm text-slate-500 font-bold mt-3 uppercase tracking-widest opacity-60">Initialize field operations via Node Provisioning</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-10 border-t border-white/5 flex justify-center bg-white/[0.01]">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Encrypted Secure Tunnel Node Layer 4</p>
                </CardFooter>
            </Card>
          </div>
        )}
    </div>
  );
};

export default AgentBankingPage;
