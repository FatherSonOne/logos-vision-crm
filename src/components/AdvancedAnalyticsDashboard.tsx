import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, prefix = '', suffix = '' }) => {
  const isPositive = change >= 0;
  const { ui } = useStore();
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl p-6 ${
        isDark ? 'bg-gray-800/50' : 'bg-white'
      } backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 opacity-5`}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl"
            style={{
              backgroundColor: `${color}20`,
            }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
          </div>
        </div>

        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {title}
        </h3>
        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </p>
      </div>
    </motion.div>
  );
};

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const { ui, quickStats } = useStore();
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Sample data for charts - in a real app, this would come from your API
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: 'Apr', revenue: 61000, expenses: 38000, profit: 23000 },
    { month: 'May', revenue: 55000, expenses: 36000, profit: 19000 },
    { month: 'Jun', revenue: 67000, expenses: 40000, profit: 27000 },
  ];

  const projectStatusData = [
    { name: 'Planning', value: 12, color: '#3B82F6' },
    { name: 'In Progress', value: 28, color: '#8B5CF6' },
    { name: 'Completed', value: 45, color: '#10B981' },
    { name: 'On Hold', value: 8, color: '#F59E0B' },
  ];

  const teamPerformanceData = [
    { member: 'Sarah', projects: 12, tasks: 45, satisfaction: 92 },
    { member: 'John', projects: 15, tasks: 52, satisfaction: 88 },
    { member: 'Emma', projects: 10, tasks: 38, satisfaction: 95 },
    { member: 'Michael', projects: 14, tasks: 48, satisfaction: 90 },
    { member: 'Lisa', projects: 11, tasks: 42, satisfaction: 87 },
  ];

  const skillsData = [
    { skill: 'Leadership', value: 85 },
    { skill: 'Technical', value: 92 },
    { skill: 'Communication', value: 88 },
    { skill: 'Strategy', value: 78 },
    { skill: 'Innovation', value: 90 },
  ];

  const activityData = [
    { day: 'Mon', calls: 24, meetings: 8, emails: 56 },
    { day: 'Tue', calls: 28, meetings: 12, emails: 62 },
    { day: 'Wed', calls: 32, meetings: 10, emails: 58 },
    { day: 'Thu', calls: 26, meetings: 14, emails: 64 },
    { day: 'Fri', calls: 30, meetings: 9, emails: 52 },
  ];

  const chartColors = {
    primary: isDark ? '#60A5FA' : '#3B82F6',
    secondary: isDark ? '#A78BFA' : '#8B5CF6',
    success: isDark ? '#34D399' : '#10B981',
    warning: isDark ? '#FBBF24' : '#F59E0B',
    text: isDark ? '#E5E7EB' : '#374151',
    grid: isDark ? '#374151' : '#E5E7EB',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Advanced Analytics
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive insights and performance metrics
        </p>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="328,500"
          change={12.5}
          icon={<DollarSign className="w-6 h-6" />}
          color="#10B981"
          prefix="$"
        />
        <StatCard
          title="Active Clients"
          value={quickStats.totalClients || 156}
          change={8.2}
          icon={<Users className="w-6 h-6" />}
          color="#3B82F6"
        />
        <StatCard
          title="Active Projects"
          value={quickStats.activeProjects || 45}
          change={-2.4}
          icon={<Briefcase className="w-6 h-6" />}
          color="#8B5CF6"
        />
        <StatCard
          title="Completion Rate"
          value="94.2"
          change={5.7}
          icon={<CheckCircle className="w-6 h-6" />}
          color="#F59E0B"
          suffix="%"
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 ${
          isDark ? 'bg-gray-800/50' : 'bg-white'
        } backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Revenue & Profit Trends
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
            <XAxis dataKey="month" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#E5E7EB',
                borderRadius: '8px',
                color: isDark ? '#FFFFFF' : '#000000',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={chartColors.primary}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke={chartColors.success}
              fillOpacity={1}
              fill="url(#profitGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 ${
            isDark ? 'bg-gray-800/50' : 'bg-white'
          } backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
        >
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Project Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: '8px',
                  color: isDark ? '#FFFFFF' : '#000000',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Team Skills Radar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 ${
            isDark ? 'bg-gray-800/50' : 'bg-white'
          } backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
        >
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Team Skills Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis dataKey="skill" stroke={chartColors.text} />
              <PolarRadiusAxis stroke={chartColors.text} />
              <Radar
                name="Skills"
                dataKey="value"
                stroke={chartColors.secondary}
                fill={chartColors.secondary}
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: '8px',
                  color: isDark ? '#FFFFFF' : '#000000',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-6 ${
          isDark ? 'bg-gray-800/50' : 'bg-white'
        } backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Weekly Activity Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.2} />
            <XAxis dataKey="day" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? '#374151' : '#E5E7EB',
                borderRadius: '8px',
                color: isDark ? '#FFFFFF' : '#000000',
              }}
            />
            <Legend />
            <Bar dataKey="calls" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
            <Bar dataKey="meetings" fill={chartColors.secondary} radius={[8, 8, 0, 0]} />
            <Bar dataKey="emails" fill={chartColors.success} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Team Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 ${
          isDark ? 'bg-gray-800/50' : 'bg-white'
        } backdrop-blur-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}
      >
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Team Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Team Member
                </th>
                <th className={`text-center py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Projects
                </th>
                <th className={`text-center py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tasks
                </th>
                <th className={`text-center py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Satisfaction
                </th>
              </tr>
            </thead>
            <tbody>
              {teamPerformanceData.map((member, index) => (
                <motion.tr
                  key={member.member}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className={`border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'} hover:${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  } transition-colors`}
                >
                  <td className={`py-4 px-4 ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {member.member}
                  </td>
                  <td className="text-center py-4 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {member.projects}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {member.tasks}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${member.satisfaction}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {member.satisfaction}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
