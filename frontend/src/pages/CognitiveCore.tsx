import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Send, Loader2, Zap, ArrowRightLeft, ShieldCheck, History, Activity, Database, Smartphone } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const CognitiveCore = () => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', text: "Welcome to Weezy AI-Native. I am your Cognitive Core. I have direct access to your accounts, transfers, and risk profiles. How can I serve you today?" }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (data: any) => apiClient('/cognitive/converse', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'model', text: data.reply, actions: data.executed_actions }]);
    },
    onError: (err: any) => {
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error accessing the core systems. Please try again." }]);
        toast.error(err.message || 'Cognitive Core offline');
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    chatMutation.mutate({ message: input, session_id: sessionId, history: [] }); // Simplified history for MVP
    setInput('');
  };

  const renderActionBadge = (action: string) => {
    return (
        <Badge key={action} className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1 text-[10px] animate-in slide-in-from-left duration-500">
            <Zap className="h-3 w-3" /> Tool Executed: {action}
        </Badge>
    );
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                Cognitive Banking Core <Brain className="h-8 w-8 text-indigo-600 animate-pulse" />
            </h1>
            <p className="text-gray-600 mt-1">Autonomous, AI-Native banking orchestration for the Nigerian market.</p>
          </div>
          <Badge className="bg-indigo-900 text-white border-none px-4 py-1">AI-NATIVE ENGINE</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
            {/* Chat Area */}
            <Card className="lg:col-span-3 border-none shadow-2xl ring-1 ring-gray-200 flex flex-col overflow-hidden bg-slate-50">
                <CardHeader className="bg-white border-b py-3 px-6 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Session: {sessionId || 'Initializing...'}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px]" onClick={() => setMessages([{ role: 'model', text: "Session reset. How can I help?" }])}>
                        Clear Thread
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-6">
                        <div className="space-y-8">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border'}`}>
                                            {m.role === 'user' ? <Activity className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                                        </div>
                                        <div className="space-y-2">
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tl-none'}`}>
                                                {m.text}
                                            </div>
                                            {m.actions?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {m.actions.map((a: string) => renderActionBadge(a))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-white border p-4 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                        <span className="text-xs text-slate-500 italic font-mono uppercase tracking-tighter">Core is reasoning across modules...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-6 bg-white border-t">
                    <form className="flex w-full gap-3" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <div className="relative flex-1">
                            <Input 
                                placeholder="Command the bank... e.g. 'Move 50k to my USD account and check my risk profile'" 
                                className="h-14 pl-6 pr-12 text-sm bg-slate-50 border-none focus-visible:ring-indigo-500 rounded-2xl"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={chatMutation.isPending}
                            />
                            <div className="absolute right-4 top-4 text-slate-300">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                        <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform" disabled={chatMutation.isPending}>
                            <Send className="h-6 w-6" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            {/* Capability Sidebar */}
            <div className="space-y-6 overflow-y-auto">
                <Card className="border-none shadow-sm ring-1 ring-gray-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" /> Active Modules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { name: 'Double-Entry Ledger', status: 'Core' },
                            { name: 'NIBSS NACS Clearing', status: 'Core' },
                            { name: 'AI Fraud Shield', status: 'AI' },
                            { name: 'FX Swap Engine', status: 'Commercial' },
                            { name: 'Credit Risk AI', status: 'Lending' },
                        ].map((mod, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-700">{mod.name}</span>
                                <Badge variant="outline" className="text-[8px] h-4 py-0">{mod.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Database className="h-24 w-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                             System Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">NUBAN Mapped</p>
                            <p className="text-sm font-mono text-indigo-400">9990011223</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">BVN Status</p>
                            <p className="text-sm font-mono text-green-400">VERIFIED</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">KYC Tier</p>
                            <p className="text-sm font-mono text-amber-400">Tier 3 (Full)</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-indigo-700 uppercase mb-2 flex items-center gap-2">
                        <History className="h-3 w-3" /> Recent Auto-Actions
                    </h4>
                    <div className="space-y-2">
                        <p className="text-[9px] text-indigo-600 italic leading-relaxed">
                            "Last action: Performed NIP Name Enquiry for recipient 0011223344 at 16:42 WAT"
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default CognitiveCore;
