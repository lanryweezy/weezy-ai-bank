import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Settings, Link as LinkIcon, CreditCard, MessageSquare, ShieldAlert, MoreHorizontal } from 'lucide-react';

interface IntegrationCardProps {
  integration: any;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'error': return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'connected': return <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">Operational</Badge>;
    case 'error': return <Badge className="bg-rose-50 text-rose-700 border-none font-bold">Error</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getServiceIcon = (iconName: string) => {
    switch(iconName) {
        case 'Link': return <LinkIcon className="h-6 w-6 text-indigo-600" />;
        case 'CreditCard': return <CreditCard className="h-6 w-6 text-indigo-600" />;
        case 'MessageSquare': return <MessageSquare className="h-6 w-6 text-indigo-600" />;
        default: return <MoreHorizontal className="h-6 w-6 text-indigo-600" />;
    }
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration }) => {
  return (
    <Card className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-xl hover:ring-2 hover:ring-indigo-500 transition-all duration-300 rounded-2xl flex flex-col">
      <CardContent className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
              {getServiceIcon(integration.icon)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{integration.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{integration.type}</p>
            </div>
          </div>
          {getStatusIcon(integration.status)}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{integration.description}</p>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          {getStatusBadge(integration.status)}
          <Button variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100/50">
            <Settings className="h-3 w-3 mr-2" />
            Configure
          </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationCard;
