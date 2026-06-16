import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint, Lock, ShieldAlert, Cpu } from 'lucide-react';

interface NeuralHandshakeProps {
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
}

const NeuralHandshake: React.FC<NeuralHandshakeProps> = ({ onSuccess, onCancel, amount }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle');

  const startScan = () => {
    setStatus('scanning');
    setTimeout(() => setStatus('verifying'), 2000);
    setTimeout(() => {
      setStatus('success');
      setTimeout(onSuccess, 1000);
    }, 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl"
    >
      <div className="relative w-[450px] h-[600px] bg-[#050508] rounded-[64px] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden p-12 flex flex-col items-center">
        
        {/* Background Depth */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center space-y-2 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Security_Lattice</span>
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Neural Handshake</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorize Transaction of ₦{amount.toLocaleString()}</p>
        </div>

        {/* Biometric Visual */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.button
                        key="idle"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startScan}
                        className="w-32 h-32 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center group cursor-pointer"
                    >
                        <Fingerprint className="w-12 h-12 text-indigo-400 group-hover:text-white transition-colors" />
                    </motion.button>
                )}
                {status === 'scanning' && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-40 h-40"
                    >
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-ping opacity-20" />
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-pulse" />
                        <div className="flex items-center justify-center h-full">
                            <Fingerprint className="w-16 h-16 text-indigo-400 animate-pulse" />
                        </div>
                        {/* Scanning Line */}
                        <motion.div 
                            animate={{ y: [0, 160, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)] z-20"
                        />
                    </motion.div>
                )}
                {status === 'verifying' && (
                    <motion.div key="verifying" className="flex flex-col items-center gap-4">
                        <Cpu className="w-16 h-16 text-amber-400 animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Verifying_Neural_Proof...</span>
                    </motion.div>
                )}
                {status === 'success' && (
                    <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4">
                        <ShieldCheck className="w-20 h-20 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Identity_Confirmed</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto w-full space-y-4">
            {status === 'idle' && (
                <button 
                    onClick={onCancel}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
                >
                    Cancel Handshake
                </button>
            )}
            <div className="flex items-center justify-center gap-4 opacity-30">
                <Lock className="w-3 h-3 text-slate-500" />
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Quantum_Encrypted</span>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NeuralHandshake;
