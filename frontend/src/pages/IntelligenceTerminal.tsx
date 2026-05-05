import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Terminal, ShieldCheck, Cpu, Database, Activity, Clock, Zap, AlertCircle, TrendingUp, ShieldAlert, Globe, RefreshCw } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const IntelligenceTerminal = () => {
  const [history, setHistory] = useState<any[]>([
    { type: 'text', content: "WEEZY COGNITIVE TERMINAL [Version 1.0.4]\n(c) 2026 Weezy AI Banking Group. All rights reserved.\n\nType 'help' for available commands or ask a data question directly." }
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
      if (item.type === 'command') return <div className="flex gap-4 text-indigo-400 font-mono text-[15px] italic"><span className="opacity-40 font-black">root@weezy:~$</span> {item.content}</div>;
      if (item.type === 'error') return <div className="text-red-500 font-mono text-[15px] flex gap-3"><AlertCircle className="h-5 w-5" /> [FATAL_NODE_ERROR] {item.content}</div>;
      if (item.type === 'text') return <div className="text-slate-400 font-mono text-[14px] whitespace-pre-wrap leading-relaxed border-l-2 border-indigo-500/20 pl-6 my-6">{item.content}</div>;
      
      if (item.type === 'data') {
          return (
              <div className="space-y-6 py-6 animate-in fade-in zoom-in-95 duration-700">
                  <div className="glass-dark border border-indigo-500/20 p-6 rounded-[24px] relative group/sql">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                          <Cpu className="h-4 w-4" /> Cognitive SQL Synthesis
                      </p>
                      <code className="text-xs text-indigo-200/60 block break-all font-mono leading-relaxed">{item.sql}</code>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-4 right-4 h-10 w-10 opacity-0 group-hover/sql:opacity-100 transition-opacity text-indigo-400 hover:bg-white/5"
                        onClick={() => copyToClipboard(item.sql)}
                      >
                        <Zap className="h-5 w-5" />
                      </Button>
                  </div>
                  
                  {item.data?.length > 0 ? (
                      <div className="overflow-x-auto rounded-[32px] border border-white/5 glass-dark shadow-2xl">
                        <table className="w-full text-[13px] font-mono text-slate-300">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    {Object.keys(item.data[0]).map(key => <th key={key} className="p-5 text-left font-black uppercase text-indigo-400 tracking-widest">{key}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {item.data.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/[0.03] transition-all group">
                                        {Object.values(row).map((val: any, j: number) => <td key={j} className="p-5 group-hover:text-white transition-colors">{String(val)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  ) : (
                      <div className="text-slate-600 italic text-sm py-4 px-6 border border-dashed border-white/5 rounded-2xl">[SYSTEM_NULL: No records found]</div>
                  )}
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Query success. {item.count} ledger nodes affected.</p>
                  </div>
              </div>
          );
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-14rem)] flex flex-col max-w-7xl mx-auto">
        <div className="flex justify-between items-end shrink-0">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
                Intelligence Terminal <div className="bg-indigo-600 p-2 rounded-2xl shadow-2xl shadow-indigo-500/20"><Terminal className="h-8 w-8 text-white" /></div>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest italic flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Layer 7 Data Tunnel Active
            </p>
          </div>
          <div className="flex gap-8 mr-2">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Integrity Status</span>
                <div className="flex items-center gap-3 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-xl font-black text-white italic uppercase tracking-tight">STABLE</span>
                </div>
              </div>
          </div>
        </div>

        <Card className="flex-1 border-none flex flex-col overflow-hidden obsidian-card ring-1 ring-white/5">
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <div className="bg-white/[0.02] px-10 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl">
                    <div className="flex gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] font-black">root@weezy: ~ssh/v1.0.4/secure</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-12 custom-terminal-scroll bg-[#010309]">
                    <div className="space-y-10">
                        {history.map((item, i) => (
                            <div key={i}>{renderContent(item)}</div>
                        ))}
                        {executeMutation.isPending && (
                            <div className="flex items-center gap-4 text-indigo-400 animate-pulse font-mono text-[15px] italic border-l-2 border-indigo-500/40 pl-6">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Core is synthesizing data models and permission sets...</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                <div className="px-10 py-6 bg-white/[0.01] border-t border-white/5 flex flex-wrap gap-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest self-center mr-4 italic">Neural Shortcuts:</span>
                    {commandPresets.map((preset, i) => (
                        <button 
                            key={i} 
                            onClick={() => setInput(preset.label)}
                            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 text-[11px] font-black text-slate-500 hover:text-indigo-400 transition-all group uppercase tracking-tighter"
                        >
                            <preset.icon className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="p-8 bg-white/[0.02] border-t border-white/5 backdrop-blur-3xl">
                    <form onSubmit={handleCommand} className="flex gap-6 items-center">
                        <span className="text-indigo-500 font-mono font-black text-3xl animate-pulse italic">❯</span>
                        <input 
                            autoFocus
                            className="flex-1 bg-transparent border-none outline-none text-indigo-400 font-mono text-2xl placeholder:text-slate-800 font-bold tracking-tight italic"
                            placeholder="Cognitive Command Entry..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={executeMutation.isPending}
                        />
                        <div className="flex gap-8 opacity-20 group-focus-within:opacity-100 transition-opacity">
                            <Database className="h-6 w-6 text-slate-400" />
                            <ShieldCheck className="h-6 w-6 text-slate-400" />
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default IntelligenceTerminal;
