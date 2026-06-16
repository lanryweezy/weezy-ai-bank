import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Send, 
  Loader2, 
  Zap, 
  ArrowRightLeft, 
  ShieldCheck, 
  History, 
  Activity, 
  Database, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  Cpu, 
  Terminal,
  MoreVertical,
  Target,
  Compass,
  Plus,
  LayoutTemplate,
  Wand2,
  FastForward,
  Play,
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Search,
  Globe
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';
import { cn } from '@/lib/utils';

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
        }, 3000);
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen text-white selection:bg-indigo-500/30 overflow-x-hidden pb-20"
    >
      <NeuralBackdrop />
      <SentientNavigation />
      <ThinkingStream />
      
      <main className="pl-32 pr-12 py-12 space-y-12 relative z-10 h-screen flex flex-col">
        
        {/* Executive Header */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-10 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[2px] bg-indigo-500" 
              />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Prime_Cognition_Active</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Weezy <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Prime</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Autonomous Ledger Orchestration // Sentient Core v4.8
            </p>
          </div>
          
          <div className="flex gap-8 mr-2 items-center">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural_Load</span>
                <div className="flex items-center gap-3 mt-1">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,1)]" />
                    <span className="text-2xl font-black text-white italic uppercase tracking-tight">14.2%_OPTIMAL</span>
                </div>
              </div>
              <Badge className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 font-mono text-[10px] tracking-[0.4em] uppercase rounded-xl">LATTICE_SYNCED</Badge>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 flex-1 overflow-hidden">
            {/* Main Chat Interface */}
            <HolographicCard className="lg:col-span-3 p-0 overflow-hidden flex flex-col border-white/5 bg-[#010102]/60">
                <div className="border-b border-white/5 py-6 px-12 flex flex-row justify-between items-center bg-white/[0.02] backdrop-blur-3xl shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full relative shadow-[0_0_15px_#10b981]" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Sovereign_Lattice_Active</p>
                            <p className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest mt-1 italic">Stream_ID: {sessionId?.slice(-8) || 'Handshaking...'}</p>
                        </div>
                    </div>
                    <button className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all" onClick={() => setMessages([{ role: 'model', text: "Cognitive memory purged. Thread reset." }])}>
                        Purge_Lattice_Cache
                    </button>
                </div>
                
                <div className="flex-1 overflow-hidden relative bg-[#010102]/40">
                    <ScrollArea className="h-full px-12 py-16">
                        <div className="space-y-20 max-w-5xl mx-auto">
                            {messages.map((m, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    key={i} 
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-10 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={cn(
                                            "p-6 rounded-[28px] h-20 w-20 flex items-center justify-center shrink-0 shadow-2xl transition-all duration-700",
                                            m.role === 'user' ? "bg-indigo-600 text-white rotate-6" : "bg-white/5 text-indigo-400 border border-white/10 -rotate-6"
                                        )}>
                                            {m.role === 'user' ? <Terminal className="h-10 w-10" /> : <Brain className="h-10 w-10" />}
                                        </div>
                                        <div className="space-y-8">
                                            <div className={cn(
                                                "p-10 rounded-[48px] text-[16px] leading-relaxed font-medium shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.01] border",
                                                m.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none border-white/10" : "bg-white/[0.02] backdrop-blur-3xl text-slate-200 rounded-tl-none border-white/5"
                                            )}>
                                                {m.text}
                                            </div>
                                            {m.actions?.length > 0 && (
                                                <div className="flex flex-wrap gap-4 pt-2">
                                                    {m.actions.map((a: string) => (
                                                        <div key={a} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl flex items-center gap-4">
                                                            <ShieldCheck className="h-5 w-5" /> Autonomous_Exec: {a}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {chatMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-white/[0.01] border border-indigo-500/20 p-10 rounded-[48px] rounded-tl-none flex items-center gap-8 shadow-2xl relative overflow-hidden group min-w-[450px] backdrop-blur-3xl">
                                        <div className="bg-indigo-600/20 p-4 rounded-[24px] border border-indigo-500/30">
                                            <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                                        </div>
                                        <div className="space-y-2 relative z-10">
                                            <span className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.4em] block">Cognitive_Reasoning</span>
                                            <span className="text-base text-white italic font-mono animate-pulse">{protocols[thinkingStep]}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-10 bg-black/60 border-t border-white/10 backdrop-blur-3xl shrink-0">
                    <form className="flex w-full gap-8 max-w-6xl mx-auto" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <div className="relative flex-1 group">
                            <input 
                                placeholder="Issue command to the core... e.g. 'Synthesize loan strategy'" 
                                className="h-24 w-full pl-12 pr-24 text-2xl bg-white/[0.03] border border-white/5 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-[40px] font-black italic tracking-tight text-white placeholder:text-slate-900 shadow-2xl transition-all"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={chatMutation.isPending}
                            />
                            <div className="absolute right-10 top-8 text-slate-800 group-focus-within:text-indigo-500 transition-colors duration-700 animate-pulse">
                                <Zap className="h-8 w-8" />
                            </div>
                        </div>
                        <button type="submit" className="h-24 w-24 rounded-[40px] bg-indigo-600 shadow-[0_0_50px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center group" disabled={chatMutation.isPending}>
                            <Send className="h-10 w-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </HolographicCard>

            {/* AI Intelligence Sidebar */}
            <div className="space-y-12 overflow-y-auto pr-4 custom-scrollbar">
                <SentientFrame intent="neutral" title="Cognitive Nodes" subtitle="Live module synchronization">
                    <div className="space-y-5">
                        {[
                            { name: 'NUBAN Ledger', status: 'CORE' },
                            { name: 'NACS Clearing', status: 'NIBSS' },
                            { name: 'Fraud Shield', status: 'AI' },
                            { name: 'FX Grid', status: 'MARKET' },
                        ].map((mod, i) => (
                            <div key={i} className="group flex justify-between items-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                                <span className="text-[12px] font-black text-slate-400 uppercase italic tracking-tighter group-hover:text-white transition-colors">{mod.name}</span>
                                <Badge className="bg-white/5 text-slate-600 border border-white/10 text-[9px] font-black group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all uppercase tracking-widest">{mod.status}</Badge>
                            </div>
                        ))}
                    </div>
                </SentientFrame>

                <HolographicCard className="p-10 bg-gradient-to-br from-indigo-900/10 to-transparent">
                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-5">
                             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]" />
                             <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Live Intelligence</h4>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] italic">Switch_Latency</p>
                            <p className="text-4xl font-black text-indigo-400 italic tracking-tighter leading-none">0.42ms</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] italic">Self_Healing</p>
                            <p className="text-2xl font-black text-emerald-400 flex items-center gap-4 tracking-tighter uppercase leading-none">
                                Optimal <CheckCircle2 className="h-6 w-6" />
                            </p>
                        </div>
                        <div className="pt-8 border-t border-white/5">
                            <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic">
                                "Prime has autonomously resolved 14 webhook disparities in the current node cycle."
                            </p>
                        </div>
                    </div>
                </HolographicCard>

                <div className="p-10 bg-white/[0.01] border border-indigo-500/10 rounded-[48px] relative overflow-hidden group">
                    <Sparkles className="absolute bottom-[-30px] right-[-30px] h-40 w-40 text-indigo-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.5em] mb-8 flex items-center gap-4 italic leading-none">
                        <Activity className="h-6 w-6 text-indigo-400 animate-pulse" /> Sentinel_Pulse
                    </h4>
                    <p className="text-base font-medium text-slate-500 italic leading-relaxed relative z-10">
                        "Evaluating SME credit landscape in Lagos. Detecting high-velocity growth in retail sector. Suggesting treasury liquidity expansion to node Sector_4."
                    </p>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default CognitiveCore;
