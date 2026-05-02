import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Terminal, ShieldCheck, Cpu, Database, Activity, Clock, Zap, AlertCircle } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { useMutation } from '@tanstack/react-query';

const IntelligenceTerminal = () => {
  const [history, setHistory] = useState<any[]>([
    { type: 'text', content: "WEEZY COGNITIVE TERMINAL [Version 1.0.4]\n(c) 2026 Weezy AI Banking Group. All rights reserved.\n\nType 'help' for available commands or ask a data question directly." }
  ]);
  const [input, setInput] = useState('');
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
      
      if (cmd.toLowerCase() === 'clear') {
          setHistory([]);
          setInput('');
          return;
      }

      executeMutation.mutate(cmd);
      setInput('');
  };

  const renderContent = (item: any) => {
      if (item.type === 'command') return <div className="flex gap-2 text-indigo-400 font-mono text-sm"><span className="opacity-50">root@weezy:~$</span> {item.content}</div>;
      if (item.type === 'error') return <div className="text-rose-500 font-mono text-sm flex gap-2"><AlertCircle className="h-4 w-4" /> [FATAL] {item.content}</div>;
      if (item.type === 'text') return <div className="text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">{item.content}</div>;
      
      if (item.type === 'data') {
          return (
              <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-slate-900 border border-indigo-500/30 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Cpu className="h-3 w-3" /> AI Generated SQL
                      </p>
                      <code className="text-xs text-slate-400 block break-all">{item.sql}</code>
                  </div>
                  
                  {item.data?.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
                        <table className="w-full text-xs font-mono text-slate-300">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/50">
                                    {Object.keys(item.data[0]).map(key => <th key={key} className="p-3 text-left font-black uppercase text-indigo-400 tracking-tighter">{key}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {item.data.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-900/50 hover:bg-white/5 transition-colors">
                                        {Object.values(row).map((val: any, j: number) => <td key={j} className="p-3">{String(val)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  ) : (
                      <div className="text-slate-500 italic text-sm py-2 px-2">[Query returned 0 records]</div>
                  )}
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Execution complete. {item.count} rows found.</p>
              </div>
          );
      }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="flex justify-between items-center shrink-0 px-1">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                <Terminal className="h-6 w-6 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic">INTELLIGENCE TERMINAL</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Data Access Layer</p>
            </div>
          </div>
          <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connection</span>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">ENCRYPTED SSH</Badge>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Status</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-700">STABLE</span>
                </div>
              </div>
          </div>
        </div>

        <Card className="flex-1 bg-slate-950 border-none shadow-2xl rounded-[32px] overflow-hidden flex flex-col relative ring-4 ring-slate-900/50">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <div className="bg-slate-900/80 px-8 py-3 flex items-center justify-between border-b border-slate-800 backdrop-blur-md">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">session: weezy-root-bi-01</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 custom-terminal-scroll">
                    <div className="space-y-6">
                        {history.map((item, i) => (
                            <div key={i}>{renderContent(item)}</div>
                        ))}
                        {executeMutation.isPending && (
                            <div className="flex items-center gap-3 text-indigo-400 animate-pulse font-mono text-sm">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>AI is synthesizing data models...</span>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                    <form onSubmit={handleCommand} className="flex gap-4 items-center">
                        <span className="text-indigo-500 font-mono font-black text-lg">❯</span>
                        <input 
                            autoFocus
                            className="flex-1 bg-transparent border-none outline-none text-indigo-400 font-mono text-lg placeholder:text-slate-800"
                            placeholder="Type command or question..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={executeMutation.isPending}
                        />
                        <div className="flex gap-6 opacity-30">
                            <Database className="h-5 w-5 text-slate-400" />
                            <ShieldCheck className="h-5 w-5 text-slate-400" />
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IntelligenceTerminal;
