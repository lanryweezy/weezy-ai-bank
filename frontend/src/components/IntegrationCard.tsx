import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Link as LinkIcon, 
    CreditCard, 
    Layers, 
    Globe, 
    Zap, 
    Settings, 
    RefreshCw, 
    ShieldCheck, 
    Lock,
    Eye,
    EyeOff,
    X
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

interface IntegrationCardProps {
  provider: any;
}

const getIcon = (iconName: string) => {
    switch(iconName) {
        case 'Link': return <LinkIcon className="h-6 w-6" />;
        case 'CreditCard': return <CreditCard className="h-6 w-6" />;
        case 'Layers': return <Layers className="h-6 w-6" />;
        case 'Globe': return <Globe className="h-6 w-6" />;
        default: return <Zap className="h-6 w-6" />;
    }
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ provider }) => {
  const queryClient = useQueryClient();
  const [configuringService, setConfiguringService] = useState<any>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleProviderMutation = useMutation({
    mutationFn: (status: boolean) => apiClient(`/integrations/hub/providers/${provider.id}/toggle`, { 
        method: 'POST', 
        data: { is_active: status } 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['integration-providers']);
      toast.success(`${provider.display_name} status updated.`);
    }
  });

  const toggleServiceMutation = useMutation({
    mutationFn: ({serviceId, status}: {serviceId: number, status: boolean}) => 
        apiClient(`/integrations/hub/services/${serviceId}/toggle`, { 
            method: 'POST', 
            data: { is_enabled: status } 
        }),
    onSuccess: () => {
      queryClient.invalidateQueries(['integration-providers']);
      toast.success('Service configuration updated.');
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({serviceId, config}: {serviceId: number, config: any}) => 
        apiClient(`/integrations/hub/services/${serviceId}/config`, { 
            method: 'PUT', 
            data: config 
        }),
    onSuccess: () => {
      queryClient.invalidateQueries(['integration-providers']);
      toast.success('Secure configuration encrypted and saved.');
      setConfiguringService(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to save config')
  });

  const handleOpenConfig = (service: any) => {
      setConfiguringService(service);
      const initialValues: Record<string, string> = {};
      if (service.config_schema) {
          Object.keys(service.config_schema).forEach(key => {
              initialValues[key] = service.config_values?.[key] || '';
          });
      }
      setConfigValues(initialValues);
  };

  const handleSaveConfig = () => {
      updateConfigMutation.mutate({
          service_id: configuringService.id,
          config: configValues
      });
  };

  return (
    <Card className={`group overflow-hidden border-none shadow-2xl rounded-[40px] transition-all duration-700 bg-white ${!provider.is_active ? 'opacity-60 grayscale' : 'ring-1 ring-slate-100 hover:ring-indigo-500/20'}`}>
      <div className={`h-2 w-full transition-all duration-700 ${provider.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`} />
      
      <CardContent className="p-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-[24px] transition-all duration-700 shadow-xl ${provider.is_active ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
              {getIcon(provider.icon_name)}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{provider.display_name}</h3>
              <Badge variant="outline" className="mt-1 text-[8px] font-black uppercase tracking-widest border-slate-200">
                {provider.is_active ? 'ESTABLISHED' : 'STANDBY'}
              </Badge>
            </div>
          </div>
          <Switch 
            checked={provider.is_active} 
            onCheckedChange={(checked) => toggleProviderMutation.mutate(checked)}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>

        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 italic">"{provider.description}"</p>

        <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Settings className="h-3 w-3" /> Granular Services
            </h4>
            <div className="grid gap-3">
                {provider.services?.map((service: any) => (
                    <div key={service.id} className={`p-5 rounded-3xl border transition-all duration-500 flex flex-col gap-4 ${service.is_enabled ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-80'}`}>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${service.is_enabled ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-300'}`} />
                                <div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{service.display_name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5">{service.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-3 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white"
                                    onClick={() => handleOpenConfig(service)}
                                >
                                    <Lock className="h-3 w-3" />
                                </Button>
                                <Switch 
                                    disabled={!provider.is_active}
                                    checked={service.is_enabled} 
                                    onCheckedChange={(checked) => toggleServiceMutation.mutate({serviceId: service.id, status: checked})}
                                    className="scale-75 data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>

      {/* Configuration Modal (Overlaid on Card) */}
      {configuringService && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-10 flex flex-col p-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                      <div className="bg-indigo-600 p-2 rounded-lg"><Lock className="h-5 w-5 text-white" /></div>
                      <div>
                          <h4 className="text-xl font-black text-white tracking-tighter uppercase italic">{configuringService.display_name}</h4>
                          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Secure Vault Configuration</p>
                      </div>
                  </div>
                  <Button variant="ghost" className="text-slate-500 hover:text-white" onClick={() => setConfiguringService(null)}>
                      <X className="h-6 w-6" />
                  </Button>
              </div>

              <div className="flex-grow space-y-6 overflow-y-auto pr-2">
                  {Object.keys(configuringService.config_schema || {}).map((key) => (
                      <div key={key} className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{key.replace(/_/g, ' ')}</Label>
                          <div className="relative">
                              <Input 
                                type={showSecrets[key] ? 'text' : 'password'}
                                value={configValues[key]}
                                onChange={(e) => setConfigValues({...configValues, [key]: e.target.value})}
                                placeholder={`Enter ${key}...`}
                                className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-bold text-white focus:ring-1 focus:ring-indigo-500/50"
                              />
                              <Button 
                                variant="ghost" 
                                className="absolute right-2 top-2 h-10 w-10 text-slate-500 hover:text-white"
                                onClick={() => setShowSecrets({...showSecrets, [key]: !showSecrets[key]})}
                              >
                                {showSecrets[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                          </div>
                      </div>
                  ))}
                  
                  <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 mt-4">
                      <div className="flex gap-4">
                          <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                          <p className="text-[10px] text-indigo-200/60 font-medium leading-relaxed italic">
                              Values are encrypted using AES-256 (Fernet) before storage. Once saved, these values can never be retrieved as plain text by any user, including admins.
                          </p>
                      </div>
                  </div>
              </div>

              <div className="pt-8 flex gap-4">
                  <Button variant="ghost" className="flex-1 h-16 rounded-[24px] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white" onClick={() => setConfiguringService(null)}>
                      Discard
                  </Button>
                  <Button 
                    className="flex-[2] bg-indigo-600 h-16 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/20 text-white border-none"
                    onClick={handleSaveConfig}
                    disabled={updateConfigMutation.isPending}
                  >
                      {updateConfigMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mr-3" /> : <ShieldCheck className="h-5 w-5 mr-3" />}
                      Encrypt & Save
                  </Button>
              </div>
          </div>
      )}

      <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
              <RefreshCw className={`h-3 w-3 text-slate-300 ${provider.is_active ? 'animate-pulse' : ''}`} />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">API V2.0 STABLE</span>
          </div>
          <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all">
             Advanced Setup
          </Button>
      </div>
    </Card>
  );
};

export default IntegrationCard;
