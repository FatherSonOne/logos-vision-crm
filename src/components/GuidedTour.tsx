import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface TourStep {
    selector: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onClose: () => void;
    pageName?: string;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ steps, isOpen, onClose, pageName }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const stepRef = useRef<HTMLDivElement>(null);

    // Find next valid step (skip steps with missing selectors)
    const findNextValidStep = useCallback((startIndex: number, direction: 'forward' | 'backward'): number => {
        let index = startIndex;
        const increment = direction === 'forward' ? 1 : -1;

        while (index >= 0 && index < steps.length) {
            const step = steps[index];
            const element = document.querySelector(step.selector);
            if (element) {
                return index;
            }
            index += increment;
        }
        return -1; // No valid step found
    }, [steps]);

    useEffect(() => {
        if (isOpen && steps.length > 0) {
            const step = steps[currentStep];
            if (step) {
                const targetElement = document.querySelector(step.selector);
                if (targetElement) {
                    setIsAnimating(true);
                    const rect = targetElement.getBoundingClientRect();
                    setTargetRect(rect);
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                    // Add highlight ring to target element
                    targetElement.classList.add('tour-highlight');

                    setTimeout(() => setIsAnimating(false), 300);

                    return () => {
                        targetElement.classList.remove('tour-highlight');
                    };
                } else {
                    console.warn(`Tour step selector not found: ${step.selector}`);
                    // Try to find next valid step
                    const nextValid = findNextValidStep(currentStep + 1, 'forward');
                    if (nextValid >= 0) {
                        setCurrentStep(nextValid);
                    } else {
                        onClose();
                    }
                }
            }
        }
    }, [isOpen, currentStep, steps, onClose, findNextValidStep]);

    useEffect(() => {
        // Reset step to first valid step when tour is opened
        // Use a small delay to ensure DOM elements have rendered
        if (isOpen && steps.length > 0) {
            const timer = setTimeout(() => {
                const firstValid = findNextValidStep(0, 'forward');
                if (firstValid >= 0) {
                    setCurrentStep(firstValid);
                } else {
                    // No valid steps found - show a helpful message
                    console.log('No tour elements found on this page. Make sure the page has loaded.');
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, steps, findNextValidStep]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                nextStep();
            } else if (e.key === 'ArrowLeft') {
                prevStep();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentStep, steps.length]);

    if (!isOpen || !targetRect || steps.length === 0) return null;

    const step = steps[currentStep];
    if (!step) return null;

    const { top, left, width, height } = targetRect;

    let tooltipStyle: React.CSSProperties = {
        position: 'absolute',
        zIndex: 10001,
        transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out',
    };
    
    // Position tooltip
    if (step.position === 'top') {
        tooltipStyle = {
            ...tooltipStyle,
            top: `${top - 10}px`,
            left: `${left + width / 2}px`,
            transform: 'translate(-50%, -100%)'
        };
    } else if (step.position === 'left') {
        tooltipStyle = {
            ...tooltipStyle,
            top: `${top + height / 2}px`,
            left: `${left - 10}px`,
            transform: 'translate(-100%, -50%)'
        };
    } else if (step.position === 'right') {
        tooltipStyle = {
            ...tooltipStyle,
            top: `${top + height / 2}px`,
            left: `${left + width + 10}px`,
            transform: 'translateY(-50%)'
        };
    } else { // bottom is default
        tooltipStyle = {
            ...tooltipStyle,
            top: `${top + height + 10}px`,
            left: `${left + width / 2}px`,
            transform: 'translateX(-50%)'
        };
    }

    const nextStep = () => {
        const nextValid = findNextValidStep(currentStep + 1, 'forward');
        if (nextValid >= 0) {
            setCurrentStep(nextValid);
        } else {
            onClose();
        }
    };

    const prevStep = () => {
        const prevValid = findNextValidStep(currentStep - 1, 'backward');
        if (prevValid >= 0) {
            setCurrentStep(prevValid);
        }
    };

    // Calculate valid step count for progress display
    const validStepsCount = steps.filter(s => document.querySelector(s.selector)).length;
    const currentValidIndex = steps.slice(0, currentStep + 1).filter(s => document.querySelector(s.selector)).length;

    return (
        <div className="fixed inset-0 z-[10000]">
            {/* Backdrop with spotlight cutout */}
            <div
                className="absolute inset-0 bg-black/70 dark:bg-black/90 backdrop-blur-sm"
                style={{
                    clipPath: `path("M0,0H${window.innerWidth}V${window.innerHeight}H0V0ZM${left - 8},${top - 8}a8,8 0 0 1 8,-8h${width}a8,8 0 0 1 8,8v${height}a8,8 0 0 1 -8,8h-${width}a8,8 0 0 1 -8,-8Z")`,
                    transition: 'clip-path 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={onClose}
            />

            {/* Spotlight ring around target - Nothing style light blue */}
            <div
                className="absolute pointer-events-none rounded-lg ring-2 ring-[#7dd3fc] dark:ring-[#7dd3fc] shadow-[0_0_20px_rgba(125,211,252,0.4)]"
                style={{
                    top: `${top - 4}px`,
                    left: `${left - 4}px`,
                    width: `${width + 8}px`,
                    height: `${height + 8}px`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />

            {/* Tooltip card - Nothing matte black style */}
            <div
                ref={stepRef}
                style={tooltipStyle}
                className={`
                    bg-white dark:bg-[#0a0a0a] p-5 rounded-xl shadow-2xl w-80
                    text-slate-900 dark:text-white
                    border border-slate-200 dark:border-[#1a1a1a]
                    dark:shadow-[0_0_30px_rgba(125,211,252,0.1)]
                    transition-all duration-300
                    ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                `}
            >
                {/* Page indicator */}
                {pageName && (
                    <div className="text-xs font-medium text-[#0ea5e9] dark:text-[#7dd3fc] mb-2 uppercase tracking-wide">
                        {pageName.replace('-', ' ')} Guide
                    </div>
                )}

                {/* Title with icon */}
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 dark:bg-[#7dd3fc]/20 text-[#0ea5e9] dark:text-[#7dd3fc] text-sm">
                        {currentValidIndex}
                    </span>
                    {step.title}
                </h3>

                {/* Content */}
                <p className="text-sm text-slate-600 dark:text-[#b3b3b3] leading-relaxed">
                    {step.content}
                </p>

                {/* Progress bar - Nothing style */}
                <div className="mt-4 mb-3">
                    <div className="h-1 bg-slate-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] dark:from-[#7dd3fc] dark:to-[#a5f3fc] rounded-full transition-all duration-300"
                            style={{ width: `${(currentValidIndex / validStepsCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 dark:text-[#4d4d4d]">
                        {currentValidIndex} of {validStepsCount}
                    </span>
                    <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="text-sm font-medium px-3 py-1.5 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-100 dark:hover:bg-[#121212] rounded-lg transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-sm font-medium px-3 py-1.5 text-slate-500 dark:text-[#808080] hover:bg-slate-100 dark:hover:bg-[#121212] rounded-lg transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={nextStep}
                            className="text-sm font-semibold px-4 py-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] hover:from-[#0284c7] hover:to-[#0891b2] text-white rounded-lg transition-all shadow-md hover:shadow-lg dark:shadow-[0_0_15px_rgba(125,211,252,0.2)]"
                        >
                            {findNextValidStep(currentStep + 1, 'forward') < 0 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>

                {/* Keyboard hint */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#1a1a1a]">
                    <p className="text-xs text-slate-400 dark:text-[#4d4d4d] text-center">
                        Use arrow keys to navigate or Esc to close
                    </p>
                </div>
            </div>
        </div>
    );
};
