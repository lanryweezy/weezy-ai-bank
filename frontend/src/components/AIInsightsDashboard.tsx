import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Fingerprint,
  Zap,
  BarChart,
  PieChart,
  Radar,
  Target,
  RefreshCw,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Progress } from './ui/progress';

const riskClusters = [
  { x: 45, y: 30, z: 200, name: 'Normal Activity' },
  { x: 85, y: 75, z: 100, name: 'Suspicious Cluster A' },
  { x: 20, y: 90, z: 150, name: 'High Velocity Transfers' },
  { x: 60, y: 20, z: 80, name: 'Dormant Account Awakening' },
];

const AIInsightsDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-indigo-600" /> Intelligence Insights
          </h2>
          <p className="text-gray-500 mt-1">Predictive analytics and pattern recognition powered by core AI agents.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-gray-200">
            <RefreshCw className="h-4 w-4 mr-2" /> Re-train Models
          </Button>
          <Button className="h-11 bg-slate-900 hover:bg-black text-white font-bold rounded-xl px-6 shadow-lg shadow-slate-200">
            <Sparkles className="h-4 w-4 mr-2" /> AI Strategy Advisor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Default Prediction</p>
                <CardTitle className="text-2xl font-bold">1.42% <span className="text-xs text-emerald-500 font-medium font-sans">(-0.12%)</span></CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-20 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v: 20}, {v: 25}, {v: 18}, {v: 30}, {v: 22}, {v: 15}]}>
                            <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-400 mt-4">Predicted portfolio default rate for next 30 days.</p>
            </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Anomaly Detection</p>
                <CardTitle className="text-2xl font-bold">Low <span className="text-xs text-emerald-500 font-medium font-sans">Stable</span></CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-20 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{v: 5}, {v: 8}, {v: 4}, {v: 6}, {v: 7}, {v: 5}]}>
                            <Line type="monotone" dataKey="v" stroke="#f43f5e" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-400 mt-4">System-wide behavioral deviation index.</p>
            </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Liquidity Coverage</p>
                <CardTitle className="text-2xl font-bold">142% <span className="text-xs text-emerald-500 font-medium font-sans">Optimal</span></CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-20 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v: 120}, {v: 130}, {v: 125}, {v: 142}]}>
                            <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-400 mt-4">Calculated high-quality liquid asset buffer.</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold">Risk Clustering (Behavioral Latent Space)</CardTitle>
                    <CardDescription>Unsupervised grouping of transaction patterns.</CardDescription>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input className="h-8 w-32 bg-white border border-gray-200 rounded-lg pl-8 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Explore space..." />
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" dataKey="x" name="Velocity" hide />
                            <YAxis type="number" dataKey="y" name="Frequency" hide />
                            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Volume" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Risk Profiles" data={riskClusters}>
                                {riskClusters.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 1 ? '#f43f5e' : '#6366f1'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Low Risk Profiles</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Suspicious Pattern Detected</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
                <CardTitle className="text-lg font-bold">Predictive Model Confidence</CardTitle>
                <CardDescription>Accuracy and drift metrics for production AI nodes.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
                {[
                    { label: 'Credit Scoring Node', value: 96.4, drift: 0.2 },
                    { label: 'Fraud Detection Engine', value: 99.8, drift: 0.05 },
                    { label: 'Customer Churn Predictor', value: 84.2, drift: 1.2 },
                    { label: 'LTV Estimation Bot', value: 91.5, drift: 0.4 }
                ].map((model, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{model.label}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Drift: {model.drift}% (Normal)</p>
                            </div>
                            <span className="text-xs font-black text-indigo-600">{model.value}% Acc.</span>
                        </div>
                        <Progress value={model.value} className="h-1.5 bg-gray-100" />
                    </div>
                ))}

                <div className="pt-8 border-t border-gray-100">
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                        <Fingerprint className="h-6 w-6 text-indigo-600" />
                        <div>
                            <h5 className="font-bold text-indigo-900 text-sm">Model Retraining Required</h5>
                            <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed">The Customer Churn Predictor has shown a drift of >1% in the last 24 hours. Consider updating training sets with recent Q4 behavioral data.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
