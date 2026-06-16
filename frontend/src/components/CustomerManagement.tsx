import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddCustomerModal from './AddCustomerModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Phone,
  Mail,
  ExternalLink,
  Filter,
  UserPlus,
  MoreVertical,
  MapPin,
  TrendingUp,
  Activity,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Skeleton } from '@/components/ui/skeleton';

interface Customer {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  kyc_status: string;
  account_tier: string;
  status: string;
  created_at: string;
  state: string;
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import AddCustomerModal from './AddCustomerModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HolographicCard from '@/components/ui/HolographicCard';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Phone,
  Mail,
  ExternalLink,
  Filter,
  UserPlus,
  MoreVertical,
  MapPin,
  TrendingUp,
  Activity,
  ShieldAlert,
  Sparkles,
  Cpu,
  BrainCircuit,
  Target,
  Wand2,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ... (Customer interface remains same)

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers', activeTab],
    queryFn: () => apiClient<Customer[]>('/corebanking/cim/customers'),
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'TIER_3': return 'from-amber-500/20 to-transparent border-amber-500/30';
      case 'TIER_2': return 'from-indigo-500/20 to-transparent border-indigo-500/30';
      default: return 'from-slate-500/20 to-transparent border-slate-500/30';
    }
  };

  const filteredCustomers = useMemo(() => customers?.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_number.includes(searchTerm)
  ), [customers, searchTerm]);

  return (
    <div className="space-y-16">
      
      {/* Neural Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {[
            { label: 'Total_Identity_Nodes', val: customers?.length || 0, icon: Users, color: 'text-indigo-400' },
            { label: 'Verified_Master_Nodes', val: customers?.filter(c => c.account_tier === 'TIER_3').length || 0, icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'Pending_Handshakes', val: customers?.filter(c => c.kyc_status === 'PENDING').length || 0, icon: Activity, color: 'text-amber-400' },
            { label: 'Network_Trust_Score', val: '9.8/10', icon: Target, color: 'text-purple-400' },
        ].map((stat, i) => (
            <HolographicCard key={i} className="p-8 group">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5 shadow-2xl transition-all group-hover:scale-110", stat.color)}>
                        <stat.icon className="h-6 w-6" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">{stat.label}</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{isLoading ? '...' : stat.val}</h3>
            </HolographicCard>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative flex-1 group">
          <Wand2 className="h-6 w-6 absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors animate-pulse" />
          <Input
            placeholder="Neural Command: Search identity lattice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-20 h-24 rounded-[40px] bg-white/[0.02] border-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-black text-xl italic tracking-tight shadow-2xl text-white placeholder:text-slate-800"
          />
        </div>
        <AddCustomerModal onCustomerAdded={() => refetch()} />
      </div>

      <div className="space-y-12">
        <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
                <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 shadow-2xl">
                    <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-[0.3em]">Identity Lattice</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Autonomous Citizen Registry</p>
                </div>
            </div>
            
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto">
                {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(tab => (
                    <TabsTrigger key={tab} value={tab.toLowerCase()} className="rounded-xl px-8 py-3 font-black text-[9px] tracking-[0.4em] uppercase data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all shadow-2xl">
                        {tab}
                    </TabsTrigger>
                ))}
                </TabsList>
            </Tabs>
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[48px] bg-white/5" />)}
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredCustomers.map((c, idx) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={c.id}>
                    <HolographicCard className={cn("p-10 relative overflow-hidden group min-h-[350px] border-2", getTierColor(c.account_tier))}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_70%)]" />
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-[24px] bg-white/[0.05] border border-white/10 flex items-center justify-center text-white font-black text-2xl italic shadow-2xl group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-700">
                                        {c.first_name[0]}{c.last_name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover:text-indigo-400 transition-colors">{c.first_name} {c.last_name}</h4>
                                        <p className="text-[9px] text-slate-500 font-mono font-black tracking-[0.3em] mt-1 italic">#NODE_{c.customer_number}</p>
                                    </div>
                                </div>
                                <Badge className="bg-white/5 text-slate-400 border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full">{c.kyc_status}</Badge>
                            </div>

                            <div className="space-y-5 mt-10">
                                <div className="flex items-center gap-5 text-slate-400">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                                    <span className="text-[11px] font-bold tracking-wide truncate">{c.email}</span>
                                </div>
                                <div className="flex items-center gap-5 text-slate-400">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                                    <span className="text-[11px] font-black font-mono tracking-widest">{c.phone_number}</span>
                                </div>
                                <div className="flex items-center gap-5 text-slate-400">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center"><MapPin className="w-4 h-4 text-indigo-500" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{c.state || 'Lagos // NG'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-10 border-t border-white/5 mt-10">
                                <Badge className={cn(
                                    "border-none font-black text-[9px] uppercase tracking-[0.4em] px-4 py-1.5 rounded-full shadow-2xl",
                                    c.account_tier === 'TIER_3' ? "bg-amber-600/20 text-amber-400" : "bg-white/5 text-slate-500"
                                )}>
                                    {c.account_tier?.replace(/_/g, ' ')}
                                </Badge>
                                <button className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:bg-indigo-600/10 transition-all shadow-2xl">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </HolographicCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-48 text-center border-4 border-dashed border-white/5 rounded-[64px] bg-white/[0.01]">
              <Activity className="h-20 w-20 text-slate-900 mx-auto mb-8 animate-pulse" />
              <h4 className="text-3xl font-black text-slate-700 italic uppercase tracking-tighter">Zero Match Detected</h4>
              <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] opacity-60">Identity lattice search yielded no valid nodes in this membership class.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default CustomerManagement;
