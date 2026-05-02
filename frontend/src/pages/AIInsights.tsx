import React from 'react';
import Layout from '@/components/Layout';
import AIChatbot from '@/components/AIChatbot';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, HelpCircle, FileText, Zap } from 'lucide-react';

const AIInsightsPage = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                AI Customer Support & Insights <Brain className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Intelligent assistance for all your banking needs.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIChatbot />
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-indigo-500" /> Suggested Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                  "What is my current balance?"
                </Button>
                <Button variant="ghost" className="w-full justify-start text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                  "Check status of my loan application"
                </Button>
                <Button variant="ghost" className="w-full justify-start text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                  "Explain the ₦50 stamp duty fee"
                </Button>
                <Button variant="ghost" className="w-full justify-start text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                  "How do I upgrade to Tier 3?"
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-indigo-900 text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" /> Proactive Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                   <p className="text-xs font-semibold">Spending Alert</p>
                   <p className="text-[10px] text-indigo-200 mt-1">Your airtime spending is 20% higher this month than last.</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                   <p className="text-xs font-semibold">Credit Tip</p>
                   <p className="text-[10px] text-indigo-200 mt-1">Maintaining a balance of ₦50,000 for 3 months will qualify you for an instant loan.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIInsightsPage;
