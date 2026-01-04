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
    const [targetElement, setTargetElement] = useState<Element | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const stepRef = useRef<HTMLDivElement>(null);
    const originalStylesRef = useRef<Map<Element, { zIndex: string; position: string; outline: string }>>(new Map());

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

    // Cleanup function to restore element styles
    const cleanupTargetElement = useCallback(() => {
        originalStylesRef.current.forEach((styles, element) => {
            if (element instanceof HTMLElement) {
                element.style.zIndex = styles.zIndex;
                element.style.position = styles.position;
                element.style.outline = styles.outline;
                element.classList.remove('tour-highlight');
            }
        });
        originalStylesRef.current.clear();
    }, []);

    // Highlight target element by elevating it above the overlay
    const highlightTargetElement = useCallback((element: Element) => {
        if (element instanceof HTMLElement) {
            // Store original styles
            originalStylesRef.current.set(element, {
                zIndex: element.style.zIndex,
                position: element.style.position,
                outline: element.style.outline
            });

            // Elevate element above overlay (z-index 10000)
            const currentPosition = window.getComputedStyle(element).position;
            if (currentPosition === 'static') {
                element.style.position = 'relative';
            }
            element.style.zIndex = '10002';
            element.style.outline = '3px solid #7dd3fc';
            element.classList.add('tour-highlight');
        }
    }, []);

    useEffect(() => {
        if (isOpen && steps.length > 0) {
            const step = steps[currentStep];
            if (step) {
                const element = document.querySelector(step.selector);
                if (element) {
                    // Cleanup previous target
                    cleanupTargetElement();

                    setIsAnimating(true);
                    const rect = element.getBoundingClientRect();
                    setTargetRect(rect);
                    setTargetElement(element);

                    // Scroll element into view
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

                    // Highlight the element by elevating it
                    highlightTargetElement(element);

                    setTimeout(() => setIsAnimating(false), 300);
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

        return () => {
            if (!isOpen) {
                cleanupTargetElement();
            }
        };
    }, [isOpen, currentStep, steps, onClose, findNextValidStep, cleanupTargetElement, highlightTargetElement]);

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

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            cleanupTargetElement();
            setTargetElement(null);
            setTargetRect(null);
        }
    }, [isOpen, cleanupTargetElement]);

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

    // Handle window resize to update target rect
    useEffect(() => {
        if (!isOpen || !targetElement) return;

        const handleResize = () => {
            const rect = targetElement.getBoundingClientRect();
            setTargetRect(rect);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize, true);
        };
    }, [isOpen, targetElement]);

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

    if (!isOpen || !targetRect || steps.length === 0) return null;

    const step = steps[currentStep];
    if (!step) return null;

    const { top, left, width, height } = targetRect;

    // Calculate tooltip position
    let tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10003,
        transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out',
    };

    const padding = 16; // Space between target and tooltip
    const tooltipWidth = 320;
    const tooltipHeight = 280; // Estimated height

    // Position tooltip based on step.position, with viewport boundary checks
    if (step.position === 'top') {
        let tooltipTop = top - padding;
        let tooltipLeft = left + width / 2;
        // Check if tooltip would go off-screen at top
        if (tooltipTop - tooltipHeight < 0) {
            // Switch to bottom
            tooltipTop = top + height + padding;
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translateX(-50%)'
            };
        } else {
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translate(-50%, -100%)'
            };
        }
    } else if (step.position === 'left') {
        let tooltipTop = top + height / 2;
        let tooltipLeft = left - padding;
        // Check if tooltip would go off-screen at left
        if (tooltipLeft - tooltipWidth < 0) {
            // Switch to right
            tooltipLeft = left + width + padding;
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translateY(-50%)'
            };
        } else {
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translate(-100%, -50%)'
            };
        }
    } else if (step.position === 'right') {
        let tooltipTop = top + height / 2;
        let tooltipLeft = left + width + padding;
        // Check if tooltip would go off-screen at right
        if (tooltipLeft + tooltipWidth > window.innerWidth) {
            // Switch to left
            tooltipLeft = left - padding;
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translate(-100%, -50%)'
            };
        } else {
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translateY(-50%)'
            };
        }
    } else { // bottom is default
        let tooltipTop = top + height + padding;
        let tooltipLeft = left + width / 2;
        // Check if tooltip would go off-screen at bottom
        if (tooltipTop + tooltipHeight > window.innerHeight) {
            // Switch to top
            tooltipTop = top - padding;
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translate(-50%, -100%)'
            };
        } else {
            tooltipStyle = {
                ...tooltipStyle,
                top: `${tooltipTop}px`,
                left: `${tooltipLeft}px`,
                transform: 'translateX(-50%)'
            };
        }
    }

    // Calculate valid step count for progress display
    const validStepsCount = steps.filter(s => document.querySelector(s.selector)).length;
    const currentValidIndex = steps.slice(0, currentStep + 1).filter(s => document.querySelector(s.selector)).length;

    return (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
            {/* Semi-transparent overlay - pointer events enabled so clicking closes the tour */}
            <div
                className="absolute inset-0 bg-black/60 dark:bg-black/70 pointer-events-auto"
                onClick={onClose}
            />

            {/* Spotlight cutout - creates a "hole" in the overlay to reveal the target */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: `${top - 8}px`,
                    left: `${left - 8}px`,
                    width: `${width + 16}px`,
                    height: `${height + 16}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            />

            {/* Spotlight ring around target - Nothing style light blue glow */}
            <div
                className="absolute pointer-events-none rounded-xl"
                style={{
                    top: `${top - 6}px`,
                    left: `${left - 6}px`,
                    width: `${width + 12}px`,
                    height: `${height + 12}px`,
                    border: '3px solid #7dd3fc',
                    boxShadow: '0 0 30px rgba(125, 211, 252, 0.5), inset 0 0 20px rgba(125, 211, 252, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                    dark:shadow-[0_0_30px_rgba(125,211,252,0.15)]
                    transition-all duration-300
                    pointer-events-auto
                    ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                `}
            >
                {/* Page indicator */}
                {pageName && (
                    <div className="text-xs font-semibold text-[#0ea5e9] dark:text-[#7dd3fc] mb-2 uppercase tracking-wider">
                        {pageName.replace('-', ' ')} Guide
                    </div>
                )}

                {/* Title with icon */}
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 dark:bg-[#7dd3fc]/20 text-[#0ea5e9] dark:text-[#7dd3fc] text-sm font-bold">
                        {currentValidIndex}
                    </span>
                    {step.title}
                </h3>

                {/* Content */}
                <p className="text-sm text-slate-600 dark:text-[#b3b3b3] leading-relaxed mb-4">
                    {step.content}
                </p>

                {/* Progress bar - Nothing style */}
                <div className="mb-4">
                    <div className="h-1.5 bg-slate-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] dark:from-[#7dd3fc] dark:to-[#a5f3fc] rounded-full transition-all duration-300"
                            style={{ width: `${(currentValidIndex / validStepsCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 dark:text-[#4d4d4d] font-medium">
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
                            className="text-sm font-semibold px-4 py-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] hover:from-[#0284c7] hover:to-[#0891b2] text-white rounded-lg transition-all shadow-md hover:shadow-lg dark:shadow-[0_0_15px_rgba(125,211,252,0.3)]"
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
