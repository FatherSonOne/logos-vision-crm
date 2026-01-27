import React from 'react';

interface SentimentBadgeProps {
  score: number; // -1 to +1
}

export function SentimentBadge({ score }: SentimentBadgeProps) {
  // Determine sentiment category
  let emoji = '😐';
  let label = 'Neutral';
  let color = 'bg-gray-600 text-gray-200';

  if (score >= 0.6) {
    emoji = '😊';
    label = 'Positive';
    color = 'bg-green-500/20 text-green-300 border border-green-500/30';
  } else if (score >= 0.2) {
    emoji = '🙂';
    label = 'Somewhat Positive';
    color = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  } else if (score <= -0.6) {
    emoji = '😟';
    label = 'Negative';
    color = 'bg-red-500/20 text-red-300 border border-red-500/30';
  } else if (score <= -0.2) {
    emoji = '😕';
    label = 'Somewhat Negative';
    color = 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}`}>
      <span>{emoji}</span>
      <span>{score >= 0 ? '+' : ''}{score.toFixed(2)}</span>
    </span>
  );
}
