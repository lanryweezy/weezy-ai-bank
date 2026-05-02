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
  CreditCard as CardIcon
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

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Activity },
  { name: 'Cognitive Core', href: '/cognitive-core', icon: Brain, highlight: true },
  { name: 'Task Manager', href: '/tasks', icon: CheckSquare },
  { name: 'AI Templates', href: '/ai-templates', icon: Cpu },
  { name: 'Workflow Automator', href: '/workflows', icon: GitBranch },
];

const retailBanking = [
  { name: 'My Wallet', href: '/portal', icon: Wallet },
  { name: 'Send Money', href: '/qr-payments', icon: QrCode },
  { name: 'Naira Cards', href: '/card-center', icon: CardIcon },
  { name: 'Wealth & Savings', href: '/savings', icon: PiggyBank },
  { name: 'Bills & Airtime', href: '/bills', icon: Zap },
  { name: 'International', href: '/fx-global', icon: Plane },
];

const businessBanking = [
  { name: 'Merchant Ops', href: '/merchant-console', icon: ShoppingBag },
  { name: 'Virtual Accounts', href: '/virtual-accounts', icon: Hash },
  { name: 'Corporate Payroll', href: '/payroll', icon: Building2 },
  { name: 'Agent Network', href: '/agent-banking', icon: Store },
];

const riskAndCompliance = [
  { name: 'Fraud Shield', href: '/fraud-shield', icon: ShieldCheck },
  { name: 'Compliance & AML', href: '/compliance', icon: ShieldAlert },
  { name: 'Loan Recovery', href: '/loan-recovery', icon: MessageSquare },
  { name: 'Onboarding (T3)', href: '/onboarding', icon: UserCheck },
];

const developerTools = [
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
    { name: 'Staff Management', href: '/admin/agent-templates', icon: SlidersHorizontal },
    { name: 'System Logs', href: '/admin/audit-trail', icon: History },
  ];

  return (
    <Sidebar className="w-64 border-r border-slate-200 bg-white">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tighter italic">WEEZY</span>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">AI BANKING</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} className={`rounded-xl transition-all duration-300 ${item.highlight ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : ''}`}>
                      <Link to={item.href} className="flex items-center py-2 px-3">
                        <item.icon className={`mr-3 h-5 w-5 ${isActive || item.highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-semibold">{item.name}</span>
                        {item.highlight && <Sparkles className="ml-auto h-3 w-3 text-indigo-400" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 mb-2">Retail Banking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {retailBanking.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-xl">
                    <Link to={item.href} className="flex items-center py-2 px-3">
                      <item.icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 mb-2">Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessBanking.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-xl">
                    <Link to={item.href} className="flex items-center py-2 px-3">
                      <item.icon className="mr-3 h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 mb-2">Risk & Trust</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {riskAndCompliance.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-xl">
                    <Link to={item.href} className="flex items-center py-2 px-3">
                      <item.icon className="mr-3 h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'platform_admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-4 mb-2">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.href} className="rounded-xl">
                      <Link to={item.href} className="flex items-center py-2 px-3">
                        <item.icon className="mr-3 h-5 w-5 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-900">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100">
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer">
            <Avatar className="h-9 w-9 border-2 border-indigo-100">
              <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                {user.username?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.full_name || user.username}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">{userRole?.replace('_', ' ') || 'User'}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
