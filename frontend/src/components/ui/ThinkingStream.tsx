import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';

const thoughts = [
    "Analyzing global NIP settlement liquidity...",
    "Neural governor scanning Tier 3 inflow patterns...",
    "Lattice integrity confirmed (99.999% consistency)",
    "PQC signature applied to ledger block #88241",
    "Sentient audit: NGN/USD hedge optimal at 15%",
    "AML threshold checkpoint nominal. No SARs generated.",
    "Thinking: Optimizing interbank placement recall...",
    "Handshake complete: Executive nexus synchronized."
];

const ThinkingStream: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % thoughts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-12 right-12 z-50 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-2xl rounded-[32px] border border-white/10 p-6 w-96 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
        
        <div className="relative z-10 flex items-center gap-4 mb-4 border-b border-white/5 pb-3">
            <div className="p-2 rounded-xl bg-indigo-500/20">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Cognitive_Stream</span>
            <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Thinking</span>
            </div>
        </div>

        <div className="relative z-10 h-12 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-3"
                >
                    <div className="mt-1 w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    <p className="text-[11px] font-bold italic tracking-wide text-slate-300 leading-relaxed font-mono">
                        {thoughts[index]}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Ambient Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
            <motion.div 
                key={index}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
        </div>
      </div>
    </div>
  );
};

export default ThinkingStream;
