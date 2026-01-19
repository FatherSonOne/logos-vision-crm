import React, { useState, useEffect } from 'react';
import AIInsightsPanelEnhanced from '../AIInsightsPanelEnhanced';
import { TimeSeriesDataPoint, MetricData } from '../../../services/aiInsightsService';

/**
 * Demo component showing how to use the enhanced AI Insights Panel
 * with forecasting, anomaly detection, and correlation analysis
 */
export const AIInsightsDemo: React.FC = () => {
  const [sampleData, setSampleData] = useState<TimeSeriesDataPoint[]>([]);
  const [sampleMetrics, setSampleMetrics] = useState<MetricData[]>([]);

  useEffect(() => {
    // Generate sample time series data (donations over time)
    const generateSampleData = () => {
      const data: TimeSeriesDataPoint[] = [];
      const startDate = new Date('2024-01-01');
      const baseline = 50000;
      const trend = 500; // Upward trend
      const seasonality = 10000; // Seasonal variation

      for (let i = 0; i < 180; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Simulate trend + seasonality + noise
        const seasonalEffect = seasonality * Math.sin((i / 30) * Math.PI);
        const noise = (Math.random() - 0.5) * 5000;
        let value = baseline + (trend * i) + seasonalEffect + noise;

        // Add occasional anomalies
        if (i === 45 || i === 120) {
          value *= 1.8; // Spike
        } else if (i === 90) {
          value *= 0.4; // Drop
        }

        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0, value),
          label: `Day ${i + 1}`,
        });
      }

      return data;
    };

    // Generate sample metrics for correlation analysis
    const generateSampleMetrics = () => {
      const dates = sampleData.map(d => d.date);

      const metrics: MetricData[] = [
        {
          name: 'Total Donations',
          data: sampleData,
        },
        {
          name: 'Active Donors',
          data: dates.map((date, i) => ({
            date,
            value: 100 + (i * 2) + (Math.random() - 0.5) * 20 + (sampleData[i].value / 1000),
          })),
        },
        {
          name: 'Email Open Rate',
          data: dates.map((date, i) => ({
            date,
            value: 35 + (Math.random() - 0.5) * 10 + (sampleData[i].value / 5000),
          })),
        },
        {
          name: 'Volunteer Hours',
          data: dates.map((date, i) => ({
            date,
            value: 200 + (i * 3) + (Math.random() - 0.5) * 50,
          })),
        },
      ];

      return metrics;
    };

    const data = generateSampleData();
    setSampleData(data);
    setSampleMetrics(generateSampleMetrics());
  }, []);

  const handleRefresh = () => {
    console.log('Refreshing AI insights...');
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Insights Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced analytics with forecasting, anomaly detection, and correlation analysis
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Demo Data Information
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Generated 180 days of sample donation data</li>
            <li>• Includes upward trend, seasonal patterns, and 3 deliberate anomalies</li>
            <li>• 4 correlated metrics: Donations, Active Donors, Email Open Rate, Volunteer Hours</li>
            <li>• Click the tabs to explore different AI analysis features</li>
          </ul>
        </div>

        <AIInsightsPanelEnhanced
          data={sampleData}
          metrics={sampleMetrics}
          insights={[
            {
              id: '1',
              insightType: 'trend',
              insightTitle: 'Strong Donation Growth',
              insightText: 'Donations have increased by 45% over the last 6 months, with recurring donations showing the strongest growth at 58%.',
              importance: 'high',
              confidenceScore: 0.92,
              relatedMetrics: ['Total Donations', 'Recurring Donations'],
              suggestedAction: 'Focus on converting one-time donors to recurring donors through targeted campaigns.',
              generatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              insightType: 'correlation',
              insightTitle: 'Email Engagement Drives Donations',
              insightText: 'Email open rates show a strong positive correlation (0.85) with donation amounts, suggesting email campaigns are highly effective.',
              importance: 'high',
              confidenceScore: 0.88,
              relatedMetrics: ['Email Open Rate', 'Total Donations'],
              suggestedAction: 'Increase email campaign frequency and A/B test subject lines to improve open rates.',
              generatedAt: new Date().toISOString(),
            },
          ]}
          onRefresh={handleRefresh}
        />

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Integration Guide
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                1. Import the Component
              </h4>
              <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`import AIInsightsPanelEnhanced from './components/reports/AIInsightsPanelEnhanced';
import { TimeSeriesDataPoint, MetricData } from './services/aiInsightsService';`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                2. Prepare Your Data
              </h4>
              <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`const donationData: TimeSeriesDataPoint[] = [
  { date: '2024-01-01', value: 50000 },
  { date: '2024-01-02', value: 52000 },
  // ... more data points
];

const metrics: MetricData[] = [
  { name: 'Donations', data: donationData },
  { name: 'Active Donors', data: activeDonorData },
  // ... more metrics
];`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                3. Use the Component
              </h4>
              <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`<AIInsightsPanelEnhanced
  data={donationData}
  metrics={metrics}
  insights={existingInsights}
  onRefresh={handleRefresh}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                4. Features Available
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Forecasting:</strong> 3-month predictions with 80% and 95% confidence intervals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Anomaly Detection:</strong> Statistical outliers with AI explanations and suggested actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Correlation Analysis:</strong> Find relationships between metrics with business implications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span><strong>Auto-refresh:</strong> Insights regenerate automatically when data changes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDemo;
