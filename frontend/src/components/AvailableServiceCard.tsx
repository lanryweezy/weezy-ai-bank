import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Globe, Cloud, Mail, Database } from 'lucide-react';

interface AvailableServiceCardProps {
  service: any;
}

const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'Aggregator': return <Globe className="h-6 w-6" />;
        case 'Compute': return <Cloud className="h-6 w-6" />;
        case 'Email': return <Mail className="h-6 w-6" />;
        default: return <Database className="h-6 w-6" />;
    }
}

const AvailableServiceCard: React.FC<AvailableServiceCardProps> = ({ service }) => {
  return (
    <Card className="group border-none bg-white shadow-sm ring-1 ring-gray-100 hover:ring-indigo-500 transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-8 text-center flex flex-col items-center">
        <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl mb-6 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          {getCategoryIcon(service.category)}
        </div>
        <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">{service.category}</span>
        </div>
        <p className="text-xs text-gray-500 mb-8 leading-relaxed line-clamp-2">{service.description}</p>
        <Button variant="outline" className="w-full h-10 rounded-xl font-bold text-gray-600 border-gray-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Provision Access
        </Button>
      </CardContent>
    </Card>
  );
};

export default AvailableServiceCard;
