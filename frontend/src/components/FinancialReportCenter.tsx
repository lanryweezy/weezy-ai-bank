import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  RefreshCw,
  PieChart as PieChartIcon,
  BarChart,
  TrendingUp,
  Table as TableIcon,
  ChevronRight,
  ArrowRightLeft,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';

const FinancialReportCenter: React.FC = () => {
  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['financial-report'],
    queryFn: () => apiClient<any>('/admin/reporting/financial-statements?startDate=2023-01-01&endDate=2023-12-31'),
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
            <FileText className="h-8 w-8 text-indigo-600" /> Regulatory Reporting
          </h2>
          <p className="text-gray-500 mt-1">IFRS compliant financial statements and automated CBN disclosure data.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-gray-200" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Recalculate
          </Button>
          <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6">
            <Download className="h-4 w-4 mr-2" /> Export JSON Package
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold">Balance Sheet (Statement of Position)</CardTitle>
                    <CardDescription>As of December 31, 2023</CardDescription>
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold">UNAUDITED</Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assets</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cash and Balances with Central Bank</span>
                                <span className="font-bold text-gray-900">{formatCurrency(report?.assets.cashAndReserves)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Loans and Advances to Customers</span>
                                <span className="font-bold text-gray-900">{formatCurrency(report?.assets.loansAndAdvances)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Investment Securities</span>
                                <span className="font-bold text-gray-900">{formatCurrency(report?.assets.investments)}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-black">
                                <span className="text-gray-900">Total Assets</span>
                                <span className="text-indigo-600 underline underline-offset-4">{formatCurrency(report?.assets.totalAssets)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Liabilities</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Deposits from Customers</span>
                                <span className="font-bold text-gray-900">{formatCurrency(report?.liabilities.customerDeposits)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Interbank Borrowings</span>
                                <span className="font-bold text-gray-900">{formatCurrency(report?.liabilities.interbankBorrowings)}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-black">
                                <span className="text-gray-900">Total Liabilities</span>
                                <span className="text-gray-900">{formatCurrency(report?.liabilities.totalLiabilities)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                <CardTitle className="text-lg font-bold">Income Statement (Profit & Loss)</CardTitle>
                <CardDescription>For the year ended Dec 31, 2023</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Interest Income</p>
                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(report?.performance.interestIncome)}</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Interest Expense</p>
                        <p className="text-xl font-bold text-rose-600">{formatCurrency(report?.performance.interestExpense)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Net Interest Margin (NIM)</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(report?.performance.netInterestMargin)}</span>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <ArrowRightLeft className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Fee & Commission Income</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{formatCurrency(report?.performance.feeIncome)}</span>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Building className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Operating Expenses (OPEX)</span>
                        </div>
                        <span className="text-sm font-bold text-amber-600">{formatCurrency(report?.performance.operatingExpenses)}</span>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl text-white flex justify-between items-center shadow-xl shadow-slate-200">
                    <div>
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Profit Before Tax</p>
                        <p className="text-3xl font-bold tracking-tighter">₦18.4M</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">SOLVENT</Badge>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReportCenter;
