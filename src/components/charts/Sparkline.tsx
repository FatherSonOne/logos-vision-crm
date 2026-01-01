import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  strokeWidth?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  color = '#06b6d4', 
  strokeWidth = 2,
  height = 40 
}) => {
  // Transform data into format recharts expects
  const chartData = data.map((value, index) => ({ value, index }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', height, minWidth: 50, minHeight: Math.max(height, 20) }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={50} minHeight={20}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
