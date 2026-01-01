import React, { useState } from 'react';
import { Modal } from './Modal';
import { generateProjectPlan } from '../services/geminiService';
import type { Client, AiProjectPlan } from '../types';
import { SparklesIcon } from './icons';
import { Button } from './ui/Button';

interface ProjectPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: AiProjectPlan, clientId: string) => void;
  clients: Client[];
}

export const ProjectPlannerModal: React.FC<ProjectPlannerModalProps> = ({ isOpen, onClose, onSave, clients }) => {
    const [goal, setGoal] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
    const [plan, setPlan] = useState<AiProjectPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!goal.trim() || !selectedClientId) {
            alert('Please describe your project goal and select a client.');
            return;
        }
        setIsLoading(true);
        setPlan(null);
        const generatedPlan = await generateProjectPlan(goal);
        setPlan(generatedPlan);
        setIsLoading(false);
    };

    const handleCreateProject = () => {
        if (plan && selectedClientId) {
            onSave(plan, selectedClientId);
        }
    };
    
    const handleClose = () => {
        setGoal('');
        setPlan(null);
        setIsLoading(false);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="AI Project Planner">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-200">
                        Project Goal
                    </label>
                    <textarea
                        rows={3}
                        className="w-full p-2 bg-white/50 border border-white/30 rounded-md focus:ring-rose-500 focus:border-rose-500 dark:bg-black/30 dark:border-white/20"
                        placeholder="e.g., Organize a 5K charity run for the Animal Rescue Shelter to raise $10,000"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-200">
                        For Client
                    </label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full p-2 bg-white/50 border border-white/30 rounded-md focus:ring-rose-500 focus:border-rose-500 dark:bg-black/30 dark:border-white/20"
                    >
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                >
                    <SparklesIcon />
                    {isLoading ? 'Generating Plan...' : 'Generate Plan'}
                </Button>

                {plan && (
                    <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-white/20 max-h-80 overflow-y-auto">
                        {plan.error ? (
                            <p className="text-red-500">{plan.error}</p>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold">{plan.projectName}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-4">{plan.description}</p>
                                <div className="space-y-3">
                                    {plan.phases.map((phase, index) => (
                                        <div key={index}>
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{phase.phaseName}</h4>
                                            <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-200 space-y-1 mt-1 pl-2">
                                                {phase.tasks.map((task, i) => <li key={i}>{task}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
                 <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleCreateProject} disabled={!plan || !!plan.error}>
                        Create Project
                    </Button>
                </div>
            </div>
        </Modal>
    );
};