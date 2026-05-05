import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Send, Loader2, Zap, ArrowRightLeft, ShieldCheck, History, Activity, Database, Smartphone, RefreshCw, CheckCircle2, Cpu, Terminal } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const CognitiveCore = () => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', text: "Cognitive Thread Initialized. I am Weezy Prime, your Level 4 Autonomous Orchestrator. The entire bank ledger is currently under my supervision. How shall I assist your innovation today?" }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const protocols = [
    "Synthesizing NUBAN ledger state...",
    "Verifying BVN checksum with NIMC nodes...",
    "Screening transaction vector for AML anomalies...",
    "Simulating interest yield outcomes...",
    "Orchestrating double-entry ledger settlement...",
    "Optimizing NIP switch latency for 0.4ms finality..."
  ];

  useEffect(() => {
    let interval: any;
    if (chatMutation.isPending) {
        interval = setInterval(() => {
            setThinkingStep(prev => (prev + 1) % protocols.length);
        }, 1000);
    } else {
        setThinkingStep(0);
    }
    return () => clearInterval(interval);
  }, [chatMutation.isPending]);

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
        setMessages(prev => [...prev, { role: 'model', text: "System parity error. I could not access the core nodes. Please re-authenticate." }]);
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-14rem)] flex flex-col max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 shrink-0">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Weezy Prime <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Brain className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic">Autonomous Cognitive Intelligence • Phase 4</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Load</p>
                <p className="text-xl font-black text-white italic tracking-tighter uppercase">14.2%</p>
            </div>
            <div className="h-10 w-[1px] bg-white/5" />
            <Badge className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 font-mono text-[10px] tracking-widest uppercase rounded-xl">Ledger Synced</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 flex-1 overflow-hidden">
            {/* Main Chat Interface */}
            <Card className="lg:col-span-3 border-none flex flex-col overflow-hidden obsidian-card">
                <CardHeader className="border-b border-white/5 py-8 px-12 flex flex-row justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                            <div className="w-3 h-3 bg-emerald-500 rounded-full relative shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Quantum Bridge Active</p>
                            <p className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Stream ID: {sessionId?.slice(-8) || 'Handshaking...'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 px-6 text-[10px] font-black uppercase text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" onClick={() => setMessages([{ role: 'model', text: "Cognitive memory purged. Thread reset." }])}>
                        Purge Memory
                    </Button>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
                    <ScrollArea className="h-full p-12">
                        <div className="space-y-16">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                                    <div className={`flex gap-8 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`p-5 rounded-[20px] h-16 w-16 flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 ${m.role === 'user' ? 'bg-indigo-600 text-white rotate-6' : 'bg-white/5 text-indigo-400 border border-white/10 -rotate-6'}`}>
                                            {m.role === 'user' ? <Terminal className="h-8 w-8" /> : <Brain className="h-8 w-8" />}
                                        </div>
                                        <div className="space-y-6">
                                            <div className={`p-8 rounded-[40px] text-[15px] leading-relaxed font-medium shadow-2xl transition-all hover:scale-[1.01] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'glass-dark text-slate-200 rounded-tl-none border-white/5'}`}>
                                                {m.text}
                                            </div>
                                            {m.actions?.length > 0 && (
                                                <div className="flex flex-wrap gap-3 pt-2">
                                                    {m.actions.map((a: string) => (
                                                        <Badge key={a} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                            <ShieldCheck className="h-4 w-4 mr-3" /> Autonomous Exec: {a}
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
                                    <div className="glass-dark border-indigo-500/20 p-8 rounded-[40px] rounded-tl-none flex items-center gap-6 shadow-2xl relative overflow-hidden group min-w-[400px]">
                                        <div className="absolute inset-0 shimmer opacity-10" />
                                        <div className="bg-indigo-600/20 p-3 rounded-2xl border border-indigo-500/30">
                                            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                                        </div>
                                        <div className="space-y-1.5 relative z-10">
                                            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] block">Cognitive Reasoning</span>
                                            <span className="text-sm text-white italic font-mono animate-in slide-in-from-bottom-2 duration-500">{protocols[thinkingStep]}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-10 bg-white/[0.02] border-t border-white/5 backdrop-blur-3xl">
                    <form className="flex w-full gap-6" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <div className="relative flex-1 group">
                            <Input 
                                placeholder="Issue command to the core... e.g. 'Generate a loan restructuring strategy for overdue SMEs'" 
                                className="h-20 pl-10 pr-20 text-lg bg-white/5 border-white/5 focus-visible:ring-1 focus-visible:ring-indigo-500/50 rounded-[32px] font-black italic tracking-tight text-white placeholder:text-slate-600 shadow-2xl transition-all"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={chatMutation.isPending}
                            />
                            <div className="absolute right-8 top-6 text-slate-700 group-focus-within:text-indigo-500 transition-colors duration-500">
                                <Zap className="h-8 w-8" />
                            </div>
                        </div>
                        <Button type="submit" size="icon" className="h-20 w-20 rounded-[32px] bg-indigo-600 shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-white border-none group" disabled={chatMutation.isPending}>
                            <Send className="h-8 w-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            {/* AI Intelligence Sidebar */}
            <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                <Card className="border-none obsidian-card overflow-hidden border-white/5">
                    <CardHeader className="bg-white/5 border-b border-white/5 py-6 px-8">
                        <CardTitle className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.3em] flex items-center gap-3">
                            <Cpu className="h-4 w-4" /> Cognitive Nodes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {[
                            { name: 'NUBAN Ledger', status: 'Core' },
                            { name: 'NACS Clearing', status: 'NIBSS' },
                            { name: 'Fraud Shield', status: 'AI' },
                            { name: 'FX Grid', status: 'Market' },
                        ].map((mod, i) => (
                            <div key={i} className="group flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all">
                                <span className="text-[11px] font-black text-slate-300 uppercase italic tracking-tighter">{mod.name}</span>
                                <Badge variant="outline" className="text-[9px] h-6 px-3 font-black border-white/10 text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all uppercase">{mod.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="obsidian-card bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/10">
                    <CardHeader className="pt-10 px-10 pb-4">
                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-4">
                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" /> Live Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pt-4 space-y-8 relative z-10">
                        <div className="space-y-2">
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Global Switch Latency</p>
                            <p className="text-2xl font-black text-indigo-400 italic tracking-tighter">0.42ms</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Self-Healing Status</p>
                            <p className="text-xl font-black text-emerald-400 flex items-center gap-3 tracking-tighter">
                                OPTIMAL <CheckCircle2 className="h-5 w-5" />
                            </p>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic opacity-60">
                                "Prime has autonomously resolved 14 webhook disparities in the last 60 minutes."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-10 bg-white/5 border border-white/10 rounded-[40px] relative overflow-hidden group">
                    <Sparkles className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-indigo-500/10 -rotate-12" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                        <Activity className="h-4 w-4 text-indigo-500" /> Sentinel Pulse
                    </h4>
                    <p className="text-[12px] text-slate-400 italic leading-relaxed font-medium relative z-10">
                        "Evaluating SME credit landscape in Lagos. Detecting high-velocity growth in retail sector. Suggesting treasury liquidity expansion."
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CognitiveCore;
