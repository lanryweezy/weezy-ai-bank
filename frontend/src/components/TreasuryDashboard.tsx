import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import {
  Landmark,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  Calculator,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';

const TreasuryDashboard: React.FC = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['treasury-metrics'],
    queryFn: () => apiClient<any>('/admin/treasury/metrics'),
  });

  if (isLoading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-12 w-48" /><Skeleton className="h-96 w-full" /></div>;
  }

  const formatCurrency = (val: number) => `₦${(val / 1000000).toFixed(2)}M`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Landmark className="h-8 w-8 text-indigo-600" /> Treasury & Liquidity
          </h2>
          <p className="text-gray-500 mt-1">Asset Liability Management (ALM) and regulatory liquidity monitoring.</p>
        </div>
        <Button variant="outline" className="h-11 rounded-xl border-gray-200" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Recalculate CRR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CRR Monitor */}
        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden md:col-span-2">
            <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg font-bold">Cash Reserve Ratio (CRR)</CardTitle>
                        <CardDescription>Mandatory central bank sterilized reserves.</CardDescription>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">COMPLIANT</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Required Reserve</p>
                        <p className="text-3xl font-black text-gray-900">{formatCurrency(metrics?.crrRequired)}</p>
                        <p className="text-xs text-indigo-600 font-bold">32.5% of Eligible Deposits</p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Actual Sterilized</p>
                        <p className="text-3xl font-black text-emerald-600">{formatCurrency(metrics?.crrActual)}</p>
                        <p className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <ShieldCheck className="h-3 w-3" /> Over-provisioned
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-gray-700">Liquidity Coverage Ratio (LCR)</span>
                        <span className="text-xl font-black text-indigo-600">{(metrics?.liquidityRatio * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics?.liquidityRatio * 100} className="h-2 bg-gray-100" />
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold tracking-widest">
                        <AlertTriangle className="h-3 w-3 text-amber-500" /> CBN Minimum Requirement: 30%
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* ECL Provisioning */}
        <Card className="border-none bg-slate-900 text-white shadow-xl shadow-slate-200 rounded-2xl overflow-hidden flex flex-col">
            <CardHeader className="p-6 border-b border-white/10">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-indigo-400" /> IFRS 9 ECL
                </CardTitle>
                <CardDescription className="text-gray-400">Expected Credit Loss Modeling</CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex-grow space-y-6">
                <div>
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Total Loan Portfolio</p>
                    <p className="text-4xl font-bold">₦1.42B</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">ECL Provisions (Stage 1 & 2)</p>
                    <p className="text-2xl font-bold text-indigo-300">{formatCurrency(metrics?.eclProvisioning)}</p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Non-Performing Loans (NPL)</span>
                        <span className="text-rose-400 font-bold">2.4%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Cost of Risk</span>
                        <span className="text-indigo-400 font-bold">0.8%</span>
                    </div>
                </div>
            </CardContent>
            <div className="p-4 bg-indigo-600 text-center">
                <Button variant="link" className="text-white font-bold text-xs">Full ALCO Report <ArrowRightLeft className="ml-2 h-3 w-3" /></Button>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900">Capital Adequacy Ratio (CAR)</h4>
                      <p className="text-sm text-gray-500">Tier 1 & Tier 2 regulatory capital monitoring.</p>
                  </div>
                  <div className="ml-auto">
                      <span className="text-2xl font-black text-gray-900">18.4%</span>
                  </div>
              </div>
          </Card>
          <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                      <Building className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900">Weighted Risk Assets</h4>
                      <p className="text-sm text-gray-500">Total portfolio adjusted for risk weightings.</p>
                  </div>
                  <div className="ml-auto">
                      <span className="text-2xl font-black text-gray-900">₦2.8B</span>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
