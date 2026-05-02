import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Terminal, Cpu, Key, Database, Bot, Zap, Globe, Copy, ShieldCheck, RefreshCw, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const DeveloperHub = () => {
  // --- Agentic Prime State ---
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', parts: [{ text: "Hello Developer. I am Weezy Prime, the autonomous agentic core. I have full tool-use capabilities over this bank. How shall we proceed?" }] }
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

  const { data: mcpConfig } = useQuery({
    queryKey: ['mcpConfig'],
    queryFn: () => apiClient('/dev/mcp/config'),
  });

  const generateKeyMutation = useMutation({
    mutationFn: (name: string) => apiClient('/dev/keys/generate', { method: 'POST', body: JSON.stringify({ key_name: name }) }),
    onSuccess: (data) => {
      setGeneratedKey(data.api_key);
      refetchKeys();
      toast.success('API Key generated successfully');
    },
  });

  const primeChatMutation = useMutation({
    mutationFn: (data: any) => apiClient('/prime/chat', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
      setIsPrimeLoading(false);
    },
  });

  const handlePrimeSend = () => {
    if (!primeInput.trim() || isPrimeLoading) return;
    const userMsg = { role: 'user', parts: [{ text: primeInput }] };
    setMessages(prev => [...prev, userMsg]);
    setIsPrimeLoading(true);
    primeChatMutation.mutate({ message: primeInput, history: messages });
    setPrimeInput('');
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Developer Hub & Agentic Core <Code2 className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">API, MCP, and Autonomous Banking Infrastructure.</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1">v1.0-AGENTIC</Badge>
          </div>
        </div>

        <Tabs defaultValue="prime" className="w-full">
          <TabsList className="bg-gray-100 p-1 rounded-xl mb-6">
            <TabsTrigger value="prime" className="rounded-lg gap-2"><Cpu className="h-4 w-4" /> Weezy Prime</TabsTrigger>
            <TabsTrigger value="mcp" className="rounded-lg gap-2"><Globe className="h-4 w-4" /> MCP Connection</TabsTrigger>
            <TabsTrigger value="api" className="rounded-lg gap-2"><Key className="h-4 w-4" /> API Keys</TabsTrigger>
          </TabsList>

          {/* --- Weezy Prime: Agentic Core --- */}
          <TabsContent value="prime">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="flex flex-col h-[600px] border-none shadow-2xl ring-1 ring-gray-200 overflow-hidden">
                        <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-lg animate-pulse">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Weezy Prime</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Autonomous Core • Tool-Enabled</p>
                                </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-none">CONNECTED</Badge>
                        </div>
                        <CardContent className="flex-1 p-0 bg-slate-50">
                            <ScrollArea className="h-full p-6">
                                <div className="space-y-6">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-slate-800 shadow-sm rounded-tl-none'}`}>
                                                {m.parts[0].text}
                                            </div>
                                        </div>
                                    ))}
                                    {isPrimeLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                                <span className="text-xs text-slate-500 italic font-mono">Agent is executing tools...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <CardFooter className="p-4 bg-white border-t border-gray-100">
                            <form className="flex w-full gap-2" onSubmit={(e) => { e.preventDefault(); handlePrimeSend(); }}>
                                <Input 
                                    placeholder="Instruct the core... (e.g. 'Check my balance and move half to 0011223344')" 
                                    className="flex-1 font-mono text-xs border-none bg-slate-50 focus-visible:ring-indigo-500"
                                    value={primeInput}
                                    onChange={e => setPrimeInput(e.target.value)}
                                    disabled={isPrimeLoading}
                                />
                                <Button type="submit" size="icon" className="bg-indigo-600 shadow-lg shadow-indigo-200" disabled={isPrimeLoading}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-gray-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase text-slate-500">
                                <Terminal className="h-4 w-4" /> Available Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { name: 'get_account_balance', desc: 'Real-time ledger access' },
                                { name: 'perform_transfer', desc: 'Atomic double-entry' },
                                { name: 'verify_beneficiary', desc: 'NIBSS NIP Enquiry' },
                                { name: 'analyze_customer_risk', desc: 'Gemini Risk Profiling' },
                            ].map((tool, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs font-mono font-bold text-indigo-600">{tool.name}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{tool.desc}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-xl relative overflow-hidden">
                        <Zap className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 opacity-10" />
                        <h4 className="font-bold mb-2">Agentic Vision</h4>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                            "Weezy Prime" is not just a chatbot. It is a tool-enabled autonomous agent that can reason across the entire core banking system.
                        </p>
                    </div>
                </div>
             </div>
          </TabsContent>

          {/* --- MCP Connection Settings --- */}
          <TabsContent value="mcp">
            <Card className="border-none shadow-sm ring-1 ring-gray-200 max-w-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-indigo-600" /> Model Context Protocol (MCP)
                    </CardTitle>
                    <CardDescription>Expose Weezy Bank functions as tools to your own local AI (Claude/Cursor).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
                        <p className="text-slate-500 mb-2">// sse config for claude_desktop_config.json</p>
                        <pre>{JSON.stringify({
                            mcpServers: {
                                "weezy-bank": {
                                    url: mcpConfig?.endpoint || "http://localhost:8000/api/mcp/sse"
                                }
                            }
                        }, null, 2)}</pre>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold">Why use MCP?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-xs font-bold mb-1">Local Control</p>
                                <p className="text-[10px] text-gray-500">Run your own agent locally but give it access to Weezy ledger data.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                <p className="text-xs font-bold mb-1">Unified Tools</p>
                                <p className="text-[10px] text-gray-500">Standardized protocol for AI tool discovery and execution.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* --- API Keys Management --- */}
          <TabsContent value="api">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle>Manage API Keys</CardTitle>
                        <CardDescription>Authentication for external applications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="Key Name (e.g. My Website)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                            <Button className="bg-indigo-600" onClick={() => generateKeyMutation.mutate(newKeyName)} disabled={generateKeyMutation.isPending}>
                                Generate
                            </Button>
                        </div>

                        {generatedKey && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-2">
                                <p className="text-xs font-bold text-yellow-800 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" /> Copy your key now!
                                </p>
                                <div className="flex items-center gap-2 bg-white p-2 border rounded-lg">
                                    <code className="text-xs flex-1 truncate">{generatedKey}</code>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success('Key copied'); }}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Your Keys</Label>
                            {keys?.length > 0 ? (
                                keys.map((k: any) => (
                                    <div key={k.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50">
                                        <div>
                                            <p className="text-sm font-bold">{k.key_name}</p>
                                            <code className="text-[9px] text-gray-400 font-mono">{k.api_key_hint}</code>
                                        </div>
                                        <Badge className="bg-indigo-100 text-indigo-700 border-none text-[9px]">ACTIVE</Badge>
                                    </div>
                                ))
                            ) : <p className="text-xs text-gray-400 italic p-4">No active API keys found.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-blue-600" /> Platform API Documentation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold">Base URL</p>
                            <code className="text-[10px] bg-slate-100 p-1 px-2 rounded block font-mono">http://localhost:8000/api/v1</code>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-bold">Example: Transfer</p>
                            <div className="p-3 bg-slate-900 rounded-lg font-mono text-[9px] text-slate-300">
                                <span className="text-emerald-400">POST</span> /transactions/initiate<br/>
                                <span className="text-blue-400">Header:</span> X-API-KEY: wzy_...<br/>
                                <span className="text-blue-400">Body:</span> {"{"} "amount": 5000, "dest": "..." {"}"}
                            </div>
                        </div>
                        <Button variant="outline" className="w-full text-xs gap-2" onClick={() => window.open('http://localhost:8000/docs', '_blank')}>
                            <ExternalLink className="h-3 w-3" /> View Swagger / OpenAPI Specs
                        </Button>
                    </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DeveloperHub;
