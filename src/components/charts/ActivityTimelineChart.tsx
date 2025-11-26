import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ActivityTimelineChartProps {
  data: {
    date: string;
    calls: number;
    emails: number;
    meetings: number;
  }[];
  height?: number;
}

export const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e1' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Line 
          type="monotone" 
          dataKey="calls" 
          name="Calls"
          stroke="#06b6d4" 
          strokeWidth={2}
          dot={{ fill: '#06b6d4', r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Line 
          type="monotone" 
          dataKey="emails" 
          name="Emails"
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Line 
          type="monotone" 
          dataKey="meetings" 
          name="Meetings"
          stroke="#6366f1" 
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
