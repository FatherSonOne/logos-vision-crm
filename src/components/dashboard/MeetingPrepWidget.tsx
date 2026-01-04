import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardTitle, CardContent } from '../ui';
import { Activity, ActivityType, ActivityStatus, Client } from '../../types';
import { generateMeetingPrep } from '../../services/geminiService';
import { Calendar, Users, MessageSquare, HelpCircle, Clock, Sparkles, Loader2 } from 'lucide-react';

interface MeetingPrepWidgetProps {
    activities: Activity[];
    clients: Client[];
}

interface PrepData {
    talkingPoints: string[];
    recentContext: string;
    openQuestions: string[];
}

export const MeetingPrepWidget: React.FC<MeetingPrepWidgetProps> = ({ activities, clients }) => {
    const [prepData, setPrepData] = useState<PrepData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Find next upcoming meeting
    const nextMeeting = useMemo(() => {
        const now = new Date();
        return activities
            .filter(a => 
                a.type === ActivityType.Meeting && 
                a.status === ActivityStatus.Scheduled &&
                new Date(`${a.activityDate}T${a.activityTime || '00:00'}`) > now
            )
            .sort((a, b) => new Date(`${a.activityDate}T${a.activityTime || '00:00'}`).getTime() - new Date(`${b.activityDate}T${b.activityTime || '00:00'}`).getTime())[0];
    }, [activities]);

    const attendee = useMemo(() => {
        if (!nextMeeting?.clientId) return null;
        return clients.find(c => c.id === nextMeeting.clientId);
    }, [nextMeeting, clients]);

    const recentInteractions = useMemo(() => {
        if (!nextMeeting?.clientId) return [];
        return activities
            .filter(a => a.clientId === nextMeeting.clientId && a.id !== nextMeeting.id)
            .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
            .slice(0, 3)
            .map(a => `${a.activityDate}: ${a.type} - ${a.title} (${a.notes || ''})`);
    }, [nextMeeting, activities]);

    const handleGeneratePrep = async () => {
        if (!nextMeeting || !attendee) return;
        setIsLoading(true);
        const data = await generateMeetingPrep(attendee.name, nextMeeting.title, recentInteractions);
        setPrepData(data);
        setIsLoading(false);
    };

    if (!nextMeeting) {
        return (
            <Card className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-500">
                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No upcoming meetings scheduled.</p>
                <p className="text-sm mt-1">Enjoy your free time!</p>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

            <div className="p-6 pb-2 relative z-10">
                <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Users className="w-5 h-5" />
                        Meeting Prep
                    </CardTitle>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {nextMeeting.activityTime || 'All Day'}
                        </div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            {new Date(nextMeeting.activityDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 truncate">{nextMeeting.title}</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                        {attendee?.name || 'Unknown Attendee'}
                    </p>
                </div>
            </div>

            <CardContent className="flex-1 overflow-auto pt-2 relative z-10">
                {!prepData ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                        <p className="text-sm text-slate-500 text-center max-w-[200px]">
                            Get ready for your meeting with AI-generated context and talking points.
                        </p>
                        <button 
                            onClick={handleGeneratePrep}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Cheat Sheet
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Context */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock size={12} /> Last Interaction
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800 p-2 rounded border-l-2 border-slate-300">
                                "{prepData.recentContext}"
                            </p>
                        </div>

                        {/* Talking Points */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <MessageSquare size={12} /> Talking Points
                            </h4>
                            <ul className="space-y-1">
                                {prepData.talkingPoints.map((tp, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span className="text-slate-700 dark:text-slate-200">{tp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Questions */}
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <HelpCircle size={12} /> Strategic Questions
                            </h4>
                            <ul className="space-y-1">
                                {prepData.openQuestions.map((q, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-emerald-500 font-bold">?</span>
                                        <span className="text-slate-700 dark:text-slate-200">{q}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="pt-2 flex justify-center">
                            <button 
                                onClick={handleGeneratePrep}
                                className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                            >
                                <Sparkles size={10} /> Regenerate
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
