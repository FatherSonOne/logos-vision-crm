import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MiniAreaChartProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  showAxis?: boolean;
  showTooltip?: boolean;
}

export const MiniAreaChart: React.FC<MiniAreaChartProps> = ({ 
  data, 
  color = '#06b6d4',
  height = 200,
  showAxis = true,
  showTooltip = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showAxis && (
          <>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
          </>
        )}
        {showTooltip && (
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            itemStyle={{ color: color }}
          />
        )}
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.2}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
