import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Send, Loader2, Zap, ArrowRightLeft, ShieldCheck, History, Activity, Database, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
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
    chatMutation.mutate({ message: input, session_id: sessionId, history: [] });
    setInput('');
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
            <Card className="lg:col-span-3 border-none shadow-2xl ring-1 ring-slate-200/60 flex flex-col overflow-hidden bg-white rounded-[40px] glass">
                <CardHeader className="bg-white/50 border-b border-slate-100 py-6 px-10 flex flex-row justify-between items-center backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                            <div className="w-3 h-3 bg-emerald-500 rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Bridge Active</p>
                            <p className="text-[9px] font-mono text-indigo-500 font-bold">SID: {sessionId?.slice(-8) || 'INITIALIZING...'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-4 text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" onClick={() => setMessages([{ role: 'model', text: "Cognitive thread purged. System awaiting commands." }])}>
                        Clear Stream
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
                    <ScrollArea className="h-full p-10">
                        <div className="space-y-12">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                    <div className={`flex gap-6 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`p-4 rounded-2xl h-14 w-14 flex items-center justify-center shrink-0 shadow-xl transition-all duration-500 ${m.role === 'user' ? 'bg-indigo-600 text-white rotate-3 group-hover:rotate-0' : 'bg-white text-indigo-600 border border-slate-100 -rotate-3 group-hover:rotate-0'}`}>
                                            {m.role === 'user' ? <Activity className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
                                        </div>
                                        <div className="space-y-4">
                                            <div className={`p-6 rounded-[32px] text-sm leading-relaxed font-medium shadow-sm transition-all hover:shadow-md ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                                                {m.text}
                                            </div>
                                            {m.actions?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1 animate-in zoom-in-95 duration-700">
                                                    {m.actions.map((a: string) => (
                                                        <Badge key={a} className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ring-1 ring-emerald-500/20 shadow-sm">
                                                            <ShieldCheck className="h-3.5 w-3.5 mr-2" /> EXEC: {a}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-900 border-none p-6 rounded-[32px] rounded-tl-none flex items-center gap-5 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 shimmer opacity-10" />
                                        <div className="bg-indigo-600/20 p-2 rounded-xl">
                                            <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                                        </div>
                                        <div className="space-y-1 relative z-10">
                                            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] block">Cognitive Reasoning</span>
                                            <span className="text-xs text-white italic font-mono">Synthesizing banking protocols...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-8 bg-white/50 border-t border-slate-50 backdrop-blur-md">
                    <form className="flex w-full gap-5" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <div className="relative flex-1 group">
                            <Input 
                                placeholder="Command the system... e.g. 'Pay my staff and check my risk profile'" 
                                className="h-16 pl-8 pr-16 text-sm bg-slate-100/50 border-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 rounded-[28px] font-medium shadow-inner transition-all"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={chatMutation.isPending}
                            />
                            <div className="absolute right-6 top-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors duration-500">
                                <Zap className="h-6 w-6" />
                            </div>
                        </div>
                        <Button type="submit" size="icon" className="h-16 w-16 rounded-[28px] bg-indigo-600 shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-white border-none group" disabled={chatMutation.isPending}>
                            <Send className="h-7 w-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            {/* Capability Sidebar */}
            <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <Card className="border-none shadow-sm ring-1 ring-slate-200/60 rounded-[32px] bg-white overflow-hidden glass">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-6">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" /> SYSTEM NODES
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3">
                        {[
                            { name: 'NUBAN Ledger', status: 'Core' },
                            { name: 'NACS Clearing', status: 'NIBSS' },
                            { name: 'Fraud Shield', status: 'AI' },
                            { name: 'FX Swap Grid', status: 'Market' },
                        ].map((mod, i) => (
                            <div key={i} className="group flex justify-between items-center p-3.5 rounded-2xl bg-white border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-default">
                                <span className="text-[10px] font-black text-slate-700">{mod.name}</span>
                                <Badge variant="outline" className="text-[8px] h-5 py-0 font-black border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all uppercase">{mod.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Database className="h-24 w-24" />
                    </div>
                    <CardHeader className="pt-8 px-8 pb-3">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> LIVE CONTEXT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6 relative z-10">
                        <div className="space-y-1.5">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Master Identity</p>
                            <p className="text-sm font-mono text-indigo-400 font-bold tracking-widest">9990011223</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">BVN Integrity</p>
                            <p className="text-sm font-mono text-emerald-400 font-bold flex items-center gap-2 tracking-widest">
                                VERIFIED <CheckCircle2 className="h-3.5 w-3.5" />
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Compliance Tier</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-mono text-amber-400 font-bold tracking-widest">Tier 3</p>
                                <Badge className="bg-indigo-600 text-white border-none text-[8px] h-5 font-black uppercase tracking-tighter">UNLIMITED</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[32px] relative overflow-hidden group">
                    <History className="absolute bottom-[-15px] right-[-15px] h-24 w-24 text-indigo-200/40 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5" /> AUTO-AUDIT
                    </h4>
                    <div className="space-y-4 relative z-10">
                        <p className="text-[10px] text-indigo-600 italic leading-relaxed font-semibold">
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
