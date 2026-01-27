import React from 'react';

interface RelationshipScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RelationshipScoreCircle({ score, size = 'md' }: RelationshipScoreCircleProps) {
  // Dimensions based on size
  const dimensions = {
    sm: { width: 60, height: 60, strokeWidth: 4, fontSize: 'text-lg' },
    md: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-2xl' },
    lg: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-4xl' }
  };

  const { width, height, strokeWidth, fontSize } = dimensions[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const color = getScoreColor(score);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`Relationship score: ${score} out of 100, rated as ${getScoreLabel(score)}`}
    >
      <svg width={width} height={height} className="transform -rotate-90" aria-hidden="true">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-300 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-500`}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${fontSize} font-bold text-gray-900 dark:text-white`}>
          {score}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'At-risk';
  return 'Dormant';
}
