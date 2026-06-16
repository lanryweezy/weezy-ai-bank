import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, BrainCircuit, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const WealthAgentOrb: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const toggleAgent = () => {
    setIsActive(!isActive);
    if (!isActive) {
        setTimeout(() => setIsListening(true), 1000);
    } else {
        setIsListening(false);
    }
  };

  return (
    <div className="fixed bottom-12 left-12 z-[60]">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            className="absolute bottom-20 left-0 w-80 bg-black/60 backdrop-blur-3xl rounded-[40px] border border-white/10 p-8 shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Wealth_Agent</span>
                    </div>
                    <button onClick={toggleAgent} className="text-slate-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="h-24 flex items-center justify-center">
                    <div className="flex gap-1.5 items-center h-8">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={isListening ? {
                                    height: [8, Math.random() * 32 + 8, 8],
                                } : { height: 8 }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    delay: i * 0.1
                                }}
                                className="w-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-white leading-relaxed italic">
                        {isListening ? "I'm listening to your financial directive..." : "Initializing Neural Link..."}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                        "Ask me to analyze your NIP history or simulate a Tier 3 upgrade path."
                    </p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleAgent}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
          isActive 
            ? "bg-indigo-600 shadow-indigo-500/40" 
            : "bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10"
        )}
      >
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
        {isActive ? <Mic className="w-6 h-6 text-white" /> : <BrainCircuit className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />}
      </motion.button>
    </div>
  );
};

export default WealthAgentOrb;
