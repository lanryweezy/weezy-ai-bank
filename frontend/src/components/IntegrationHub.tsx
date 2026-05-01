import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, Layers, Grid, Sliders, Puzzle, Sparkles } from 'lucide-react';
import IntegrationCard from './IntegrationCard';
import AvailableServiceCard from './AvailableServiceCard';
import IntegrationConfiguration from './IntegrationConfiguration';
import AddIntegrationModal from './AddIntegrationModal';
import { Skeleton } from '@/components/ui/skeleton';

const IntegrationHub: React.FC = () => {
  // Simulating fetching integrations
  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => [
        { id: '1', name: 'Open Banking API', type: 'Financial Data', description: 'Synchronize customer accounts from external banks.', status: 'connected', icon: 'Link' },
        { id: '2', name: 'Stripe Payments', type: 'Payment Processor', description: 'Process global credit card and bank transfer payments.', status: 'connected', icon: 'CreditCard' },
        { id: '3', name: 'Twilio SMS', type: 'Communications', description: 'Two-factor authentication and transactional alerts.', status: 'error', icon: 'MessageSquare' },
    ]
  });

  const { data: availableServices } = useQuery({
    queryKey: ['available-services'],
    queryFn: () => [
        { id: 's1', name: 'Plaid', category: 'Aggregator', description: 'Connect to 11,000+ financial institutions.' },
        { id: 's2', name: 'AWS Lambda', category: 'Compute', description: 'Run custom serverless logic for complex workflows.' },
        { id: 's3', name: 'SendGrid', category: 'Email', description: 'Reliable transactional email delivery.' }
    ]
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-indigo-600" /> Integration Hub
          </h2>
          <p className="text-gray-500 mt-1">Connect your core system to the global financial ecosystem.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200" onClick={() => refetch()}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Services
            </Button>
            <AddIntegrationModal onIntegrationAdded={() => refetch()} />
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl mb-8">
          <TabsTrigger value="active" className="rounded-lg px-6 font-bold flex items-center gap-2">
            <Puzzle className="h-4 w-4" /> Active Connections
          </TabsTrigger>
          <TabsTrigger value="available" className="rounded-lg px-6 font-bold flex items-center gap-2 text-gray-500 data-[state=active]:text-indigo-600">
            <Grid className="h-4 w-4" /> Marketplace
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg px-6 font-bold flex items-center gap-2 text-gray-500 data-[state=active]:text-indigo-600">
            <Sliders className="h-4 w-4" /> Global Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 outline-none">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations?.map((integration: any) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableServices?.map((service: any) => (
              <AvailableServiceCard key={service.id} service={service} />
            ))}
            <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group">
                <div className="bg-white p-3 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Request New Service</h4>
                <p className="text-xs text-gray-400">Can't find what you need? We'll build it.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 outline-none">
          <div className="max-w-4xl">
            <IntegrationConfiguration />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationHub;
