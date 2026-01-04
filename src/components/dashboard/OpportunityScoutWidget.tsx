import React, { useState, useMemo } from 'react';
import { Card, CardTitle, CardContent, Badge } from '../ui';
import { Client, Donation } from '../../types';
import { generateOpportunityPitch } from '../../services/geminiService';
import { Sparkles, ArrowRight, UserPlus, Star, Clock, Send, Loader2 } from 'lucide-react';

interface OpportunityScoutWidgetProps {
    clients: Client[];
    donations: Donation[];
}

type OpportunityType = 'high_capacity_low_engagement' | 'lapsed_major_donor' | 'rising_star';

interface Opportunity {
    clientId: string;
    clientName: string;
    type: OpportunityType;
    details: string;
}

export const OpportunityScoutWidget: React.FC<OpportunityScoutWidgetProps> = ({ clients, donations }) => {
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
    const [pitch, setPitch] = useState<{ subject: string; pitch: string; suggestedAction: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const opportunities = useMemo(() => {
        const opps: Opportunity[] = [];
        const now = new Date();
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

        // Helper to get total donations for a client
        const getClientDonations = (clientId: string) => donations.filter(d => d.clientId === clientId);
        const getTotalDonated = (clientId: string) => getClientDonations(clientId).reduce((sum, d) => sum + d.amount, 0);

        clients.forEach(client => {
            const clientDonations = getClientDonations(client.id);
            const totalDonated = getTotalDonated(client.id);
            const lastDonation = clientDonations.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())[0];

            // 1. Lapsed Major Donor: >$1000 total, no gift in 1 year
            if (totalDonated > 1000 && lastDonation && new Date(lastDonation.donationDate) < oneYearAgo) {
                opps.push({
                    clientId: client.id,
                    clientName: client.name,
                    type: 'lapsed_major_donor',
                    details: `Lifetime giving: $${totalDonated}. Last gift: ${new Date(lastDonation.donationDate).toLocaleDateString()}.`
                });
            }
            // 2. Rising Star: First gift was >$200 in last 6 months
            else if (clientDonations.length === 1 && totalDonated > 200 && lastDonation && new Date(lastDonation.donationDate) > sixMonthsAgo) {
                opps.push({
                    clientId: client.id,
                    clientName: client.name,
                    type: 'rising_star',
                    details: `First time donor gave $${totalDonated} on ${new Date(lastDonation.donationDate).toLocaleDateString()}.`
                });
            }
            // 3. High Capacity (heuristic): Organization or Corporate type (if we had that) or just assumed based on context/notes
            // For now, let's use a placeholder heuristic or skip if data insufficient.
            // Let's use "High Capacity" if total > $5000 but only 1 gift ever.
            else if (totalDonated > 5000 && clientDonations.length <= 2) {
                opps.push({
                    clientId: client.id,
                    clientName: client.name,
                    type: 'high_capacity_low_engagement',
                    details: `High lifetime value ($${totalDonated}) but low frequency (${clientDonations.length} gifts).`
                });
            }
        });

        return opps.slice(0, 5); // Top 5
    }, [clients, donations]);

    const handleGeneratePitch = async (opp: Opportunity) => {
        setIsGenerating(true);
        setSelectedOpp(opp);
        setPitch(null);
        
        const result = await generateOpportunityPitch(opp.clientName, opp.type, opp.details);
        setPitch(result);
        setIsGenerating(false);
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="p-6 pb-2">
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    AI Opportunity Scout
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Identified {opportunities.length} hidden gems in your donor list.</p>
            </div>
            
            <CardContent className="flex-1 overflow-auto pt-2 space-y-4">
                {opportunities.map(opp => (
                    <div key={opp.clientId} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-4 transition-all hover:shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{opp.clientName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {opp.type === 'lapsed_major_donor' && <Badge variant="warning" size="sm"><Clock size={10} className="mr-1"/> Lapsed Major</Badge>}
                                    {opp.type === 'rising_star' && <Badge variant="success" size="sm"><Star size={10} className="mr-1"/> Rising Star</Badge>}
                                    {opp.type === 'high_capacity_low_engagement' && <Badge variant="info" size="sm"><UserPlus size={10} className="mr-1"/> High Potential</Badge>}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleGeneratePitch(opp)}
                                disabled={isGenerating && selectedOpp?.clientId === opp.clientId}
                                className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 font-medium"
                            >
                                {isGenerating && selectedOpp?.clientId === opp.clientId ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Sparkles size={14} />
                                )}
                                {selectedOpp?.clientId === opp.clientId && pitch ? 'Regenerate' : 'Draft Pitch'}
                            </button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-3">{opp.details}</p>

                        {selectedOpp?.clientId === opp.clientId && pitch && (
                            <div className="mt-3 bg-white dark:bg-slate-800 rounded-md p-3 border border-indigo-100 dark:border-indigo-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Subject</div>
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{pitch.subject}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Opener</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 italic">"{pitch.pitch}"</div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Suggested Action:</div>
                                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 flex items-center gap-1">
                                            {pitch.suggestedAction} <ArrowRight size={10} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {opportunities.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No new opportunities detected at this time.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
