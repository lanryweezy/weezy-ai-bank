import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Command, 
  ArrowRight, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ArrowRightLeft, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Database, 
  History,
  Activity,
  PlusCircle,
  FileText,
  Smartphone,
  Globe,
  Store,
  QrCode as QrIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
    { name: 'Send Money', icon: ArrowRightLeft, path: '/transactions', category: 'Operations' },
    { name: 'Card Vault', icon: CreditCard, path: '/card-center', category: 'Operations' },
    { name: 'Merchant Console', icon: Store, path: '/merchant-console', category: 'Operations' },
    { name: 'Receive Payment', icon: QrIcon, path: '/merchant-console', category: 'Operations' },
    { name: 'Fixed Vault', icon: Database, path: '/fixed-deposits', category: 'Wealth' },
    { name: 'Document Vault', icon: FileText, path: '/portal/vault', category: 'Wealth' },
    { name: 'Cognitive Core', icon: Cpu, path: '/cognitive-core', category: 'AI' },
    { name: 'Fraud Shield', icon: ShieldCheck, path: '/fraud-shield', category: 'Security' },
    { name: 'Onboarding (T3)', icon: Users, path: '/onboarding', category: 'Operations' },
    { name: 'System Logs', icon: History, path: '/admin/audit-trail', category: 'Admin' },
    { name: 'System Pulse', icon: Activity, path: '/admin/health', category: 'Admin' }
  ];

  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[32px] overflow-hidden animate-in slide-in-from-top-4 duration-500">
            <div className="relative border-b border-slate-100">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <input 
                    autoFocus
                    placeholder="Search accounts, transactions, or commands..." 
                    className="w-full h-20 pl-20 pr-8 bg-transparent border-none outline-none text-xl font-black text-slate-900 placeholder:text-slate-300 italic tracking-tighter"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-[10px] font-black text-slate-400 h-7 px-3 rounded-lg uppercase tracking-widest">ESC to close</Badge>
                </div>
            </div>

            <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-10 p-4 pt-6">
                    {filteredActions.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Quick Navigation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredActions.map((action, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { navigate(action.path); onClose(); }}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group"
                                    >
                                        <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                            <action.icon className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{action.name}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{action.category}</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="bg-slate-50 p-6 rounded-full mb-6 ring-1 ring-slate-100">
                                <Zap className="h-10 w-10 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">Query Neutral</h4>
                            <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">No local nodes matched your search. Try asking <span className="text-indigo-600 font-bold italic">Weezy Prime</span> directly.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Command className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 rotate-90" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigate</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Core Index v1.0.4</span>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default CommandPalette;
