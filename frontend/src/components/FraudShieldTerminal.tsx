import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, Globe, Zap, Cpu, Lock } from 'lucide-react';

interface AuthMessage {
  id: string;
  pan: string;
  amount: string;
  merchant: string;
  mcc: string;
  result: 'APPROVED' | 'DECLINED';
  reason?: string;
  latency: string;
}

const FraudShieldTerminal: React.FC = () => {
  const [messages, setMessages] = useState<AuthMessage[]>([]);

  useEffect(() => {
    const merchants = ['AMAZON.COM', 'UBER NIGERIA', 'SHOPRITE IKEJA', 'NETFLIX', 'JUMIA NG', 'SPAR LAGOS'];
    
    const interval = setInterval(() => {
      const isFraud = Math.random() > 0.85;
      const newMessage: AuthMessage = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        pan: `5061********${Math.floor(1000 + Math.random() * 9000)}`,
        amount: `₦${(Math.random() * 50000).toFixed(2)}`,
        merchant: merchants[Math.floor(Math.random() * merchants.length)],
        mcc: ['5411', '4121', '5812', '4814'][Math.floor(Math.random() * 4)],
        result: isFraud ? 'DECLINED' : 'APPROVED',
        reason: isFraud ? 'AI_FRAUD_SHIELD: VELOCITY' : undefined,
        latency: `${(Math.random() * 8 + 2).toFixed(1)}ms`
      };
      setMessages(prev => [newMessage, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Fraud Shield Terminal</h2>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest italic flex items-center gap-2">
            <Lock className="h-3 w-3 text-indigo-500" /> ISO-8583 Real-Time Message Stream
          </p>
        </div>
        <div className="flex items-center gap-6 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Active Attacks Blocked</p>
                <p className="text-xl font-black text-white italic tracking-tighter uppercase">142 (Last Hour)</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="obsidian-card col-span-2 flex-1">
          <CardHeader className="border-b border-white/5 py-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex justify-between">
                <span>Transaction Stream</span>
                <span className="text-indigo-400">Gemini Flash Active</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left font-mono">
                <thead className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                    <tr className="text-[9px] font-black text-slate-600 uppercase border-b border-white/5">
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Card / PAN</th>
                        <th className="px-6 py-4">Merchant</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-right">Latency</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {messages.map((msg) => (
                        <tr key={msg.id} className="group hover:bg-white/5 transition-all animate-in fade-in duration-500">
                            <td className="px-6 py-4">
                                {msg.result === 'APPROVED' ? 
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> : 
                                    <ShieldAlert className="h-4 w-4 text-red-500" />
                                }
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-[11px] font-black text-slate-300">{msg.pan}</p>
                                <p className="text-[8px] text-slate-600 uppercase">ID: {msg.id}</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-[11px] font-black text-white tracking-tight">{msg.merchant}</p>
                                <p className="text-[8px] text-slate-600 uppercase">MCC: {msg.mcc}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <p className={`text-[11px] font-black ${msg.result === 'APPROVED' ? 'text-white' : 'text-red-400 line-through'}`}>{msg.amount}</p>
                                {msg.reason && <p className="text-[8px] text-red-500 font-bold uppercase">{msg.reason}</p>}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{msg.latency}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="obsidian-card bg-gradient-to-br from-red-600/10 to-transparent">
                <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                        <Globe className="h-3 w-3" /> Threat Map
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Highest Vector</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter uppercase">Lagos, NG</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="obsidian-card border-indigo-500/20">
                <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                        <Cpu className="h-3 w-3" /> Fraud AI Specs
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                            <span>Accuracy</span>
                            <span className="text-white">99.98%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[99%] bg-emerald-500" />
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] text-slate-400 leading-relaxed font-medium italic">
                            System is currently utilizing <span className="text-indigo-400 font-black">Gemini 1.5 Flash</span> for sub-10ms authorization windows. 
                            Active pattern: "High-Frequency Micros" from new IPs.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default FraudShieldTerminal;
