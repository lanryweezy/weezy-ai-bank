
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Store
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

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Activity },
  { name: 'AI Templates', href: '/ai-templates', icon: Cpu },
  { name: 'Agent Monitor', href: '/monitor', icon: Brain },
  { name: 'Workflow Automator', href: '/workflows', icon: GitBranch },
  { name: 'Task Manager', href: '/tasks', icon: CheckSquare },
  { name: 'Knowledge Base', href: '/knowledge', icon: Database },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Insights', href: '/insights', icon: Brain },
  { name: 'Financial Reports', href: '/reports', icon: FileText },
  { name: 'Security Center', href: '/security', icon: Shield },
  { name: 'Integrations', href: '/integrations', icon: Plug },
];

const bankingModules = [
  { name: 'Customer Base', href: '/customers', icon: UserCheck },
  { name: 'Agent Banking', href: '/agent-banking', icon: Store },
  { name: 'Corporate Payroll', href: '/payroll', icon: Building2 },
  { name: 'Loans & Credit', href: '/loans', icon: CreditCard },
  { name: 'Financial Switch', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Treasury & Liquidity', href: '/treasury', icon: Landmark },
  { name: 'Dual Authorization', href: '/checker', icon: ShieldAlert },
  { name: 'Open Banking', href: '/open-banking', icon: Lock },
  { name: 'Self-Service Portal', href: '/portal', icon: Wallet },
];

const teamModules = [
    { name: 'Team Management', href: '/team', icon: Users },
    { name: 'Communications', href: '/email', icon: Mail },
    { name: 'System Settings', href: '/settings', icon: Settings },
];

// Helper to get user role - replace with your actual auth context or service
const getUserRole = () => localStorage.getItem('userRole');


export function AppSidebar() {
  const location = useLocation();
  const userRole = getUserRole();

  // Admin navigation items
  const adminNavigation = [
    { name: 'Agent Templates', href: '/admin/agent-templates', icon: SlidersHorizontal },
    { name: 'Workflow Definitions', href: '/admin/workflow-definitions', icon: GitBranch },
    { name: 'Agent Monitoring', href: '/admin/agent-monitoring', icon: ActivitySquare },
    { name: 'Audit Trail', href: '/admin/audit-trail', icon: History },
  ];


  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-4 border-b border-blue-600"> {/* Added border */}
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-blue-300" /> {/* Adjusted icon color */}
          <span className="ml-2 text-xl font-bold text-white">BankingAI</span>
          <div className="ml-2 px-2 py-1 bg-blue-500 text-xs text-white rounded-full"> {/* Badge is fine */}
            Platform
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent> {/* text-white is inherited from parent or applied in ui/sidebar.tsx */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300">AI Platform</SidebarGroupLabel> {/* Adjusted label color */}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    {/* SidebarMenuButton styles are now handled in ui/sidebar.tsx for text-white and icon colors */}
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" /> {/* Icon color handled by SidebarMenuButton's new CSS */}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300">Banking Core</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bankingModules.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className="flex items-center font-medium">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teamModules.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'platform_admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-300">Administration</SidebarGroupLabel> {/* Adjusted label color */}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href} className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-blue-600"> {/* Added border */}
        <div className="bg-blue-800 rounded-lg p-3"> {/* Darker blue for contrast within blue sidebar */}
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-blue-300" /> {/* Adjusted icon color */}
            <div className="ml-3">
              <p className="text-sm font-medium text-white">AI Powered</p>
              <p className="text-xs text-blue-200">Next-gen banking automation</p> {/* Adjusted text color */}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
