import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw, BarChart3, ShieldCheck, Brain, Wallet } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

const TreasuryPage = () => {
  const { data: pos, isLoading: loadingPos, refetch: refetchPos } = useQuery({
    queryKey: ['treasuryPosition'],
    queryFn: () => apiClient('/corebanking/treasury/position'),
    refetchInterval: 15000,
  });

  const { data: forecast, refetch: refetchForecast } = useQuery({
    queryKey: ['liquidityForecast'],
    queryFn: () => apiClient('/corebanking/treasury/forecast/latest'),
  });

  const forecastMutation = useMutation({
    mutationFn: () => apiClient('/corebanking/treasury/forecast/generate', { method: 'POST' }),
    onSuccess: () => {
      toast.success('AI Liquidity Forecast Generated');
      refetchForecast();
    },
  });

  if (loadingPos) return <Layout><div className="p-8 text-center">Loading Treasury Data...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Treasury & Liquidity Control <Landmark className="h-6 w-6 text-indigo-600" />
            </h1>
            <p className="text-gray-600 mt-1">Monitor bank-wide assets, CRR positions, and AI-driven forecasts.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => forecastMutation.mutate()} disabled={forecastMutation.isPending} className="bg-indigo-600">
                <Brain className={`mr-2 h-4 w-4 ${forecastMutation.isPending ? 'animate-spin' : ''}`} /> Run AI Forecast
            </Button>
          </div>
        </div>

        {/* Liquidity Ratio Meter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-1 border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Liquidity Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center">
                        <div className={`text-4xl font-bold ${pos.is_compliant ? 'text-green-600' : 'text-red-600'}`}>
                            {pos.liquidity_ratio}%
                        </div>
                        <Badge className={`mt-2 ${pos.is_compliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-none`}>
                            {pos.is_compliant ? 'COMPLIANT' : 'BELOW LIMIT'}
                        </Badge>
                        <p className="text-[10px] text-gray-400 mt-4 text-center">CBN Minimum Requirement: 30%</p>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Deposits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{pos.customer_liabilities.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1 text-green-500" /> +4.2% this month</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Liquid Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-indigo-700">₦{pos.bank_liquid_assets.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1">Vault + CBN + Nostro</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase">CRR Position</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₦{pos.crr_position.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center"><Activity className="h-3 w-3 mr-1" /> On-ledger at Central Bank</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* AI Forecast Column */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl ring-1 ring-indigo-200 bg-white overflow-hidden">
                <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-indigo-400" />
                        <CardTitle className="text-sm">Weezy AI Liquidity Forecast</CardTitle>
                    </div>
                    {forecast && <Badge className="bg-white/10 text-white border-none">{new Date(forecast.forecast_date).toLocaleDateString()}</Badge>}
                </div>
                <CardContent className="pt-6">
                    {forecast ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Predicted Outflow (7d)</p>
                                    <h3 className="text-2xl font-bold text-red-600">₦{parseFloat(forecast.predicted_outflow).toLocaleString()}</h3>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Predicted Inflow (7d)</p>
                                    <h3 className="text-2xl font-bold text-green-600">₦{parseFloat(forecast.predicted_inflow).toLocaleString()}</h3>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-indigo-600" /> AI Strategic Analysis:
                                </p>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                    "{forecast.ai_report_json?.risk_analysis}"
                                </p>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <p className="text-xs font-bold text-indigo-900">Recommendation: <span className="text-indigo-600 uppercase">{forecast.ai_report_json?.recommendation}</span></p>
                                <p className="text-[10px] text-gray-400">Confidence: {(forecast.confidence_score * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <RefreshCw className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 italic text-sm">No forecast data available. Click 'Run AI Forecast' to generate report.</p>
                        </div>
                    )}
                </CardContent>
              </Card>

              {/* Chart Placeholder */}
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                 <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-indigo-600" /> Reserve Movement (30D)
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="h-48 w-full bg-slate-50 rounded-2xl flex items-end justify-between p-6 gap-2">
                        {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-200 rounded-t-sm transition-all hover:bg-indigo-600" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Market Context Sidebar */}
           <div className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-gray-200">
                <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Market Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <p className="text-[10px] text-indigo-600 font-bold uppercase">MPR (CBN Rate)</p>
                        <p className="text-lg font-bold">24.75%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">CRR (Liquidity Ratio)</p>
                        <p className="text-lg font-bold">45.0%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Inflation (CPI)</p>
                        <p className="text-lg font-bold text-red-600">33.2%</p>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Treasury Guidelines</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        "Ensure daily CRR compliance at the Central Bank window by 10:00 AM WAT. All NIP settlement discrepancies > ₦1M must be escalated to IT Operations instantly."
                    </p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default TreasuryPage;
