import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Activity, 
  Clock, 
  Zap, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Globe, 
  RefreshCw,
  Search,
  ChevronRight,
  ChevronLeft,
  Users,
  Target,
  Compass,
  Plus,
  LayoutTemplate,
  Wand2,
  FastForward,
  Play,
  X,
  Copy
} from 'lucide-react';
import apiClient from '@/services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import NeuralBackdrop from '@/components/ui/NeuralBackdrop';
import SentientNavigation from '@/components/ui/SentientNavigation';
import ThinkingStream from '@/components/ui/ThinkingStream';
import HolographicCard from '@/components/ui/HolographicCard';
import SentientFrame from '@/components/ui/SentientFrame';

const IntelligenceTerminal = () => {
  const [history, setHistory] = useState<any[]>([
    { type: 'text', content: "WEEZY COGNITIVE TERMINAL [Version 4.8.0]\n(c) 2035 Weezy AI Banking Group. All rights reserved.\n\nType 'help' for available commands or ask a data question directly.\nLattice Handshake: Verified." }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeMutation = useMutation({
    mutationFn: (cmd: string) => apiClient('/corebanking/terminal/execute', { method: 'POST', body: JSON.stringify({ command: cmd }) }),
    onSuccess: (res) => {
        setHistory(prev => [...prev, res]);
    },
    onError: (err: any) => {
        setHistory(prev => [...prev, { type: 'error', content: err.message || 'System fault during command execution.' }]);
    }
  });

  const handleCommand = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || executeMutation.isPending) return;
      
      const cmd = input.trim();
      setHistory(prev => [...prev, { type: 'command', content: cmd }]);
      setCommandHistory(prev => [cmd, ...prev]);
      setHistoryIndex(-1);
      
      if (cmd.toLowerCase() === 'clear') {
          setHistory([]);
          setInput('');
          return;
      }

      executeMutation.mutate(cmd);
      setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
              const nextIndex = historyIndex + 1;
              setHistoryIndex(nextIndex);
              setInput(commandHistory[nextIndex]);
          }
      } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex > 0) {
              const nextIndex = historyIndex - 1;
              setHistoryIndex(nextIndex);
              setInput(commandHistory[nextIndex]);
          } else if (historyIndex === 0) {
              setHistoryIndex(-1);
              setInput('');
          }
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
  };

  const commandPresets = [
    { label: "Loan distribution by LGA", icon: TrendingUp },
    { label: "Recent critical fraud alerts", icon: ShieldAlert },
    { label: "Chart of Accounts trial balance", icon: Database },
    { label: "Active agent nodes in Lagos", icon: Globe }
  ];

  const renderContent = (item: any) => {
      if (item.type === 'command') return <div className="flex gap-4 text-indigo-400 font-mono text-[16px] italic"><span className="opacity-40 font-black">root@weezy:~$</span> {item.content}</div>;
      if (item.type === 'error') return <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-rose-500 font-mono text-[16px] flex gap-4 bg-rose-500/5 p-6 rounded-2xl border border-rose-500/20 shadow-2xl"><AlertCircle className="h-6 w-6 shrink-0" /> [FATAL_NODE_ERROR] {item.content}</motion.div>;
      if (item.type === 'text') return <div className="text-slate-400 font-mono text-[15px] whitespace-pre-wrap leading-relaxed border-l-2 border-indigo-500/20 pl-8 my-8">{item.content}</div>;
      
      if (item.type === 'data') {
          return (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-8">
                  <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[32px] relative group/sql shadow-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                            <Cpu className="h-4 w-4" /> Cognitive SQL Synthesis
                        </p>
                        <button onClick={() => copyToClipboard(item.sql)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 transition-all opacity-0 group-hover/sql:opacity-100"><Copy className="h-4 w-4" /></button>
                      </div>
                      <code className="text-[13px] text-indigo-200/60 block break-all font-mono leading-relaxed relative z-10">{item.sql}</code>
                  </div>
                  
                  {item.data?.length > 0 ? (
                      <div className="overflow-x-auto rounded-[40px] border border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        <table className="w-full text-[14px] font-mono text-slate-300">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    {Object.keys(item.data[0]).map(key => <th key={key} className="p-6 text-left font-black uppercase text-indigo-400 tracking-[0.2em]">{key}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {item.data.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                                        {Object.values(row).map((val: any, j: number) => <td key={j} className="p-6 group-hover:text-white transition-colors">{String(val)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  ) : (
                      <div className="text-slate-600 italic text-sm py-6 px-10 border-2 border-dashed border-white/5 rounded-[32px]">[SYSTEM_NULL: No records found in current lattice cycle]</div>
                  )}
                  <div className="flex items-center gap-4 px-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Query success. {item.count} ledger nodes identified.</p>
                  </div>
              </motion.div>
          );
      }
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
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Data_Tunnel_Operational</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-white/40 animate-gradient-x">Terminal</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] pl-1">
                Cognitive Command Entry // Layer 7 Forensic Link v4.8
            </p>
          </div>
          
          <div className="flex gap-8 mr-2 items-center">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Integrity_State</span>
                <div className="flex items-center gap-3 mt-1">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" />
                    <span className="text-2xl font-black text-white italic uppercase tracking-tight">ENFORCED</span>
                </div>
              </div>
          </div>
        </section>

        <HolographicCard className="flex-1 p-0 overflow-hidden min-h-0 flex flex-col border-white/5 bg-[#010102]/80 group/terminal">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white/[0.03] px-12 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl">
                    <div className="flex gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 border border-rose-500/30" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.5em] font-black flex items-center gap-4">
                        <Lock className="w-3 h-3" /> root@weezy_prime: ~ssh/2035/secure_lattice
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-[#010102]/40">
                    <div className="space-y-12 max-w-5xl mx-auto">
                        {history.map((item, i) => (
                            <div key={i}>{renderContent(item)}</div>
                        ))}
                        {executeMutation.isPending && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-6 text-indigo-400 font-mono text-[16px] italic border-l-2 border-indigo-500/40 pl-8">
                                <RefreshCw className="h-6 w-6 animate-spin" />
                                <span className="animate-pulse">Core is synthesizing neural data models and permission lattices...</span>
                            </motion.div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                <div className="px-12 py-8 bg-black/40 border-t border-white/5 flex flex-wrap gap-5 shrink-0">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] self-center mr-6 italic">Neural_Shortcuts:</span>
                    {commandPresets.map((preset, i) => (
                        <button 
                            key={i} 
                            onClick={() => setInput(preset.label)}
                            className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 text-[11px] font-black text-slate-500 hover:text-white transition-all group uppercase tracking-widest shadow-2xl active:scale-95"
                        >
                            <preset.icon className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="p-10 bg-black/60 border-t border-white/10 backdrop-blur-3xl shrink-0">
                    <form onSubmit={handleCommand} className="flex gap-8 items-center max-w-6xl mx-auto">
                        <span className="text-indigo-500 font-mono font-black text-4xl animate-pulse italic drop-shadow-[0_0_10px_rgba(99,102,241,1)]">❯</span>
                        <input 
                            autoFocus
                            className="flex-1 bg-transparent border-none outline-none text-indigo-400 font-mono text-3xl placeholder:text-slate-900 font-bold tracking-tight italic"
                            placeholder="Cognitive_Command_Entry..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={executeMutation.isPending}
                        />
                        <div className="flex gap-10 opacity-20 group-focus-within/terminal:opacity-100 transition-all duration-700">
                            <Database className="h-8 w-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            <ShieldCheck className="h-8 w-8 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </form>
                </div>
            </div>
        </HolographicCard>

        {/* Floating Command HUD */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <div className="bg-black/60 backdrop-blur-3xl px-12 py-6 rounded-full border border-white/10 flex items-center gap-16 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-5">
                    <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Consensus_Flow</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Tunnel Link</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Synthesis_Velocity</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sub-ms DB Latency</span>
                    </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-5">
                    <Cpu className="w-5 h-5 text-slate-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Node_Ver</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sentient_Shell_v4.8</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </motion.div>
  );
};

export default IntelligenceTerminal;
