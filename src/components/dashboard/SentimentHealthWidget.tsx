import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent, Badge } from '../ui';
import { Client, Activity } from '../../types';
import { analyzeSentiment, SentimentAnalysisResult } from '../../services/geminiService';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle, Smile, Frown, Meh } from 'lucide-react';

interface SentimentHealthWidgetProps {
    clients: Client[];
    activities: Activity[];
}

export const SentimentHealthWidget: React.FC<SentimentHealthWidgetProps> = ({ clients, activities }) => {
    const [results, setResults] = useState<SentimentAnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [analyzedClientIds, setAnalyzedClientIds] = useState<Set<string>>(new Set());

    const runAnalysis = async () => {
        setIsLoading(true);
        const resultsList: SentimentAnalysisResult[] = [];
        
        // 1. Identify clients with recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeClientIds = new Set(
            activities
                .filter(a => new Date(a.activityDate) >= thirtyDaysAgo && a.clientId)
                .map(a => a.clientId!)
        );

        // 2. Select top 5 clients by activity count to avoid API spam
        const topClients = Array.from(activeClientIds)
            .map(clientId => ({
                clientId,
                count: activities.filter(a => a.clientId === clientId).length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(item => clients.find(c => c.id === item.clientId))
            .filter((c): c is Client => !!c);

        // 3. Analyze each
        for (const client of topClients) {
            const clientActivities = activities
                .filter(a => a.clientId === client.id)
                .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
                .slice(0, 10) // Last 10 activities
                .map(a => ({
                    date: a.activityDate,
                    type: a.type,
                    title: a.title,
                    notes: a.notes
                }));

            if (clientActivities.length > 0) {
                const result = await analyzeSentiment(client.name, client.id, clientActivities);
                resultsList.push(result);
            }
        }

        setResults(resultsList);
        setAnalyzedClientIds(new Set(resultsList.map(r => r.clientId)));
        setIsLoading(false);
    };

    useEffect(() => {
        // Initial run on mount if not already done
        if (results.length === 0 && !isLoading) {
            runAnalysis();
        }
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-emerald-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case 'declining': return <TrendingDown className="w-4 h-4 text-rose-500" />;
            default: return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="p-6 pb-2 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-500" />
                    Client Sentiment Pulse
                </CardTitle>
                <button 
                    onClick={runAnalysis} 
                    disabled={isLoading}
                    className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
            </div>
            <CardContent className="flex-1 overflow-auto pt-2">
                {isLoading && results.length === 0 ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-3">
                        {results.map((res) => (
                            <div key={res.clientId} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{res.clientName}</h4>
                                    <div className="flex items-center gap-2">
                                        {res.sentimentLabel === 'At Risk' && (
                                            <Badge variant="error" size="sm" className="flex items-center gap-1">
                                                <AlertTriangle size={10} /> At Risk
                                            </Badge>
                                        )}
                                        <div className={`text-sm font-bold ${getScoreColor(res.sentimentScore)}`}>
                                            {res.sentimentScore}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {res.sentimentScore >= 70 ? <Smile className="w-5 h-5 text-emerald-500" /> :
                                         res.sentimentScore >= 40 ? <Meh className="w-5 h-5 text-amber-500" /> :
                                         <Frown className="w-5 h-5 text-rose-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-1">
                                            {res.summary}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                Trend: {getTrendIcon(res.trend)}
                                                <span className="capitalize">{res.trend}</span>
                                            </span>
                                            {res.keyConcerns && res.keyConcerns.length > 0 && (
                                                <span className="text-rose-400 flex items-center gap-1">
                                                    • {res.keyConcerns.length} concern{res.keyConcerns.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500">
                        <BrainCircuit className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No active clients with sufficient recent data to analyze.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
