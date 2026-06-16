import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ExternalLink, 
  Search,
  Filter,
  BrainCircuit
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  narration: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: string;
}

const transactions: Transaction[] = [
  { id: '1', type: 'DEBIT', amount: 50000, narration: 'NIP Transfer to Zenith Bank', status: 'SUCCESS', timestamp: '10:45 AM' },
  { id: '2', type: 'CREDIT', amount: 1200000, narration: 'Inward NIP from CBN', status: 'SUCCESS', timestamp: '09:30 AM' },
  { id: '3', type: 'DEBIT', amount: 2500, narration: 'Stamp Duty Charge', status: 'SUCCESS', timestamp: '09:28 AM' },
  { id: '4', type: 'PENDING', amount: 450000, narration: 'Loan Disbursement - Tier 3', status: 'PENDING', timestamp: '08:15 AM' } as any,
];

const ForensicLedger: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Live_Ledger_Feed</h4>
        <div className="flex gap-2">
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((txn, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            key={txn.id}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-transparent group-hover:from-indigo-500/5 transition-all duration-500 rounded-[24px]" />
            <div className="relative flex items-center justify-between p-4 rounded-[24px] bg-white/[0.02] border border-white/5 transition-all duration-500 group-hover:border-white/10 group-hover:translate-x-1">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                  txn.type === 'CREDIT' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {txn.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black italic uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    {txn.narration}
                  </h5>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-500">{txn.timestamp}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black tracking-widest text-slate-600 uppercase">TXN_{txn.id}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className={cn(
                  "text-sm font-black italic tracking-tighter",
                  txn.type === 'CREDIT' ? "text-emerald-400" : "text-white"
                )}>
                  {txn.type === 'CREDIT' ? '+' : '-'} ₦{txn.amount.toLocaleString()}
                </span>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  txn.status === 'SUCCESS' ? "border-emerald-500/20 text-emerald-500/60 bg-emerald-500/5" : "border-amber-500/20 text-amber-500/60 bg-amber-500/5"
                )}>
                  {txn.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 rounded-[24px] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-500 shadow-xl group/more flex items-center justify-center gap-2">
         Trace Full Lattice <ExternalLink className="w-3 h-3 group-hover/more:translate-x-0.5 group-hover/more:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default ForensicLedger;
