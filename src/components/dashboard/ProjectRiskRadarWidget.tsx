import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent, Badge } from '../ui';
import { Project, Case, ProjectStatus } from '../../types';
import { analyzeProjectRisk, RiskAnalysisResult } from '../../services/geminiService';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

interface ProjectRiskRadarWidgetProps {
    projects: Project[];
    cases: Case[];
}

export const ProjectRiskRadarWidget: React.FC<ProjectRiskRadarWidgetProps> = ({ projects, cases }) => {
    const [results, setResults] = useState<{ projectId: string; projectName: string; result: RiskAnalysisResult }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress || p.status === ProjectStatus.Planning);

    const runAnalysis = async () => {
        setIsLoading(true);
        const newResults = [];
        
        // Analyze top 5 active projects (by tasks count or just first 5)
        // In a real app, we might queue this or run on demand
        const projectsToAnalyze = activeProjects.slice(0, 5);

        for (const project of projectsToAnalyze) {
            try {
                // Filter cases related to this project (heuristic: case title contains project name or matched by ID if we had it)
                // For now pass all cases as the service might filter or we just pass relevant context
                // The current analyzeProjectRisk signature is (project, cases)
                const result = await analyzeProjectRisk(project, cases);
                newResults.push({
                    projectId: project.id,
                    projectName: project.name,
                    result
                });
            } catch (e) {
                console.error(`Failed to analyze project ${project.name}`, e);
            }
        }
        setResults(newResults);
        setIsLoading(false);
    };

    useEffect(() => {
        if (results.length === 0 && activeProjects.length > 0 && !isLoading) {
            runAnalysis();
        }
    }, []);

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'Low': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'High': return <ShieldAlert className="w-4 h-4" />;
            case 'Medium': return <AlertTriangle className="w-4 h-4" />;
            case 'Low': return <ShieldCheck className="w-4 h-4" />;
            default: return <ShieldCheck className="w-4 h-4" />;
        }
    };

    return (
        <Card className="h-full flex flex-col">
             <div className="p-6 pb-2 flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    Project Risk Radar
                </CardTitle>
                <button 
                    onClick={runAnalysis} 
                    disabled={isLoading}
                    className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
            </div>
            
            <CardContent className="flex-1 overflow-auto pt-2 space-y-3">
                {isLoading && results.length === 0 ? (
                     <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    results.sort((a, b) => {
                        const score = { 'High': 3, 'Medium': 2, 'Low': 1 };
                        return score[b.result.riskLevel as keyof typeof score] - score[a.result.riskLevel as keyof typeof score];
                    }).map(item => (
                        <div key={item.projectId} className="group relative overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                             {/* Risk Bar Indicator */}
                             <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                item.result.riskLevel === 'High' ? 'bg-rose-500' : 
                                item.result.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                             }`} />
                             
                             <div className="p-3 pl-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.projectName}</h4>
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 ${getRiskColor(item.result.riskLevel)}`}>
                                        {getRiskIcon(item.result.riskLevel)}
                                        {item.result.riskLevel} Risk
                                    </div>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                    {item.result.explanation}
                                </p>
                             </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No active projects to analyze.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
