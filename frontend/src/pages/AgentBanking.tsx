import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Store, UserPlus, MapPin, Wallet, Activity, Search } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const AgentBankingPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    business_name: '',
    state: '',
    lga: '',
    address: '',
    tier: 'RETAIL_AGENT'
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiClient('/agent-banking/register', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Agent registered successfully!');
      setIsRegistering(false);
    },
    onError: (err: any) => toast.error(err.message || 'Registration failed'),
  });

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Agent Banking Console (SANEF) <Store className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Manage field agents, cash points, and commissions across Nigeria.</p>
          </div>
          <Button onClick={() => setIsRegistering(!isRegistering)} className="bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="mr-2 h-4 w-4" /> {isRegistering ? 'View Agents' : 'Register New Agent'}
          </Button>
        </div>

        {isRegistering ? (
          <Card className="max-w-2xl border-none shadow-lg ring-1 ring-gray-200">
            <CardHeader>
              <CardTitle>Agent Registration</CardTitle>
              <CardDescription>Enter customer and business details to create a new agent float.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer ID</Label>
                  <Input placeholder="e.g. 101" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input placeholder="e.g. Ade Ventures" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="e.g. Lagos" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>LGA</Label>
                  <Input placeholder="e.g. Ikeja" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Business Address</Label>
                <Input placeholder="Full shop address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <Button 
                onClick={() => registerMutation.mutate({...formData, customer_id: parseInt(formData.customer_id)})} 
                disabled={registerMutation.isPending}
                className="w-full bg-indigo-600"
              >
                {registerMutation.isPending ? 'Processing...' : 'Confirm Registration'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,248</div>
                    <p className="text-xs text-green-600 mt-1 flex items-center"><Activity className="h-3 w-3 mr-1" /> +12 this week</p>
                </CardContent>
             </Card>
             <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Agent Float Volume</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦45.2M</div>
                    <p className="text-xs text-indigo-600 mt-1 flex items-center"><Wallet className="h-3 w-3 mr-1" /> Liquid across points</p>
                </CardContent>
             </Card>
             <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦2.1M</div>
                    <p className="text-xs text-orange-600 mt-1 flex items-center"><Activity className="h-3 w-3 mr-1" /> Due for settlement</p>
                </CardContent>
             </Card>

             <Card className="md:col-span-3 border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Agent Transactions</CardTitle>
                        <CardDescription>Cash-In and Cash-Out activities from the field.</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search agent code..." className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed rounded-xl">
                        Agent activity list will appear here once transactions begin.
                    </div>
                </CardContent>
             </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgentBankingPage;
