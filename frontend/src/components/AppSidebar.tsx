import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Users,
  Brain,
  Database,
  Mail,
  Activity,
  Settings,
  Building2,
  Zap,
  BarChart3,
  CheckSquare,
  Bell,
  GitBranch,
  Shield,
  Plug,
  CreditCard,
  ArrowRightLeft,
  UserCheck,
  Cpu,
  SlidersHorizontal,
  ActivitySquare,
  Landmark,
  ShieldAlert,
  Wallet,
  Lock,
  History,
  FileText,
  Store,
  ShoppingBag,
  PiggyBank,
  ShieldCheck,
  QrCode,
  Code2,
  Hash,
  MessageSquare,
  LogOut,
  ChevronRight,
  Plane,
  ArrowUpRight,
  TrendingUp,
  CreditCard as CardIcon,
  User,
  BookOpen,
  Briefcase,
  Gavel,
  Award,
  Terminal,
  ChevronUp,
  ChevronDown,
  Scissors,
  Undo
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Activity },
  { name: 'Cognitive Core', href: '/cognitive-core', icon: Brain, highlight: true },
  { name: 'Task Manager', href: '/tasks', icon: CheckSquare },
  { name: 'Auto-Schedule', href: '/standing-instructions', icon: GitBranch },
  { name: 'AI Templates', href: '/ai-templates', icon: Cpu },
];

const retailBanking = [
  { name: 'My Wallet', href: '/portal', icon: Wallet },
  { name: 'Document Vault', href: '/portal/vault', icon: FileText },
  { name: 'Alerts Hub', href: '/comms-hub', icon: MessageSquare },
  { name: 'Branch & Teller', href: '/teller-ops', icon: Store },
  { name: 'Send Money', href: '/qr-payments', icon: QrCode },
  { name: 'Naira Cards', href: '/card-center', icon: CardIcon },
  { name: 'Loan Portal', href: '/loan-origination', icon: Briefcase },
  { name: 'Collateral Vault', href: '/loan-collateral', icon: Gavel },
  { name: 'Cheque Vault', href: '/cheque-vault', icon: BookOpen },
  { name: 'Fixed Vault', href: '/fixed-deposits', icon: PiggyBank },
  { name: 'Bills & Airtime', href: '/bills', icon: Zap },
  { name: 'International', href: '/fx-global', icon: Plane },
];

const businessBanking = [
  { name: 'Merchant Ops', href: '/merchant-console', icon: ShoppingBag },
  { name: 'Virtual Accounts', href: '/virtual-accounts', icon: Hash },
  { name: 'Corporate Payroll', href: '/payroll', icon: Building2 },
  { name: 'Agent Network', href: '/agent-banking', icon: Store },
  { name: 'Revenue Hub', href: '/agent-earnings', icon: TrendingUp },
];

const riskAndCompliance = [
  { name: 'Fraud Shield', href: '/fraud-shield', icon: ShieldCheck },
  { name: 'Compliance & AML', href: '/compliance', icon: ShieldAlert },
  { name: 'Regulatory Exports', href: '/regulatory-reporting', icon: FileText },
  { name: 'Treasury Core', href: '/treasury', icon: Landmark },
  { name: 'Loan Recovery', href: '/loan-recovery', icon: MessageSquare },
  { name: 'Onboarding (T3)', href: '/onboarding', icon: UserCheck },
];

