import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NotificationPopover } from './NotificationPopover';
import Breadcrumbs from './Breadcrumbs';
import { Search, Command, Settings as SettingsIcon, ShieldCheck, Activity, Brain, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CommandPalette from './CommandPalette';
import ThinkingStream from './ThinkingStream';

const LuxuryLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [pnl, setPnl] = useState(12.42);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        setPnl(prev => parseFloat((prev + (Math.random() * 0.1 - 0.05)).toFixed(2)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const togglePalette = () => setIsPaletteOpen(!isPaletteOpen);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
        <AppSidebar />
        
        <SidebarInset className="flex-1 overflow-hidden bg-transparent">
          {/* Header */}
          <header className="flex h-24 items-center gap-8 px-12 border-b border-white/5 bg-slate-950/40 backdrop-blur-3xl sticky top-0 z-30 transition-all duration-500">
            <SidebarTrigger className="-ml-3 text-slate-500 hover:text-white hover:bg-white/5 transition-all rounded-2xl p-2.5 bg-transparent border-none" />
            
            <div 
              className="hidden md:flex items-center flex-1 max-w-lg relative group cursor-pointer"
              onClick={togglePalette}
            >
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <Input 
                readOnly
                placeholder="Intelligence Terminal (⌘K)" 
                className="w-full bg-white/5 border-white/5 pl-14 pr-16 rounded-[20px] h-14 cursor-pointer focus-visible:ring-1 focus-visible:ring-indigo-500/50 transition-all text-sm font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-slate-900/80 text-[10px] font-black text-slate-500">
                <Command className="h-3 w-3" /> K
              </div>
            </div>

            <div className="flex-1" />

            {/* Live Metrics */}
            <div className="hidden xl:flex items-center gap-8 mr-4">
               <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Activity className="h-2 w-2 text-emerald-500" /> SYSTEM PROFIT
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[13px] font-black uppercase tracking-tighter ${pnl > 12.42 ? 'text-emerald-400' : 'text-slate-200'} transition-colors`}>
                            +₦{pnl}M
                        </span>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
               </div>
               
               <div className="h-10 w-[1px] bg-white/5" />

               <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <Brain className="h-4 w-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Sentient Mode</span>
               </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationPopover />
              <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                <SettingsIcon className="h-6 w-6" />
              </Button>
            </div>
          </header>
          
          <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              <div className="max-w-[1400px] mx-auto space-y-12">
                <div className="px-2">
                  <Breadcrumbs />
                </div>
                
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {children}
                </div>
              </div>
            </main>

            {/* Right Sidebar: Cognitive Intelligence Panel */}
            <aside className="hidden 2xl:flex w-[400px] border-l border-white/5 bg-slate-950/20 backdrop-blur-3xl flex-col p-8 gap-10">
                <ThinkingStream />
                
                <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Guardians</span>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                            <ShieldCheck className="h-4 w-4 text-indigo-400" />
                            <span className="text-[11px] font-black text-slate-300 uppercase">Fraud Shield</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Active • 99.9%</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <span className="text-[11px] font-black text-slate-300 uppercase">Latency</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">0.42ms</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-6 rounded-[28px] bg-gradient-to-br from-indigo-600/20 to-blue-600/10 border border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                    <h4 className="text-sm font-black text-white italic tracking-tighter uppercase mb-2">Weezy Intelligence</h4>
                    <p className="text-[10px] text-indigo-200/60 font-medium leading-relaxed">
                        Currently processing 14,220 transactions/sec. Zero human intervention required.
                    </p>
                </div>
            </aside>
          </div>
        </SidebarInset>
      </div>

      <CommandPalette 
          isOpen={isPaletteOpen} 
          onClose={() => setIsPaletteOpen(false)} 
      />
    </SidebarProvider>
  );
};

export default LuxuryLayout;
