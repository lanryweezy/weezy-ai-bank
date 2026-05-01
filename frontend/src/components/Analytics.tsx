
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, Activity, CreditCard, Landmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const portfolioData = [
  { month: 'Jan', savings: 4000, loans: 2400, fds: 2400 },
  { month: 'Feb', savings: 3000, loans: 1398, fds: 2210 },
  { month: 'Mar', savings: 2000, loans: 9800, fds: 2290 },
  { month: 'Apr', savings: 2780, loans: 3908, fds: 2000 },
  { month: 'May', savings: 1890, loans: 4800, fds: 2181 },
  { month: 'Jun', savings: 2390, loans: 3800, fds: 2500 },
];

const departmentData = [
  { name: 'Retail Banking', value: 45, color: '#6366f1' },
  { name: 'Corporate', value: 25, color: '#10b981' },
  { name: 'SME', value: 20, color: '#f59e0b' },
  { name: 'Investment', value: 10, color: '#ef4444' },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Analytics</h2>
          <p className="text-gray-500 mt-1">Deep dive into portfolio performance and operational efficiency.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none ring-1 ring-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Assets</p>
                <h3 className="text-3xl font-bold mt-2">₦4.8B</h3>
                <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+12.5%</span>
                  <span className="text-gray-400 ml-2 font-normal">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Landmark className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none ring-1 ring-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Customers</p>
                <h3 className="text-3xl font-bold mt-2">12,482</h3>
                <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+4.2%</span>
                  <span className="text-gray-400 ml-2 font-normal">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none ring-1 ring-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">NPL Ratio</p>
                <h3 className="text-3xl font-bold mt-2">1.8%</h3>
                <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+0.2%</span>
                  <span className="text-gray-400 ml-2 font-normal">Alert threshold: 3%</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100/50 p-1">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none ring-1 ring-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Asset allocation across different bank departments</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none ring-1 ring-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Monthly growth in deposits and loan disbursements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="savings" stroke="#6366f1" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={2} />
                      <Area type="monotone" dataKey="loans" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card className="border-none ring-1 ring-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Loan vs Savings Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip />
                    <Bar dataKey="savings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="loans" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
