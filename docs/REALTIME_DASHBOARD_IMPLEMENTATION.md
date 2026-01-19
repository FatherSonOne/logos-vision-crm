# Real-Time Dashboard Implementation

Complete implementation of Supabase Realtime for live dashboard updates with connection management, retry logic, and performance optimization.

## Overview

The real-time dashboard system provides live data refreshes for reports, KPIs, and dashboard widgets using Supabase Realtime subscriptions. The implementation includes robust error handling, automatic reconnection, connection pooling, and optimistic updates for better UX.

## Architecture

### Components

1. **realtimeService** - Centralized service for managing Supabase Realtime subscriptions
2. **useRealtimeReport** - Hook for report-level real-time subscriptions
3. **useRealtimeKPI** - Hook for KPI value updates and alerts
4. **useRealtimeDashboard** - Hook for multi-widget dashboard subscriptions
5. **RealtimeDashboard** - Component with real-time updates and connection indicators
6. **KPIMonitoring** - Enhanced component with live KPI updates

### Key Features

- Connection status tracking (connected, connecting, disconnected, error)
- Automatic reconnection with exponential backoff
- Connection pooling for efficient resource usage
- Debounced updates to avoid flickering
- Optimistic updates for better UX
- Manual refresh triggers
- Configurable refresh intervals (5s, 30s, 1m, 5m)
- Threshold breach alerts
- Visual animations on value changes

## File Structure

```
src/
├── hooks/
│   ├── useRealtimeReport.ts      # Report-level real-time hook
│   ├── useRealtimeKPI.ts          # KPI real-time hook with alerts
│   └── useRealtimeDashboard.ts    # Dashboard-wide real-time hook
├── components/
│   └── reports/
│       ├── RealtimeDashboard.tsx  # Dashboard with real-time updates
│       └── KPIMonitoring.tsx      # Enhanced with real-time KPI cards
└── services/
    └── realtimeService.ts         # Enhanced with pooling & retry logic
```

## Usage Examples

### 1. useRealtimeReport Hook

Subscribe to real-time changes on a report's data source table.

```typescript
import { useRealtimeReport } from '../hooks/useRealtimeReport';

function MyReportComponent() {
  const {
    data,
    isConnected,
    connectionStatus,
    lastUpdate,
    error,
    refresh,
    setData
  } = useRealtimeReport('donations', 'report-123', {
    enabled: true,
    debounceMs: 300,
    autoReconnect: true,
    maxReconnectAttempts: 5,
    onConnectionChange: (status) => {
      console.log('Connection status:', status);
    },
    onDataUpdate: (newData) => {
      console.log('Data updated:', newData);
    }
  });

  return (
    <div>
      <div>Status: {connectionStatus}</div>
      <div>Records: {data.length}</div>
      {lastUpdate && <div>Last update: {lastUpdate.toLocaleTimeString()}</div>}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### 2. useRealtimeKPI Hook

Subscribe to KPI value changes with automatic recalculation and alerts.

```typescript
import { useRealtimeKPI } from '../hooks/useRealtimeKPI';

