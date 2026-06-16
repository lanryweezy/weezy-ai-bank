import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';
import { Sparkles, TrendingUp, Target, Zap, Activity, BrainCircuit, FastForward, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const initialData = [
  { year: '2024', balance: 5000000, projected: 5000000 },
  { year: '2025', balance: 7200000, projected: 7200000 },
  { year: '2026', balance: 12000000, projected: 12000000 },
  { year: '2027', balance: null, projected: 18500000 },
  { year: '2028', balance: null, projected: 32000000 },
  { year: '2029', balance: null, projected: 55000000 },
  { year: '2030', balance: null, projected: 85000000 },
  { year: '2031', balance: null, projected: 120000000 },
  { year: '2032', balance: null, projected: 180000000 },
  { year: '2033', balance: null, projected: 280000000 },
];

interface GenerativeLifePathProps {
  previewAmount?: number;
}

const GenerativeLifePath: React.FC<GenerativeLifePathProps> = ({ previewAmount = 0 }) => {
  const [savingsRate, setSavingsRate] = useState([20]);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulatedData = useMemo(() => {
    const rate = savingsRate[0] / 100;
    return initialData.map((item, idx) => {
        if (item.balance !== null) return { ...item, impact: item.balance };
        
        const prev = initialData[idx - 1].projected;
        const growth = 1.15 + (rate * 0.5); 
        
        const projected = prev * growth;
        // Calculate impact path (compounded loss)
        const yearsRemaining = parseInt(item.year) - 2026;
        const compoundFactor = Math.pow(growth, yearsRemaining);
        const impact = projected - (previewAmount * compoundFactor);

        return {
            ...item,
            projected,
            impact: Math.max(0, impact)
        };
    });
  }, [savingsRate, previewAmount]);

  const opportunityCost = useMemo(() => {
    if (previewAmount <= 0) return 0;
    const finalProjected = simulatedData[simulatedData.length - 1].projected;
    const finalImpact = simulatedData[simulatedData.length - 1].impact;
    return finalProjected - finalImpact;
  }, [simulatedData, previewAmount]);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <div className="space-y-8 group">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                <BrainCircuit className="h-4 w-4 text-indigo-400" />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
              Neural Life-Path <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            </h3>
          </div>
          <p className="text-sm font-black text-slate-400 italic tracking-tighter uppercase pl-11">Predictive Wealth Model v4.0</p>
        </div>
        <div className="text-right space-y-1">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Net Worth 2033</p>
           <h2 className="text-4xl font-black text-white italic tracking-tighter transition-all duration-700">
             ₦{(simulatedData[simulatedData.length - 1].projected / 1000000).toFixed(1)}M
           </h2>
        </div>
      </div>

      <div className="relative h-[350px] w-full p-8 rounded-[48px] bg-white/[0.01] border border-white/5 shadow-2xl overflow-hidden group/chart">
        {/* Prismatic Light Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover/chart:opacity-100 transition-opacity duration-1000" />
        
        {/* Thinking Overlay during Simulation */}
        <AnimatePresence>
            {isSimulating && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 backdrop-blur-sm bg-black/20 flex items-center justify-center"
                >
                    <div className="flex flex-col items-center gap-4">
                        <Zap className="w-12 h-12 text-indigo-400 animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Re-Synthesizing_Future</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={simulatedData}>
            <defs>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 8, fill: '#475569', fontWeight: '900'}} 
              dy={10}
            />
            <YAxis hide={true} domain={[0, 'dataMax + 50000000']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#050508] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{payload[0].payload.year} LATTICE NODE</p>
                      <p className="text-lg font-black text-white italic">₦{(payload[0].value as number).toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="projected" 
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorProjected)" 
              strokeWidth={3}
              strokeDasharray="10 5"
              animationDuration={1500}
            />
            {previewAmount > 0 && (
                <Area 
                    type="monotone" 
                    dataKey="impact" 
                    stroke="#f43f5e" 
                    fillOpacity={0.1} 
                    fill="#f43f5e" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                />
            )}
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorActual)" 
              strokeWidth={4}
              animationDuration={2000}
            />
            <ReferenceLine x="2026" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" label={{ value: 'PRESENT', position: 'top', fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 flex items-center gap-3">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Confidence: <span className="text-white">92.4%</span></span>
            </div>
            {previewAmount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-3"
                >
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">Impact Detected</span>
                </motion.div>
            )}
        </div>
      </div>

      {/* Simulator & Opportunity Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FastForward className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Growth Simulator</span>
                </div>
                <span className="text-[10px] font-black text-indigo-400">{savingsRate}% Aggression</span>
            </div>
            
            <div className="flex items-center gap-8">
                <Slider 
                    value={savingsRate} 
                    onValueChange={(val) => { setSavingsRate(val); handleSimulate(); }}
                    max={100} 
                    step={5} 
                    className="flex-1"
                />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic border-l-2 border-indigo-500/30 pl-4">
                "Neural Engine: Higher aggression increases 2033 yield by ₦{(opportunityCost / 10).toLocaleString()} annually."
            </p>
        </div>

        <AnimatePresence>
            {previewAmount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="p-8 rounded-[32px] bg-rose-500/5 border border-rose-500/10 space-y-4 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-16 h-16 text-rose-500 rotate-180" />
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Opportunity Cost</span>
                    </div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">₦{(opportunityCost / 1000000).toFixed(1)}M Loss</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                        "Warning: This ₦{(previewAmount / 1000000).toFixed(1)}M settlement reduces your 2033 net worth by ₦{(opportunityCost / 1000000).toFixed(1)}M due to compound detachment."
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GenerativeLifePath;
