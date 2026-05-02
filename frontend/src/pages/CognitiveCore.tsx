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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4 italic">
                PRIME CORE <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 animate-pulse"><Brain className="h-6 w-6 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium">Autonomous Cognitive Orchestrator • Level 4 Intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-4">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">0{i}</div>)}
            </div>
            <Badge className="bg-slate-900 text-indigo-400 border-indigo-500/30 px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase ring-1 ring-white/10">Connected to Ledger</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
            {/* Chat Area */}
            <Card className="lg:col-span-3 border-none shadow-2xl ring-1 ring-slate-200/60 flex flex-col overflow-hidden bg-white rounded-[32px]">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-8 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                            <div className="w-3 h-3 bg-emerald-500 rounded-full relative" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Identity: {sessionId?.split('-').pop() || 'Initializing Intelligence...'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 rounded-xl" onClick={() => setMessages([{ role: 'model', text: "Cognitive thread reset. Awaiting commands." }])}>
                            Purge Memory
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
                    <ScrollArea className="h-full p-8">
                        <div className="space-y-10">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-6 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`p-3 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0 shadow-xl transition-all ${m.role === 'user' ? 'bg-indigo-600 text-white rotate-3 group-hover:rotate-0' : 'bg-white text-indigo-600 border border-slate-100 -rotate-3 group-hover:rotate-0'}`}>
                                            {m.role === 'user' ? <Activity className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                                        </div>
                                        <div className="space-y-3">
                                            <div className={`p-5 rounded-3xl text-sm leading-relaxed font-medium shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                                                {m.text}
                                            </div>
                                            {m.actions?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1 animate-in zoom-in-95 duration-500">
                                                    {m.actions.map((a: string) => (
                                                        <Badge key={a} className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest ring-1 ring-emerald-500/20">
                                                            <ShieldCheck className="h-3 w-3 mr-1.5" /> Executed: {a}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatMutation.isPending && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="bg-indigo-900 border-none p-5 rounded-3xl rounded-tl-none flex items-center gap-4 shadow-2xl">
                                        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-indigo-300 font-black uppercase tracking-widest block">Neural Reasoning</span>
                                            <span className="text-xs text-white italic font-mono">Orchestrating banking modules...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-8 bg-white border-t border-slate-50">
                    <form className="flex w-full gap-4" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <div className="relative flex-1 group">
                            <Input 
                                placeholder="Enter natural language banking command..." 
                                className="h-16 pl-8 pr-16 text-sm bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-[24px] font-medium shadow-inner"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={chatMutation.isPending}
                            />
                            <div className="absolute right-6 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                <Zap className="h-6 w-6" />
                            </div>
                        </div>
                        <Button type="submit" size="icon" className="h-16 w-16 rounded-[24px] bg-indigo-600 shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-white border-none" disabled={chatMutation.isPending}>
                            <Send className="h-7 w-7" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            {/* Capability Sidebar */}
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-3xl bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secured Nodes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        {[
                            { name: 'NUBAN Ledger', status: 'Core' },
                            { name: 'NACS Clearing', status: 'NIBSS' },
                            { name: 'Fraud Shield', status: 'AI' },
                            { name: 'FX Swap Grid', status: 'Market' },
                            { name: 'Risk Scoring', status: 'AML' },
                        ].map((mod, i) => (
                            <div key={i} className="group flex justify-between items-center p-3 rounded-2xl bg-white border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-default">
                                <span className="text-[10px] font-black text-slate-600">{mod.name}</span>
                                <Badge variant="outline" className="text-[8px] h-4 py-0 font-black border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors uppercase">{mod.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Database className="h-24 w-24" />
                    </div>
                    <CardHeader className="pt-6 px-6 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Active Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">NUBAN Identity</p>
                            <p className="text-sm font-mono text-indigo-400 font-bold">9990011223</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">BVN Integrity</p>
                            <p className="text-sm font-mono text-emerald-400 font-bold flex items-center gap-2">
                                VERIFIED <CheckCircle className="h-3 w-3" />
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Compliance Tier</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-mono text-amber-400 font-bold">Tier 3</p>
                                <Badge className="bg-indigo-500 text-[8px] h-4 border-none">UNLIMITED</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[24px] relative overflow-hidden group">
                    <History className="absolute bottom-[-10px] right-[-10px] h-20 w-20 text-indigo-200/30 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Auto-Audit
                    </h4>
                    <div className="space-y-3 relative z-10">
                        <p className="text-[10px] text-indigo-600 italic leading-relaxed font-medium">
                            "Prime analyzed 5 recent inflows and confirmed beneficiary 'John Doe' as low risk before transfer execution."
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
