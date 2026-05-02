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
            <header className="flex h-20 items-center gap-6 px-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm shadow-slate-100">
              <SidebarTrigger className="-ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl p-2" />
              
              <div className="hidden md:flex items-center flex-1 max-w-md relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Search className="h-4 w-4" />
                </div>
                <Input 
                  placeholder="Search transactions, customers, or commands..." 
                  className="w-full bg-slate-100/50 border-none pl-11 pr-12 rounded-2xl h-11 focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-md border border-slate-200 bg-white shadow-sm text-[10px] font-black text-slate-400">
                  <Command className="h-3 w-3" /> K
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <NotificationPopover />
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
                  <SettingsIcon className="h-5 w-5" />
                </Button>
              </div>
            </header>
            
            <main className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="px-1">
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
