import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

const data = [
  { year: '2024', balance: 5000000 },
  { year: '2025', balance: 7200000 },
  { year: '2026', balance: 12000000 },
  { year: '2027', balance: 18500000 },
  { year: '2028', balance: 32000000 },
  { year: '2029', balance: 55000000 },
];

const GenerativeLifePath: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Generative Life-Path
          </h3>
          <p className="text-sm font-black text-white italic tracking-tighter uppercase mt-1">Projected Net Worth v1.0</p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target 2030</p>
           <p className="text-xl font-black text-emerald-400 italic">₦100M+</p>
        </div>
      </div>

      <div className="h-[280px] w-full p-6 rounded-[32px] glass-dark border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPath" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 9, fill: '#64748b', fontWeight: '900'}} 
            />
            <YAxis 
              hide={true}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#020617', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' 
              }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorPath)" 
              strokeWidth={4}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="absolute top-8 left-8 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-2xl backdrop-blur-md border border-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Growth Velocity</p>
                <p className="text-sm font-black text-white">+24.2% PA</p>
            </div>
        </div>

        <div className="absolute bottom-8 right-8 text-right group-hover:scale-105 transition-transform duration-700">
            <div className="bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/10 flex items-center gap-4">
                <Target className="h-5 w-5 text-indigo-400" />
                <div className="text-left">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Next Milestone</p>
                    <p className="text-[11px] font-black text-white uppercase italic">Financial Freedom Node</p>
                </div>
            </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
            "Weezy AI analyzed your last 12 months of savings and projected a 15% increase in annual yields if you maintain your current Fixed Vault deposits. You are on track to hit ₦50M by Q4 2028."
        </p>
      </div>
    </div>
  );
};

export default GenerativeLifePath;
