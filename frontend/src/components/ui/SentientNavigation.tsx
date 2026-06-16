import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Search, 
  Command, 
  Bell, 
  ChevronRight,
  LogOut,
  BrainCircuit,
  Target,
  Settings
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  intent: 'neutral' | 'growth' | 'compliance' | 'risk';
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Executive Nexus', icon: Home, intent: 'neutral' },
  { id: 'treasury', label: 'Liquidity Matrix', icon: Wallet, intent: 'growth' },
  { id: 'compliance', label: 'Regulatory Lattice', icon: ShieldCheck, intent: 'compliance' },
  { id: 'analytics', label: 'Forensic Intelligence', icon: BarChart3, intent: 'neutral' },
  { id: 'orchestrator', label: 'Automation Core', icon: Cpu, intent: 'growth' },
  { id: 'security', label: 'Neural Shield', icon: Zap, intent: 'risk' },
];

const SentientNavigation: React.FC = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 h-[80vh] flex items-center">
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col gap-4 p-4 rounded-[40px] bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] group"
      >
        {/* Dynamic Indicator Glow */}
        <div className="absolute inset-0 rounded-[40px] border border-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Profile / Intelligence Status */}
        <div className="mb-6 p-2 flex flex-col items-center gap-1">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
               <div className="w-full h-full rounded-2xl bg-[#050508] flex items-center justify-center overflow-hidden">
                  <BrainCircuit className="w-6 h-6 text-white/80" />
               </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#050508]" />
          </div>
        </div>

        {/* Command Search */}
        <button 
          onClick={() => setIsCommandOpen(true)}
          className="mb-4 h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group/btn relative"
        >
          <Search className="w-5 h-5 text-slate-400 group-hover/btn:text-white transition-colors" />
          <div className="absolute left-16 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all scale-95 group-hover/btn:scale-100 whitespace-nowrap shadow-2xl border border-white/5">
            Command Center <span className="text-slate-500 ml-2">⌘K</span>
          </div>
        </button>

        <div className="flex-1 flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative group/item",
                  isActive ? "bg-indigo-600 shadow-lg shadow-indigo-500/40" : "bg-white/5 hover:bg-white/10"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-500",
                  isActive ? "text-white scale-110" : "text-slate-400 group-hover/item:text-slate-200"
                )} />
                
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="nav-glow"
                    className="absolute -left-1 w-1 h-6 bg-indigo-400 rounded-full blur-[2px]"
                  />
                )}

                {/* Floating Tooltip */}
                <div className="absolute left-16 flex items-center gap-2 opacity-0 group-hover/item:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover/item:translate-x-0">
                  <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-2xl shadow-2xl border border-white/5 whitespace-nowrap">
                    {item.label}
                  </div>
                  {item.intent !== 'neutral' && (
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.intent === 'growth' && "bg-indigo-500",
                      item.intent === 'compliance' && "bg-emerald-500",
                      item.intent === 'risk' && "bg-rose-500"
                    )} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* System Settings & Logout */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
          <button className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-slate-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
          <button className="h-12 w-12 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center transition-all text-rose-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.nav>
    </div>
  );
};

export default SentientNavigation;
