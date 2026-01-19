# AI Insights Service Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      AIInsightsPanelEnhanced (Main Component)          │    │
│  │                                                          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Summary  │ │ Forecast │ │Anomalies │ │Correlation│ │    │
│  │  │   Tab    │ │   Tab    │ │   Tab    │ │   Tab    │  │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │    │
│  │       │            │            │            │          │    │
│  └───────┼────────────┼────────────┼────────────┼──────────┘    │
│          │            │            │            │                │
│          ▼            ▼            ▼            ▼                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│  │  Insight    │ │  Forecast   │ │  Anomaly    │ │Correlation│ │
│  │   Cards     │ │   Chart     │ │  Detection  │ │  Matrix   │ │
│  │             │ │             │ │   Panel     │ │           │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
│                                                                   │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    │ Data & Events
                                    │
┌───────────────────────────────────▼───────────────────────────────┐
│                        Service Layer                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           aiInsightsService.ts                            │   │
│  │                                                            │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │   │
│  │  │ generateForecast │  │ detectAnomalies  │  │  find    │ │   │
│  │  │                  │  │                  │  │Correlations│ │   │
│  │  │ • Linear Reg    │  │ • Z-Score Calc  │  │ • Pearson  │ │   │
│  │  │ • Seasonality   │  │ • Outlier Det   │  │ • Strength │ │   │
│  │  │ • Confidence    │  │ • Severity      │  │ • Direction│ │   │
│  │  │ • AI Analysis   │  │ • AI Context    │  │ • AI Impl  │ │   │
│  │  └────────┬─────────┘  └────────┬─────────┘  └─────┬────┘ │   │
│  │           │                     │                   │      │   │
│  └───────────┼─────────────────────┼───────────────────┼──────┘   │
│              │                     │                   │          │
│              └─────────┬───────────┴───────────────────┘          │
│                        │                                          │
│                        ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              statistics.ts (Utilities)                    │   │
│  │                                                            │   │
│  │  • calculatePearsonCorrelation  • detectTrend            │   │
│  │  • calculateZScore              • detectSeasonality      │   │
│  │  • calculateMean/StdDev         • calculateRegression    │   │
│  │  • detectOutliers               • calculateConfidence    │   │
│  │  • calculateMovingAverage       • calculateEMA           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────┬───────────────────────────────┘
                                     │
                                     │ API Calls
                                     │
┌────────────────────────────────────▼───────────────────────────────┐
│                     External Services Layer                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Google Gemini API                            │   │
│  │                                                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  Forecast    │  │  Anomaly     │  │ Correlation  │   │   │
│  │  │  Analysis    │  │  Explanation │  │ Implication  │   │   │
│  │  │              │  │              │  │              │   │   │
│  │  │ • Business   │  │ • Root Cause │  │ • Business   │   │   │
│  │  │   Context    │  │ • Actions    │  │   Impact     │   │   │
│  │  │ • Insights   │  │ • Context    │  │ • Viz Type   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Forecasting Flow

```
User Input (Historical Data)
        │
        ▼
┌───────────────────┐
│ Validate Data     │
│ (min 3 points)    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Statistical       │
│ Analysis          │
│                   │
│ • Detect Trend    │
│ • Detect Season   │
│ • Linear Reg      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Generate          │
│ Predictions       │
│                   │
│ • Future Values   │
│ • Confidence      │
│ • Seasonal Adj    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ AI Analysis       │
│ (Gemini API)      │
│                   │
│ • Business Context│
│ • Insights        │
│ • Recommendations │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ ForecastResult    │
│                   │
│ • Predictions []  │
│ • Trend           │
│ • Seasonality     │
│ • AI Analysis     │
└───────────────────┘
```

### Anomaly Detection Flow

```
User Input (Time Series Data)
        │
        ▼
┌───────────────────┐
│ Calculate Stats   │
│                   │
│ • Mean            │
│ • Std Deviation   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Detect Outliers   │
│                   │
│ • Z-Score > 3σ    │
│ • Classify        │
│   Severity        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ For Each Anomaly  │
│                   │
│ • Calculate       │
│   Deviation       │
│ • Determine       │
│   Severity        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ AI Context        │
│ (Gemini API)      │
│                   │
│ • Explanation     │
│ • Root Cause      │
│ • Actions         │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ AnomalyResult     │
│                   │
│ • Anomalies []    │
│ • Rate %          │
│ • Methodology     │
└───────────────────┘
```

### Correlation Analysis Flow

```
User Input (Multiple Metrics)
        │
        ▼
┌───────────────────┐
│ Align Data        │
│ by Date           │
│                   │
│ • Match Dates     │
│ • Extract Values  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Calculate         │
│ Correlations      │
│                   │
│ • Pearson r       │
│ • For All Pairs   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Filter & Classify │
│                   │
│ • |r| >= 0.7      │
│ • Strength        │
│ • Direction       │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ AI Analysis       │
│ (Gemini API)      │
│                   │
│ • Business Impact │
│ • Implications    │
│ • Viz Suggestion  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ CorrelationResult │
│                   │
│ • Pairs []        │
│ • Significant #   │
│ • Methodology     │
└───────────────────┘
```

## Component Hierarchy

