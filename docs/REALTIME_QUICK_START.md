# Real-Time Dashboard Quick Start

Quick reference guide for implementing real-time updates in your components.

## Installation

No additional dependencies required - uses existing Supabase configuration.

## Quick Usage

### 1. Basic Real-Time Report

```typescript
import { useRealtimeReport } from '../hooks/useRealtimeReport';

function MyComponent() {
  const { data, isConnected, lastUpdate } = useRealtimeReport('donations');

  return (
    <div>
      {isConnected && <span className="status-dot connected" />}
      <div>Records: {data.length}</div>
      {lastUpdate && <small>Updated: {lastUpdate.toLocaleTimeString()}</small>}
    </div>
  );
}
```

### 2. Real-Time KPI Card

```typescript
import { useRealtimeKPI } from '../hooks/useRealtimeKPI';

function KPICard({ kpiId }) {
  const { kpi, hasValueChanged, alerts } = useRealtimeKPI(kpiId, {
    enableAlerts: true
  });

  return (
    <div className={hasValueChanged ? 'flash-animation' : ''}>
      <h3>{kpi?.name}</h3>
      <div className="value">
        {kpi?.prefix}{kpi?.currentValue}{kpi?.suffix}
      </div>
      {alerts.length > 0 && (
        <div className="alerts">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert ${alert.type}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Real-Time Dashboard

```typescript
import { RealtimeDashboard } from '../components/reports/RealtimeDashboard';

function DashboardPage() {
  return (
    <RealtimeDashboard
      dashboard={myDashboard}
      widgets={myWidgets}
      onWidgetClick={(widget) => console.log(widget)}
    />
  );
}
```

## Hook Options

### useRealtimeReport Options

```typescript
{
  enabled: true,                    // Enable/disable real-time
  initialData: [],                  // Initial data
  debounceMs: 200,                  // Debounce delay
  autoReconnect: true,              // Auto-reconnect on disconnect
  maxReconnectAttempts: 5,          // Max reconnection attempts
  onConnectionChange: (status) => {}, // Connection status callback
  onDataUpdate: (data) => {},       // Data update callback
  onError: (error) => {}            // Error callback
}
```

### useRealtimeKPI Options

```typescript
{
  enabled: true,                    // Enable/disable real-time
  recalculateIntervalMs: 5000,     // Recalculation interval
  enableAlerts: true,               // Enable threshold alerts
  onValueChange: (kpi, prev) => {}, // Value change callback
  onThresholdBreach: (alert) => {}, // Threshold breach callback
  onConnectionChange: (status) => {}, // Connection status callback
  onError: (error) => {}            // Error callback
}
```

### useRealtimeDashboard Options

```typescript
{
  dashboardId: 'dash-1',            // Dashboard ID (required)
  widgets: [],                      // Widgets array (required)
  enabled: true,                    // Enable/disable real-time
  refreshInterval: 30000,           // Refresh interval (5s, 30s, 1m, 5m)
  autoRefresh: true,                // Enable auto-refresh
  batchUpdateDelayMs: 300,          // Batch update delay
  optimisticUpdates: true,          // Enable optimistic updates
  onWidgetUpdate: (id, data) => {}, // Widget update callback
  onConnectionChange: (status) => {}, // Connection status callback
  onError: (error) => {}            // Error callback
}
```

## Connection Status Indicators

### Simple Indicator

```tsx
{isConnected && (
  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
)}
```

### Full Status

```tsx
<div className={`status ${connectionStatus}`}>
  {connectionStatus === 'connected' && <CheckIcon className="text-green-500" />}
  {connectionStatus === 'connecting' && <ClockIcon className="text-yellow-500" />}
  {connectionStatus === 'disconnected' && <XIcon className="text-gray-500" />}
  {connectionStatus === 'error' && <AlertIcon className="text-red-500" />}
  <span>{connectionStatus}</span>
</div>
```

## Value Change Animations

### CSS Animation

```css
@keyframes flash {
  0%, 100% {
    transform: scale(1);
    color: inherit;
  }
  50% {
    transform: scale(1.1);
    color: #4f46e5;
  }
}

.flash-animation {
  animation: flash 0.5s ease-in-out;
}
```

### React Animation

```tsx
<div className={hasValueChanged ? 'scale-110 text-indigo-600' : ''}>
  {value}
</div>
```

## Service Configuration

```typescript
import { realtimeService } from '../services/realtimeService';

// Configure globally (optional)
realtimeService.configure({
  maxRetries: 5,
  retryDelayMs: 1000,
  connectionTimeout: 10000,
  enableConnectionPooling: true
});

// Listen to connection state
const unsub = realtimeService.onConnectionStateChange((state) => {
  console.log('Connection:', state);
});

// Get connection health
const health = realtimeService.getConnectionHealth();
// { totalChannels: 3, connectedChannels: 3, errorChannels: 0, overallState: 'connected' }

// Manual reconnection
realtimeService.reconnectAll();
```

## Common Patterns

### Pattern 1: Show loading during initial connection

```typescript
const { data, connectionStatus } = useRealtimeReport('table');

