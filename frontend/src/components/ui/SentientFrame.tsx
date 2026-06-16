import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrainCircuit, ShieldCheck, Zap, Activity, Target, Cpu } from 'lucide-react';

interface SentientFrameProps {
  children: React.ReactNode;
  className?: string;
  intent?: 'compliance' | 'growth' | 'risk' | 'neutral';
  title?: string;
  subtitle?: string;
}

const intentColors = {
  compliance: 'from-emerald-500/20 to-cyan-500/5 border-emerald-500/20 shadow-emerald-500/10',
  growth: 'from-indigo-500/20 to-purple-500/5 border-indigo-500/20 shadow-indigo-500/10',
  risk: 'from-rose-500/20 to-orange-500/5 border-rose-500/20 shadow-rose-500/10',
  neutral: 'from-slate-500/10 to-slate-900/5 border-white/5 shadow-black/40',
};

const SentientFrame: React.FC<SentientFrameProps> = ({ 
  children, 
  className, 
  intent = 'neutral',
  title,
  subtitle
}) => {
  const icon = useMemo(() => {
    switch (intent) {
      case 'compliance': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'growth': return <Target className="w-4 h-4 text-indigo-400" />;
      case 'risk': return <Activity className="w-4 h-4 text-rose-400" />;
      default: return <BrainCircuit className="w-4 h-4 text-slate-400" />;
    }
  }, [intent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[48px] border-2 bg-gradient-to-br backdrop-blur-3xl shadow-2xl p-8 transition-all duration-700",
        intentColors[intent],
        className
      )}
    >
      {/* Dynamic Ambient Background Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header HUD */}
      {(title || subtitle) && (
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                {icon}
              </div>
              <h3 className="text-sm font-black italic uppercase tracking-[0.3em] text-white/90">{title}</h3>
            </div>
            {subtitle && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-11">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sentient_Sync</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom Forensic Badge */}
      <div className="absolute bottom-6 right-8 flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
        <Cpu className="w-3 h-3 text-slate-500" />
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Neural_OS_v4.0</span>
      </div>
    </motion.div>
  );
};

export default SentientFrame;
