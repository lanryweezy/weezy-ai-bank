import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Brain,
    TrendingUp,
    ShieldCheck,
    Lightbulb,
    PieChart,
    ArrowRight,
    MessageSquare,
    ChevronRight,
    Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BankerAIPortal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [explanation, setExplanation] = useState<any>(null);
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    // Fetch accounts first to get an ID for insights
    const { data: accounts } = useQuery({
        queryKey: ['accounts-summary'],
        queryFn: async () => {
            const res = await axios.get('/api/accounts');
            return res.data;
        }
    });

    const activeAccountId = accounts?.[0]?.account_id;

    const { data: insights, isLoading } = useQuery({
        queryKey: ['banker-ai-insights', activeAccountId],
        queryFn: async () => {
            const res = await axios.get(`/api/banker-ai/insights/${activeAccountId}`);
            return res.data;
        },
        enabled: !!activeAccountId
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;

        setLoadingExplanation(true);
        try {
            const res = await axios.get(`/api/banker-ai/explain?term=${searchTerm}`);
            setExplanation(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingExplanation(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">AI is analyzing your financial data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">BankerAI™ Portal</h1>
                    <p className="text-muted-foreground">Your high-fidelity generative AI financial co-pilot.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20">
                        <Brain className="w-4 h-4 mr-2" />
                        Next-Gen Intelligence Active
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Financial Health & Explainer */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
                                Financial Health Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center pb-8">
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-muted/20"
                                    />
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 * (1 - (insights?.health_score || 0) / 100)}
                                        className="text-primary transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-3xl font-bold">{insights?.health_score}</span>
                            </div>
                            <p className="mt-4 text-sm font-medium text-muted-foreground">
                                Your score is in the top 15% of similar profiles.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                                AI Explainer
                            </CardTitle>
                            <CardDescription>Understand any financial term instantly.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="e.g. CRR, Liquidity..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={loadingExplanation}>
                                    <Search className="w-4 h-4" />
                                </Button>
                            </form>

                            {explanation && (
                                <div className="p-4 rounded-lg bg-muted/50 border animate-in fade-in slide-in-from-top-2">
                                    <h4 className="font-bold text-sm uppercase text-primary mb-1">{explanation.term}</h4>
                                    <p className="text-sm leading-relaxed">{explanation.explanation}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column: Spending Insights */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl">Spending Intelligence</CardTitle>
                                <CardDescription>Deep analysis of your cash flow patterns.</CardDescription>
                            </div>
                            <Badge variant="secondary" className="font-mono">
                                TOTAL: ₦{insights?.spending_summary.total_spent.toLocaleString()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-sm font-semibold flex items-center">
                                    <PieChart className="w-4 h-4 mr-2" />
                                    Categorized Spending
                                </h4>
                                <div className="space-y-4">
                                    {insights?.spending_summary.categories.map((cat: any) => (
                                        <div key={cat.name} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{cat.name}</span>
                                                <span className="font-medium">₦{cat.value.toLocaleString()}</span>
                                            </div>
                                            <Progress value={(cat.value / insights.spending_summary.total_spent) * 100} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center">
                                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                                    AI Insights & Anomalies
                                </h4>
                                <div className="space-y-3">
                                    {insights?.insights.map((insight: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border-l-4 ${
                                                insight.type === 'warning' ? 'bg-orange-500/5 border-orange-500' : 'bg-blue-500/5 border-blue-500'
                                            }`}
                                        >
                                            <h5 className="text-sm font-bold mb-1">{insight.title}</h5>
                                            <p className="text-xs text-muted-foreground">{insight.message}</p>
                                        </div>
                                    ))}

                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <h5 className="text-sm font-bold mb-2 flex items-center text-primary">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Smart Recommendation
                                        </h5>
                                        <p className="text-xs italic mb-4">"You have a surplus of ₦145,000 this month."</p>
                                        <div className="space-y-2">
                                            {insights?.recommendations.slice(0, 2).map((rec: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-[11px] group cursor-pointer hover:text-primary transition-colors">
                                                    <ChevronRight className="w-3 h-3 mt-0.5" />
                                                    <span>{rec}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full mt-4 h-8 text-xs bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                            Optimize Now
                                            <ArrowRight className="w-3 h-3 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BankerAIPortal;
