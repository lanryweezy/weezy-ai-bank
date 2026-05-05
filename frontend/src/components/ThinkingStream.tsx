import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, ShieldAlert, Zap, Search } from 'lucide-react';

interface LogEntry {
  id: string;
  agent: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
}

const ThinkingStream: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const mockEvents = [
      { agent: 'CYBER SENTINEL', message: 'Honeypot query blocked from IP 192.168.1.104', type: 'critical' },
      { agent: 'NIP NEGOTIATOR', message: 'Handshake timeout for TXN #4492. Autonomous reversal executed.', type: 'warning' },
      { agent: 'CREDIT ANALYST', message: 'Loan APP-8820 autonomously approved. DTI: 22%. Score: 88.', type: 'success' },
      { agent: 'TREASURY CFO', message: 'Liquidity rebalanced. Swept ₦50M to NIBSS Settlement.', type: 'info' },
      { agent: 'WEALTH OPTIMIZER', message: 'Idle funds detected for User #102. Swept ₦12,500 to Vault.', type: 'success' },
      { agent: 'ETHICS ENGINE', message: 'Loan Vetoed: Predatory DTI detected (52%) for User #99.', type: 'critical' },
    ];

    const interval = setInterval(() => {
      const event = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        ...event,
        timestamp: new Date().toLocaleTimeString(),
        type: event.type as any
      };
      setLogs(prev => [newLog, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cognitive Thinking Stream</span>
      </div>
      
      <div className="space-y-2 overflow-hidden h-[180px] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
        
        {logs.map((log) => (
          <div 
            key={log.id} 
            className="flex items-start gap-3 p-3 rounded-xl glass-dark border border-white/5 animate-in slide-in-from-left-4 duration-500"
          >
            <div className={`mt-1 p-1.5 rounded-lg ${
              log.type === 'critical' ? 'bg-red-500/20 text-red-500' :
              log.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
              log.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
              'bg-blue-500/20 text-blue-500'
            }`}>
              {log.type === 'critical' ? <ShieldAlert className="h-3 w-3" /> : 
               log.type === 'info' ? <Terminal className="h-3 w-3" /> : 
               <Cpu className="h-3 w-3" /> }
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-300">{log.agent}</span>
                <span className="text-[8px] font-bold text-slate-500">{log.timestamp}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400 font-medium tracking-tight">
                {log.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThinkingStream;