function KPICard({ kpiId }: { kpiId: string }) {
  const {
    kpi,
    isLoading,
    isConnected,
    hasValueChanged,
    alerts,
    refresh,
    clearAlerts
  } = useRealtimeKPI(kpiId, {
    enabled: true,
    recalculateIntervalMs: 5000, // Recalculate every 5 seconds
    enableAlerts: true,
    onValueChange: (kpi, prevValue) => {
      console.log(`KPI changed from ${prevValue} to ${kpi.currentValue}`);
    },
    onThresholdBreach: (alert) => {
      // Show notification
      console.warn('Threshold breach:', alert);
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (!kpi) return <div>KPI not found</div>;

  return (
    <div className={hasValueChanged ? 'animate-pulse' : ''}>
      <div className="flex items-center gap-2">
        {isConnected && <div className="w-2 h-2 bg-green-500 rounded-full" />}
        <h3>{kpi.name}</h3>
      </div>
      <div className="text-2xl font-bold">
        {kpi.prefix}{kpi.currentValue}{kpi.suffix}
      </div>
      {alerts.length > 0 && (
        <div className="mt-2">
          {alerts.map(alert => (
            <div key={alert.id} className="text-sm text-red-600">
              {alert.message}
            </div>
          ))}
          <button onClick={clearAlerts}>Clear Alerts</button>
        </div>
      )}
    </div>
  );
}
```

### 3. useRealtimeDashboard Hook

Subscribe to multiple widgets on a dashboard with batch updates.

```typescript
import { useRealtimeDashboard } from '../hooks/useRealtimeDashboard';

function DashboardComponent({ dashboard, widgets }) {
  const {
    widgets: widgetDataMap,
    isConnected,
    connectionStatus,
    lastUpdate,
    refreshInterval,
    autoRefresh,
    updateCount,
    refresh,
    setRefreshInterval,
    toggleAutoRefresh
  } = useRealtimeDashboard({
    dashboardId: dashboard.id,
    widgets,
    enabled: true,
    refreshInterval: 30000, // 30 seconds
    autoRefresh: true,
    batchUpdateDelayMs: 300, // Batch updates over 300ms
    optimisticUpdates: true,
    onWidgetUpdate: (widgetId, data) => {
      console.log(`Widget ${widgetId} updated:`, data);
    }
  });

  return (
    <div>
      <div className="dashboard-header">
        <div>Status: {connectionStatus}</div>
        <div>Updates: {updateCount}</div>
        <button onClick={toggleAutoRefresh}>
          {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
        </button>
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
        >
          <option value={5000}>5s</option>
          <option value={30000}>30s</option>
          <option value={60000}>1m</option>
          <option value={300000}>5m</option>
        </select>
        <button onClick={refresh}>Refresh Now</button>
      </div>

      <div className="widgets-grid">
        {widgets.map(widget => {
          const widgetData = widgetDataMap.get(widget.id);
          return (
            <div key={widget.id}>
              {widgetData?.isLoading ? (
                <div>Loading...</div>
              ) : widgetData?.data ? (
                <div>{/* Render widget data */}</div>
              ) : (
                <div>No data</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 4. RealtimeDashboard Component

Full-featured dashboard component with real-time updates.

```typescript
import { RealtimeDashboard } from '../components/reports/RealtimeDashboard';

function MyDashboardPage() {
  const dashboard = {
    id: 'dash-1',
    name: 'Sales Dashboard',
    description: 'Real-time sales metrics',
    columnCount: 3,
    refreshIntervalSeconds: 30,
    autoRefresh: true,
    // ... other dashboard properties
  };

  const widgets = [
    {
      id: 'widget-1',
      dashboardId: 'dash-1',
      widgetType: 'kpi',
      title: 'Total Revenue',
      gridWidth: 1,
      gridHeight: 1,
      config: { kpiId: 'kpi-revenue' },
      // ... other widget properties
    },
    // ... more widgets
  ];

  return (
    <RealtimeDashboard
      dashboard={dashboard}
      widgets={widgets}
      onWidgetClick={(widget) => {
        console.log('Widget clicked:', widget);
      }}
    />
  );
}
```

## Enhanced realtimeService

The realtimeService has been enhanced with:

### Connection Pooling

Multiple subscriptions to the same table share a single channel, reducing resource usage.

```typescript
// Both subscriptions will share the same channel
const unsub1 = realtimeService.subscribe('donations', callback1);
const unsub2 = realtimeService.subscribe('donations', callback2);
```

### Retry Logic with Exponential Backoff

Automatic reconnection with increasing delays:
- 1st retry: 1 second
- 2nd retry: 2 seconds
- 3rd retry: 4 seconds
- 4th retry: 8 seconds
- 5th retry: 16 seconds

```typescript
// Configure retry behavior
realtimeService.configure({
  maxRetries: 5,
  retryDelayMs: 1000,
  connectionTimeout: 10000,
  enableConnectionPooling: true
});
```

### Connection State Monitoring

```typescript
// Listen to global connection state changes
const unsubscribe = realtimeService.onConnectionStateChange((state) => {
  console.log('Connection state:', state);
  // state: 'connected' | 'connecting' | 'disconnected' | 'error'
});

// Get connection health
const health = realtimeService.getConnectionHealth();
console.log(health);
// {
//   totalChannels: 5,
//   connectedChannels: 4,
//   errorChannels: 1,
//   overallState: 'error'
// }

// Get state for specific channel
const state = realtimeService.getChannelState('donations');
```

### Manual Reconnection

```typescript
// Reconnect a specific channel
realtimeService.reconnectChannel('donations');

// Reconnect all channels
realtimeService.reconnectAll();
```

## Performance Optimization

### Debouncing Rapid Updates

The `useRealtimeReport` hook debounces rapid updates to avoid flickering:

```typescript
const { data } = useRealtimeReport('donations', 'report-1', {
  debounceMs: 300 // Wait 300ms before applying updates
});
```

### Batch Updates

The `useRealtimeDashboard` hook batches multiple widget updates:

```typescript
const dashboard = useRealtimeDashboard({
  dashboardId: 'dash-1',
  widgets,
  batchUpdateDelayMs: 300 // Batch updates over 300ms window
});
```

### Optimistic Updates

Enable optimistic updates for better perceived performance:

```typescript
const dashboard = useRealtimeDashboard({
  dashboardId: 'dash-1',
  widgets,
  optimisticUpdates: true
});
```

## Visual Feedback

### Connection Indicators

All real-time components include visual connection indicators:

- Green pulsing dot: Connected
- Yellow dot: Connecting
- Gray dot: Disconnected
- Red dot: Error

### Value Change Animations

KPI cards show animations when values change:

```css
/* Flash effect on value change */
.kpi-value.changed {
  animation: flash 0.5s ease-in-out;
}

@keyframes flash {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); color: #4f46e5; }
}
```

### Progress Bar Animations

Target progress bars animate smoothly:

```css
.progress-bar {
  transition: width 0.5s ease-in-out;
}
```

## Error Handling

All real-time hooks include comprehensive error handling:

```typescript
const {
  data,
  error,
  connectionStatus
} = useRealtimeReport('donations', 'report-1', {
  onError: (error) => {
    // Log error
    console.error('Real-time error:', error);

    // Show notification
    toast.error(`Connection error: ${error.message}`);

    // Track in analytics
    analytics.track('realtime_error', { error: error.message });
  }
});

// Display error in UI
{error && (
  <div className="error-message">
    Connection error: {error.message}
  </div>
)}
```

## Testing

### Manual Testing

1. Open dashboard with real-time updates enabled
2. Verify green connection indicator appears
3. Make changes to data source (e.g., add a donation)
4. Confirm dashboard updates within debounce period
5. Disconnect network
6. Verify reconnection attempts with exponential backoff
7. Reconnect network
8. Verify successful reconnection and data sync

### Simulating Network Issues

```typescript
// Disable real-time temporarily
realtimeService.unsubscribeAll();

// Re-enable after delay
setTimeout(() => {
  // Subscriptions will automatically reconnect
}, 5000);
```

## Best Practices

1. **Use debouncing** for tables with frequent updates
2. **Enable connection pooling** when multiple components subscribe to the same table
3. **Set appropriate refresh intervals** based on data freshness requirements
4. **Monitor connection health** and display status to users
5. **Handle errors gracefully** with user-friendly messages
6. **Clean up subscriptions** on component unmount
7. **Use batch updates** for dashboards with many widgets
8. **Implement optimistic updates** for better UX

## Configuration

### Environment Variables

No additional environment variables required - uses existing Supabase configuration.

### Service Configuration

```typescript
// Configure real-time service globally
realtimeService.configure({
  maxRetries: 5,              // Maximum reconnection attempts
  retryDelayMs: 1000,         // Initial retry delay
  connectionTimeout: 10000,   // Connection timeout
  enableConnectionPooling: true // Share channels across subscriptions
});
```

## Troubleshooting

### Issue: Subscriptions not working

**Solution:** Check Supabase Realtime is enabled for tables:

```sql
-- Enable real-time for table
ALTER TABLE donations REPLICA IDENTITY FULL;
```

### Issue: Too many reconnection attempts

**Solution:** Increase max retries or check network stability:

```typescript
realtimeService.configure({
  maxRetries: 10,
  retryDelayMs: 2000
});
```

### Issue: Dashboard updates too frequent

**Solution:** Increase debounce delay:

```typescript
const { data } = useRealtimeReport('table', 'id', {
  debounceMs: 1000 // Increase to 1 second
});
```

## Next Steps

1. Add WebSocket health monitoring
2. Implement offline queue for missed updates
3. Add real-time collaboration features
4. Create real-time notification system
5. Add metrics dashboard for connection health

## Summary

The real-time dashboard implementation provides:

- Live data updates without manual refresh
- Robust connection management with automatic retry
- Performance optimization through debouncing and batching
- Visual feedback for connection status and data changes
- Comprehensive error handling and recovery
- Flexible configuration for different use cases

All components are production-ready with proper error handling, cleanup, and performance optimization.
