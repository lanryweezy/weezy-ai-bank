import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import apiClient from '@/services/apiClient';
import { NotificationPopover } from './NotificationPopover';
import Breadcrumbs from './Breadcrumbs';
import { Search, Command, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Create a context for notifications
interface NotificationContextType {
  unreadCount: number;
  fetchUnreadCount: () => void;
  decrementUnreadCount: (amount?: number) => void;
  resetUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!localStorage.getItem('authToken')) {
        setUnreadCount(0);
        return;
      }
      const response = await apiClient<{ unread_count: number }>('/notifications/unread-count');
      setUnreadCount(response.unread_count);
    } catch (error) {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const decrementUnreadCount = (amount = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  const notificationContextValue: NotificationContextType = {
    unreadCount,
    fetchUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
  };

  return (
    <NotificationContext.Provider value={notificationContextValue}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50/50">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-hidden">
            <header className="flex h-24 items-center gap-8 px-10 border-b bg-white/60 backdrop-blur-2xl sticky top-0 z-30 transition-all duration-500">
              <SidebarTrigger className="-ml-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-2xl p-2.5 shadow-sm bg-white border border-slate-100" />
              
              <div className="hidden md:flex items-center flex-1 max-w-lg relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors duration-500">
                  <Search className="h-5 w-5" />
                </div>
                <Input 
                  placeholder="Execute command or search ledger..." 
                  className="w-full bg-slate-100/30 border-none pl-14 pr-16 rounded-[24px] h-14 focus-visible:ring-4 focus-visible:ring-indigo-500/10 transition-all text-sm font-medium shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm text-[10px] font-black text-slate-400 tracking-tighter">
                  <Command className="h-3 w-3" /> K
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-6">
                <div className="hidden xl:flex items-center gap-4 px-6 py-2 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Switch</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Sync Active</span>
                        </div>
                    </div>
                </div>
                <NotificationPopover />
                <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                  <SettingsIcon className="h-6 w-6" />
                </Button>
              </div>
            </header>
            
            <main className="flex-1 p-10 overflow-y-auto custom-scrollbar">
              <div className="max-w-[1600px] mx-auto space-y-10">
                <div className="px-2">
                  <Breadcrumbs />
                </div>
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NotificationContext.Provider>
  );
};

export default Layout;
