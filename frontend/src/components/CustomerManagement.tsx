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

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers', activeTab],
    queryFn: () => apiClient<Customer[]>('/corebanking/cim/customers'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': case 'active': return 'bg-emerald-50 text-emerald-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'rejected': case 'suspended': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const filteredCustomers = customers?.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_number.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
            CUSTOMER BASE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Users className="h-6 w-6 text-white" /></div>
          </h2>
          <p className="text-slate-500 font-medium">Identity Governance & Tiered KYC Management.</p>
        </div>
        <AddCustomerModal onCustomerAdded={() => refetch()} />
      </div>

      {/* High-Fidelity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Users className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100">+12%</Badge>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Profiles</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{isLoading ? <Skeleton className="h-9 w-16" /> : customers?.length || 0}</h3>
            </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified (Tier 3)</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                    {isLoading ? <Skeleton className="h-9 w-12" /> : customers?.filter(c => c.account_tier === 'TIER_3').length || 0}
                </h3>
            </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Verification</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                    {isLoading ? <Skeleton className="h-9 w-12" /> : customers?.filter(c => c.kyc_status === 'PENDING').length || 0}
                </h3>
            </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="h-20 w-20" />
            </div>
            <CardContent className="p-8 relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Growth Pulse</p>
                <h3 className="text-2xl font-black italic tracking-tighter">Healthy</h3>
                <div className="flex items-center gap-2 mt-4">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">+4 NEW TODAY</span>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search by name, email, or NUBAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-16 rounded-[24px] bg-white border-none ring-1 ring-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-medium text-sm shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-16 px-8 rounded-[24px] border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
          <Filter className="h-4 w-4 mr-2" /> Advanced Filters
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto inline-flex">
          {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(tab => (
              <TabsTrigger key={tab} value={tab.toLowerCase()} className="rounded-xl px-6 py-2.5 font-black text-[10px] tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600">
                {tab === 'ALL' ? 'Full Roster' : tab}
              </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[32px]" />)}
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCustomers.map((c) => (
                <Card key={c.id} className="group hover:shadow-2xl transition-all duration-500 border-none ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight">{c.first_name} {c.last_name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest mt-0.5">#{c.customer_number}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(c.kyc_status)} border-none shadow-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg`}>
                        {c.kyc_status}
                      </Badge>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3"><Mail className="h-3.5 w-3.5" /></div>
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3"><Phone className="h-3.5 w-3.5" /></div>
                        <span>{c.phone_number}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3"><MapPin className="h-3.5 w-3.5" /></div>
                        <span>{c.state || 'Lagos, Nigeria'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-tighter">Tier {c.account_tier?.split('_').pop() || '1'}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">
                        View Node <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
              <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h4 className="text-lg font-black text-slate-900">No Match Found</h4>
              <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">Try refining your search parameters or check a different membership class.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