```
AIInsightsPanelEnhanced
│
├── Tab Navigation
│   ├── Summary Tab
│   ├── Forecast Tab
│   ├── Anomalies Tab
│   └── Correlations Tab
│
├── Summary Tab Content
│   └── InsightCard (multiple)
│       ├── Type Badge
│       ├── Title
│       ├── Description
│       ├── Suggested Action
│       └── Dismiss Button
│
├── Forecast Tab Content
│   └── ForecastChart
│       ├── Chart Header
│       │   ├── Trend Indicator
│       │   ├── Seasonality Badge
│       │   └── Accuracy Badge
│       ├── Line Chart (Recharts)
│       │   ├── Historical Line
│       │   ├── Forecast Line
│       │   ├── 80% Confidence Area
│       │   ├── 95% Confidence Area
│       │   └── Separator Line
│       ├── Custom Tooltip
│       └── Insights Panel
│           ├── Methodology
│           └── AI Analysis
│
├── Anomalies Tab Content
│   └── AnomalyDetectionPanel
│       ├── Stats Dashboard
│       │   ├── Total Anomalies
│       │   ├── Critical Count
│       │   └── Methodology
│       ├── Scatter Chart (optional)
│       │   ├── Data Points
│       │   ├── Expected Line
│       │   └── Severity Colors
│       └── Anomaly List
│           └── AnomalyCard (multiple)
│               ├── Severity Badge
│               ├── Date & Value
│               ├── Deviation Stats
│               ├── Explanation
│               ├── Suggested Actions
│               └── Dismiss Button
│
└── Correlations Tab Content
    └── CorrelationMatrix
        ├── Stats Dashboard
        │   ├── Pairs Analyzed
        │   ├── Significant Count
        │   └── Methodology
        ├── Heatmap Matrix
        │   ├── Row Headers
        │   ├── Column Headers
        │   └── Correlation Cells
        │       ├── Color-coded
        │       ├── Coefficient Value
        │       └── Click Handler
        └── Correlation List
            └── CorrelationCard (multiple)
                ├── Strength Badge
                ├── Direction Badge
                ├── Metric Names
                ├── Coefficient
                ├── Business Implication
                └── Visualize Button
```

## State Management

```
AIInsightsPanelEnhanced State:
│
├── activeTab: TabType
│   └── Controls which tab is visible
│
├── isLoading: boolean
│   └── Shows loading indicator
│
├── error: string | null
│   └── Displays error messages
│
├── forecastResult: ForecastResult | null
│   └── Cached forecast analysis
│
├── anomalyResult: AnomalyDetectionResult | null
│   └── Cached anomaly detection
│
└── correlationResult: CorrelationAnalysisResult | null
    └── Cached correlation analysis

Data Flow:
1. Component receives: data, metrics, insights (props)
2. useEffect triggers analysis when data changes
3. Results stored in component state
4. Child components receive results as props
5. User interactions update local state
```

## API Integration Pattern

```
┌────────────────────────────────────────────────────────┐
│                   Application Code                      │
│                                                          │
│  const forecast = await generateForecast(data);         │
│                                                          │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              aiInsightsService.ts                       │
│                                                          │
│  1. Statistical Analysis (Local)                        │
│     • Calculate metrics                                 │
│     • Detect patterns                                   │
│     • Generate predictions                              │
│                                                          │
│  2. Prepare AI Prompt                                   │
│     • Structure data                                    │
│     • Define JSON schema                                │
│     • Set context                                       │
│                                                          │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│                 geminiService.ts                        │
│                                                          │
│  1. Get AI Instance                                     │
│     • Lazy initialization                               │
│     • Load API key                                      │
│                                                          │
│  2. Make API Call                                       │
│     • Model: gemini-2.5-flash                          │
│     • Response format: JSON                             │
│     • Schema validation                                 │
│                                                          │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              Google Gemini API                          │
│                                                          │
│  • Process prompt                                       │
│  • Generate insights                                    │
│  • Return structured JSON                               │
│                                                          │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│         Response Processing & Return                    │
│                                                          │
│  1. Parse JSON response                                 │
│  2. Merge with statistical results                      │
│  3. Return complete analysis                            │
│                                                          │
└────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Action
    │
    ▼
Try Generate Analysis
    │
    ├─ Validation Error ──────────► Show Validation Message
    │                               (e.g., "Need 3+ data points")
    │
    ├─ Statistical Error ─────────► Show Calculation Error
    │                               (e.g., "Invalid data format")
    │
    ├─ API Error ─────────────────► Show API Error + Fallback
    │                               (e.g., "AI unavailable, showing
    │                                statistical analysis only")
    │
    └─ Success ───────────────────► Show Complete Results
                                    (Statistical + AI insights)
```

## Performance Optimization Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Input Data Changes                    │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│               Debounce (1-2 seconds)                    │
│         Avoid processing every keystroke                │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│            Memoization (useMemo/useCallback)            │
│         Cache expensive calculations                    │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│           Statistical Analysis (Fast)                   │
│         O(n) or O(n²) for correlations                 │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              AI Analysis (Slow)                         │
│         Async, with loading states                      │
│         Cache responses                                 │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              Progressive Rendering                      │
│    1. Show statistical results immediately              │
│    2. Update with AI insights when ready                │
└────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Development:
├── Local Environment
│   ├── VITE_API_KEY in .env
│   ├── Direct API calls to Gemini
│   └── Client-side execution

Production (Recommended):
├── Frontend
│   ├── Statistical calculations (client-side)
│   ├── UI components
│   └── API calls to backend
│
└── Backend Proxy
    ├── Secure API key storage
    ├── Request validation
    ├── Rate limiting
    ├── Caching layer
    └── Calls to Gemini API
```

This architecture ensures:
- Separation of concerns (UI, Business Logic, API)
- Efficient data processing (statistical + AI)
- Scalable design (caching, memoization)
- Secure API key management
- Graceful degradation (statistical fallback if AI fails)