const developerTools = [
  { name: 'Intelligence Terminal', href: '/terminal', icon: Terminal },
  { name: 'Bank Assets', href: '/assets', icon: Building2 },
  { name: 'Developer Hub', href: '/developer', icon: Code2 },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Knowledge Base', href: '/knowledge', icon: Database },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const getUserRole = () => localStorage.getItem('userRole');

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = getUserRole();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const adminNavigation = [
    { name: 'Chart of Accounts', href: '/chart-of-accounts', icon: BookOpen },
    { name: 'EOD Heartbeat', href: '/eod-center', icon: Activity },
    { name: 'Staff Management', href: '/admin/agent-templates', icon: SlidersHorizontal },
    { name: 'System Logs', href: '/admin/audit-trail', icon: History },
    { name: 'Workflow Intelligence', href: '/admin/workflow-audit', icon: Brain },
    { name: 'System Pulse', href: '/admin/health', icon: Activity },
  ];

  return (
    <Sidebar className="w-72 border-r border-slate-200 bg-white select-none">
      <SidebarHeader className="p-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-[18px] shadow-2xl shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter italic">WEEZY</span>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] leading-none mt-1">Cognitive Bank</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 mt-2">Core Cockpit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} className={`rounded-2xl transition-all duration-300 h-12 ${item.highlight ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 relative overflow-hidden group' : 'hover:bg-slate-50'}`}>
                      <Link to={item.href} className="flex items-center py-2 px-4">
                        {item.highlight && <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />}
                        <item.icon className={`mr-4 h-5 w-5 ${isActive || item.highlight ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                        <span className={`text-sm font-black uppercase tracking-widest ${item.highlight ? 'text-white' : 'text-slate-600'}`}>{item.name}</span>
                        {item.highlight && <Sparkles className="ml-auto h-3.5 w-3.5 text-indigo-200 animate-pulse" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-8 mb-4">Retail Corridor</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {retailBanking.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-2xl h-11 hover:bg-slate-50 transition-all group">
                    <Link to={item.href} className="flex items-center py-2 px-4">
                      <item.icon className={`mr-4 h-4.5 w-4.5 transition-colors ${location.pathname === item.href ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${location.pathname === item.href ? 'text-slate-900' : 'text-slate-500'}`}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-8 mb-4">Business Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {businessBanking.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-2xl h-11 hover:bg-slate-50 transition-all group">
                    <Link to={item.href} className="flex items-center py-2 px-4">
                      <item.icon className={`mr-4 h-4.5 w-4.5 transition-colors ${location.pathname === item.href ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${location.pathname === item.href ? 'text-slate-900' : 'text-slate-500'}`}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-8 mb-4">Trust & Safety</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {riskAndCompliance.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-2xl h-11 hover:bg-slate-50 transition-all group">
                    <Link to={item.href} className="flex items-center py-2 px-4">
                      <item.icon className={`mr-4 h-4.5 w-4.5 transition-colors ${location.pathname === item.href ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${location.pathname === item.href ? 'text-slate-900' : 'text-slate-500'}`}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-8 mb-4">Engineering</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {developerTools.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-2xl h-11 hover:bg-slate-50 transition-all group">
                    <Link to={item.href} className="flex items-center py-2 px-4">
                      <item.icon className={`mr-4 h-4.5 w-4.5 transition-colors ${location.pathname === item.href ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${location.pathname === item.href ? 'text-slate-900' : 'text-slate-500'}`}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'platform_admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 mt-8 mb-4">Master Governance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminNavigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-2xl h-11 hover:bg-indigo-50/50 transition-all group">
                      <Link to={item.href} className="flex items-center py-2 px-4">
                        <item.icon className={`mr-4 h-4.5 w-4.5 transition-colors ${location.pathname === item.href ? 'text-indigo-600' : 'text-indigo-400/60 group-hover:text-indigo-600'}`} />
                        <span className={`text-xs font-black uppercase tracking-widest ${location.pathname === item.href ? 'text-indigo-950' : 'text-indigo-400'}`}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-slate-50 bg-slate-50/30">
        {user && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Synchronized</span>
                </div>
                <Badge variant="outline" className="text-[8px] h-4 border-slate-200 text-slate-400 font-black">v1.0.4</Badge>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-[24px] bg-white ring-1 ring-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer">
                <Avatar className="h-10 w-10 border-2 border-indigo-50 shadow-inner">
                <AvatarFallback className="bg-indigo-600 text-white font-black text-xs">
                    {user.username?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate tracking-tight">{user.full_name || user.username}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-tighter font-black mt-0.5">{userRole?.replace('_', ' ') || 'User'}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" onClick={handleLogout}>
                <LogOut className="h-4.5 w-4.5" />
                </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
