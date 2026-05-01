
import React, { useState } from 'react';
import GenericCard from './GenericCard';
import { Button } from '@/components/ui/button';
import AddCustomerModal from './AddCustomerModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Search, 
  Shield, 
  Phone,
  Mail,
  CreditCard,
  ExternalLink,
  Filter,
  UserPlus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Skeleton } from '@/components/ui/skeleton';

interface Customer {
  customer_id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_primary: string;
  kyc_status: string;
  customer_tier: string;
  status: string;
  created_at: string;
}

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', activeTab],
    queryFn: () => apiClient<Customer[]>('/customers'),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers?.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_number.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Base</h2>
          <p className="text-gray-500 mt-1">Manage and monitor customer identities and accounts.</p>
        </div>
        <AddCustomerModal onCustomerAdded={() => refetch()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm ring-1 ring-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Customers</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? <Skeleton className="h-8 w-16" /> : customers?.length || 0}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* More metric cards */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by name, email, or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus:ring-indigo-500"
          />
        </div>
        <Button variant="outline" className="h-11">
          <Filter className="h-4 w-4 mr-2" />
          Advanced
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100/50 p-1">
          <TabsTrigger value="all">Active Members</TabsTrigger>
          <TabsTrigger value="pending">Pending KYC</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((c) => (
                <Card key={c.customer_id} className="group hover:shadow-md transition-all border-none ring-1 ring-gray-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{c.first_name} {c.last_name}</h4>
                          <p className="text-xs text-gray-400 font-mono">{c.customer_number}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`${getStatusColor(c.kyc_status)} shadow-none border-none text-[10px] uppercase font-bold`}>
                        {c.kyc_status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        <span>{c.phone_primary}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">{c.customer_tier}</span>
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                        Profile <ExternalLink className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl ring-1 ring-gray-200">
              <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No customers found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