if (connectionStatus === 'connecting') {
  return <LoadingSpinner />;
}

return <DataTable data={data} />;
```

### Pattern 2: Retry on error

```typescript
const { error, reconnect } = useRealtimeReport('table', {
  onError: (err) => {
    toast.error(err.message);
  }
});

{error && (
  <button onClick={reconnect}>Retry Connection</button>
)}
```

### Pattern 3: Manual refresh button

```typescript
const { refresh } = useRealtimeReport('table');
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = async () => {
  setIsRefreshing(true);
  await refresh();
  setTimeout(() => setIsRefreshing(false), 500);
};

<button onClick={handleRefresh} disabled={isRefreshing}>
  {isRefreshing ? 'Refreshing...' : 'Refresh'}
</button>
```

### Pattern 4: Conditional real-time updates

```typescript
const [enableRealtime, setEnableRealtime] = useState(true);

const { data } = useRealtimeReport('table', {
  enabled: enableRealtime
});

<button onClick={() => setEnableRealtime(!enableRealtime)}>
  {enableRealtime ? 'Pause' : 'Resume'} Updates
</button>
```

## Troubleshooting

### Issue: Not receiving updates

1. Check table has Realtime enabled in Supabase
2. Verify network connection
3. Check browser console for errors
4. Ensure subscription hasn't been unsubscribed

### Issue: Too many updates

1. Increase debounce delay
2. Reduce refresh interval
3. Consider batch updates for dashboards

### Issue: Connection keeps dropping

1. Check network stability
2. Increase max retries
3. Check Supabase status
4. Review connection pooling settings

## Performance Tips

1. **Use debouncing** for frequently updated tables (debounceMs: 300-1000)
2. **Enable connection pooling** when multiple components use same table
3. **Set appropriate intervals** - don't use 5s if 1m is sufficient
4. **Batch dashboard updates** with batchUpdateDelayMs: 300-500
5. **Clean up subscriptions** - hooks handle this automatically
6. **Use optimistic updates** for better UX

## CSS Utilities

```css
/* Connection status dots */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.connected {
  background-color: #10b981;
  animation: pulse 2s infinite;
}

.status-dot.disconnected {
  background-color: #6b7280;
}

.status-dot.error {
  background-color: #ef4444;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Value change flash */
.value-flash {
  transition: all 0.3s ease-in-out;
}

.value-flash.changed {
  transform: scale(1.1);
  color: #4f46e5;
}
```

## Complete Example

```typescript
import { useRealtimeKPI } from '../hooks/useRealtimeKPI';
import { toast } from 'react-hot-toast';

function EnhancedKPICard({ kpiId }) {
  const {
    kpi,
    isLoading,
    isConnected,
    connectionStatus,
    hasValueChanged,
    alerts,
    refresh,
    clearAlerts
  } = useRealtimeKPI(kpiId, {
    enabled: true,
    recalculateIntervalMs: 10000, // Every 10 seconds
    enableAlerts: true,
    onValueChange: (kpi, prevValue) => {
      toast.success(`${kpi.name} updated to ${kpi.currentValue}`);
    },
    onThresholdBreach: (alert) => {
      toast.error(alert.message, { duration: 5000 });
    },
    onConnectionChange: (status) => {
      if (status === 'error') {
        toast.error('Connection lost - attempting to reconnect...');
      } else if (status === 'connected') {
        toast.success('Connected to live updates');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="kpi-card loading">
        <div className="spinner" />
        <p>Loading KPI...</p>
      </div>
    );
  }

  if (!kpi) {
    return <div className="kpi-card error">KPI not found</div>;
  }

  return (
    <div className={`kpi-card ${hasValueChanged ? 'flash-animation' : ''}`}>
      {/* Connection indicator */}
      <div className="absolute top-2 right-2">
        <div className={`status-dot ${connectionStatus}`} />
      </div>

      {/* KPI content */}
      <h3 className="kpi-title">{kpi.name}</h3>

      <div className="kpi-value">
        {kpi.prefix}{kpi.currentValue}{kpi.suffix}
      </div>

      {/* Trend */}
      {kpi.trendPercentage !== null && (
        <div className={`trend ${kpi.trendDirection}`}>
          {kpi.trendPercentage > 0 ? '↑' : '↓'}
          {Math.abs(kpi.trendPercentage).toFixed(1)}%
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts">
          {alerts.slice(-2).map(alert => (
            <div key={alert.id} className={`alert ${alert.type}`}>
              {alert.message}
            </div>
          ))}
          <button onClick={clearAlerts} className="text-xs">
            Clear Alerts
          </button>
        </div>
      )}

      {/* Manual refresh */}
      <button onClick={refresh} className="refresh-btn">
        Refresh Now
      </button>
    </div>
  );
}
```

## Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Full Implementation Guide](./REALTIME_DASHBOARD_IMPLEMENTATION.md)
- [Report Service Documentation](./REPORTS_REDESIGN_PLAN.md)

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase Realtime status
3. Test with manual refresh
4. Check network tab in DevTools
