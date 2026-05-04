import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Key, 
  Database, 
  Bot, 
  Zap, 
  Globe, 
  Copy, 
  ShieldCheck, 
  RefreshCw, 
  Send, 
  Loader2, 
  Sparkles, 
  MessageSquare,
  ExternalLink,
  Activity,
  Clock,
  Book,
  Layers
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const DeveloperHub = () => {
  const [activeTab, setActiveTab] = useState('prime');
  
  // --- Agentic Prime State ---
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', parts: [{ text: "Hello Engineering lead. I am Weezy Prime, the bank's autonomous cognitive core. I have full tool-use authority over the ledger and risk engines. How shall we collaborate?" }] }
  ]);
  const [primeInput, setPrimeInput] = useState('');
  const [isPrimeLoading, setIsPrimeLoading] = useState(false);

  // --- API Keys State ---
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const { data: keys, refetch: refetchKeys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => apiClient('/dev/keys/me'),
  });

  const generateKeyMutation = useMutation({
    mutationFn: (name: string) => apiClient('/dev/keys/generate', { method: 'POST', body: JSON.stringify({ key_name: name }) }),
    onSuccess: (data) => {
      setGeneratedKey(data.api_key);
      refetchKeys();
      toast.success('Forensic key generated.');
    },
  });

  const primeChatMutation = useMutation({
    mutationFn: (data: any) => apiClient('/cognitive/prime/chat', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
      setIsPrimeLoading(false);
    },
    onError: () => setIsPrimeLoading(false)
  });

  const handlePrimeSend = () => {
    if (!primeInput.trim() || isPrimeLoading) return;
    const userMsg = { role: 'user', parts: [{ text: primeInput }] };
    setMessages(prev => [...prev, userMsg]);
    setIsPrimeLoading(true);
    primeChatMutation.mutate({ message: primeInput, history: messages });
    setPrimeInput('');
  };

  const apiGroups = [
    {
      title: 'Ledger & Identity',
      icon: Database,
      endpoints: [
        { method: 'GET', path: '/alm/accounts/me', desc: 'Fetch user profiles & ledger balances' },
        { method: 'POST', path: '/alm/accounts/verify', desc: 'Validate NUBAN checksum & KYV status' },
        { method: 'GET', path: '/gl/coa', desc: 'Retrieve full System Trial Balance' }
      ]
    },
    {
      title: 'Financial Switch',
      icon: Zap,
      endpoints: [
        { method: 'POST', path: '/transactions/initiate', desc: 'Initialize NIP/ISO-8583 message' },
        { method: 'GET', path: '/transactions/history', desc: 'Fetch forensic switch logs' },
        { method: 'POST', path: '/transactions/{id}/dispute', desc: 'Initialize dispute protocol' }
      ]
    },
    {
      title: 'Cognitive Engine',
      icon: Brain,
      endpoints: [
        { method: 'POST', path: '/cognitive/prime/chat', desc: 'Direct neural core instruction' },
        { method: 'POST', path: '/fraud/screen', desc: 'Real-time anomaly scoring' },
        { method: 'GET', path: '/admin/workflow-audit', desc: 'Audit decision vectors' }
      ]
    }
  ];

  return (
    <Layout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                ENGINEERING HUB <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200"><Code2 className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Autonomous Infrastructure Control & API Governance.</p>
          </div>
          <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-[20px] backdrop-blur-sm ring-1 ring-slate-200/50">
              {[
                { id: 'prime', label: 'Weezy Prime', icon: Cpu },
                { id: 'docs', label: 'API Reference', icon: Book },
                { id: 'keys', label: 'Access Keys', icon: Key }
              ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              ))}
          </div>
        </div>

        {activeTab === 'prime' && (
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3">
                    <Card className="flex flex-col h-[650px] border-none shadow-2xl ring-1 ring-slate-200/60 rounded-[40px] overflow-hidden bg-white">
                        <div className="bg-slate-900 p-6 text-white flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent pointer-events-none" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20 animate-pulse">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-black tracking-tight italic uppercase">Weezy Prime Core</p>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em] leading-none mt-1">Autonomous Banking Orchestrator</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 relative z-10">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[9px] tracking-widest">LIVE SYNC</Badge>
                            </div>
                        </div>
                        <CardContent className="flex-1 p-0 bg-slate-50/50">
                            <ScrollArea className="h-full p-8">
                                <div className="space-y-8">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-5 rounded-[28px] text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none font-bold' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none font-medium italic'}`}>
                                                {m.parts[0].text}
                                            </div>
                                        </div>
                                    ))}
                                    {isPrimeLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-slate-100 p-5 rounded-[28px] rounded-tl-none flex items-center gap-4 shadow-sm animate-in slide-in-from-left-2 duration-300">
                                                <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                                                <span className="text-xs text-slate-500 font-black uppercase tracking-widest italic">Core is reasoning...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="p-6 bg-white border-t border-slate-100">
                            <form className="flex w-full gap-4 items-center" onSubmit={(e) => { e.preventDefault(); handlePrimeSend(); }}>
                                <div className="relative flex-1 group">
                                    <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <Input 
                                        placeholder="Enter core instruction... (e.g. 'Audit the loan portfolio for high DTI risks')" 
                                        className="h-16 pl-12 rounded-[24px] bg-slate-50 border-none px-6 font-bold text-sm shadow-inner focus-visible:ring-4 focus-visible:ring-indigo-500/10"
                                        value={primeInput}
                                        onChange={e => setPrimeInput(e.target.value)}
                                        disabled={isPrimeLoading}
                                    />
                                </div>
                                <Button type="submit" size="icon" className="h-16 w-16 bg-slate-900 rounded-[24px] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 border-none" disabled={isPrimeLoading}>
                                    <Send className="h-6 w-6 text-white" />
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Core Capabilities</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Atomic Postings', icon: Layers, color: 'indigo' },
                            { name: 'Forensic Audit', icon: ShieldCheck, color: 'emerald' },
                            { name: 'NIP Switching', icon: Zap, color: 'blue' },
                            { name: 'Risk Scoring', icon: Activity, color: 'rose' }
                        ].map((cap, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-[24px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                                <div className={`p-3 bg-${cap.color}-50 rounded-xl text-${cap.color}-600 group-hover:bg-${cap.color}-600 group-hover:text-white transition-all`}>
                                    <cap.icon className="h-5 w-5" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">{cap.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'docs' && (
            <div className="grid grid-cols-1 gap-10">
                {apiGroups.map((group, i) => (
                    <div key={i} className="space-y-6">
                        <div className="flex items-center gap-4 px-1">
                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><group.icon className="h-5 w-5" /></div>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">{group.title}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {group.endpoints.map((ep, j) => (
                                <Card key={j} className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white hover:shadow-2xl transition-all group overflow-hidden">
                                    <div className="p-8 flex items-center justify-between">
                                        <div className="flex items-center gap-6 flex-1">
                                            <Badge className={`h-10 px-5 rounded-xl font-mono font-black text-[10px] border-none shadow-inner ${ep.method === 'GET' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {ep.method}
                                            </Badge>
                                            <div className="space-y-1">
                                                <code className="text-sm font-black text-slate-900 tracking-tight">/api/corebanking{ep.path}</code>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">"{ep.desc}"</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><ExternalLink className="h-5 w-5" /></Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'keys' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="border-none shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-[40px] overflow-hidden">
                    <CardHeader className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Key className="h-20 w-20" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Generate Key</CardTitle>
                        <CardDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest mt-2">Provision Infrastructure Access</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instruction Context (Name)</Label>
                            <div className="flex gap-3">
                                <Input placeholder="e.g. Payroll Portal Integration" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" />
                                <Button onClick={() => generateKeyMutation.mutate(newKeyName)} disabled={generateKeyMutation.isPending || !newKeyName} className="h-14 rounded-2xl bg-slate-900 px-8 font-black uppercase text-[10px] tracking-widest text-white border-none shadow-xl shadow-slate-200">
                                    {generateKeyMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Provision'}
                                </Button>
                            </div>
                        </div>

                        {generatedKey && (
                            <div className="p-6 bg-amber-50 rounded-[28px] border border-amber-100 animate-in zoom-in-95 duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><ShieldCheck className="h-4 w-4" /></div>
                                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Secret Key Generated</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-amber-200/50 shadow-inner overflow-hidden">
                                    <code className="text-xs font-mono font-black text-slate-900 flex-1 truncate">{generatedKey}</code>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-amber-600 hover:bg-amber-100 rounded-xl" onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success('Key indexed.'); }}>
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                </div>
                                <p className="text-[9px] text-amber-700/60 font-medium italic mt-4 leading-relaxed">
                                    "This key will not be displayed again. Index it within your secure environment immediately."
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 pt-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Active Credentials</h3>
                            {keys?.length > 0 ? (
                                <div className="space-y-3">
                                    {keys.map((k: any) => (
                                        <div key={k.id} className="flex justify-between items-center p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group">
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight italic">{k.key_name}</p>
                                                <code className="text-[10px] text-slate-400 font-mono font-bold mt-1 block">{k.api_key_hint}</code>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[8px] px-3 uppercase tracking-widest">ACTIVE</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : <div className="p-10 text-center text-slate-300 italic font-medium text-xs">No infrastructure keys provisioned.</div>}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Integration Pulse</h3>
                    <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[40px] bg-white p-10 space-y-10">
                        {[
                            { label: 'Platform Uptime', value: '99.98%', icon: Activity, color: 'emerald' },
                            { label: 'Median Latency', value: '42ms', icon: Clock, color: 'blue' },
                            { label: 'Active Webhooks', value: '14 Nodes', icon: Globe, color: 'indigo' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 bg-${stat.color}-50 rounded-2xl text-${stat.color}-600 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <h4 className="text-xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h4>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        ))}
                        
                        <div className="p-6 bg-slate-900 rounded-[32px] text-white relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 relative z-10">System Protocol</p>
                             <p className="text-xs text-slate-400 italic leading-relaxed relative z-10 font-medium">
                                "API access is strictly logged in the Forensic Trail. Unauthorized attempts are automatically quarantined by Fraud Shield."
                             </p>
                        </div>
                    </Card>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default DeveloperHub;
