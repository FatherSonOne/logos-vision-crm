# Export Services Test Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Suite Entry Point                    │
│                          (npm test)                              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Jest Configuration                        │
│                        (jest.config.ts)                          │
│  • Test environment: jsdom                                       │
│  • Coverage thresholds: 80%+                                     │
│  • Setup file: src/__tests__/setup.ts                           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Global Test Setup                         │
│                   (src/__tests__/setup.ts)                       │
│  • Mock HTML Canvas                                              │
│  • Mock DOM APIs                                                 │
│  • Setup test environment                                        │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌──────────────────────┐   ┌──────────────────────┐
        │   Test Utilities      │   │   Test Suites        │
        │   (testUtils.ts)      │   │   (*.test.ts)        │
        └──────────────────────┘   └──────────────────────┘
                    │                           │
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │    Service Implementations   │
                    │    (Stub/Real)              │
                    └─────────────────────────────┘
```

## Test File Structure

```
src/__tests__/services/export/
│
├── testUtils.ts                    ← Shared utilities for all tests
│   ├── Mock Data Generators
│   │   ├── generateMockContacts()
│   │   └── generateMockChartData()
│   │
│   ├── DOM Helpers
│   │   ├── createMockChartElement()
│   │   └── cleanupMockChartElement()
│   │
│   ├── Performance Tools
│   │   ├── measureExecutionTime()
│   │   └── PerformanceBenchmark class
│   │
│   ├── Mock Objects
│   │   ├── MockJsPDF
│   │   ├── mockXLSX
│   │   └── mockHtml2Canvas
│   │
│   └── Validation Helpers
│       └── validateCsvFormat()
│
├── PdfExportService.test.ts       ← PDF export tests (40+ tests)
│   ├── Basic PDF Generation (5)
│   ├── Chart Integration (7)
│   ├── Page Orientation/Size (6)
│   ├── Multi-Page PDFs (3)
│   ├── Headers/Footers (3)
│   ├── Filter Summary (2)
│   ├── Error Handling (4)
│   ├── Performance Tests (4)
│   └── Advanced Features (6)
│
├── ExcelExportService.test.ts     ← Excel export tests (42+ tests)
│   ├── Basic Excel Generation (4)
│   ├── Multi-Sheet Workbook (5)
│   ├── Cell Styling (5)
│   ├── Formula Generation (5)
│   ├── Data Formatting (5)
│   ├── Summary Statistics (4)
│   ├── Error Handling (4)
│   ├── Performance Tests (5)
│   └── Advanced Features (5)
│
├── ImageExportService.test.ts     ← Image export tests (40+ tests)
│   ├── PNG Export (7)
│   ├── JPEG Export (5)
│   ├── WebP Export (4)
│   ├── Social Media Presets (5)
│   ├── Batch Export (3)
│   ├── Error Handling (6)
│   ├── Performance Tests (5)
│   └── Advanced Features (5)
│
├── CsvExportService.test.ts       ← CSV export tests (47+ tests)
│   ├── Basic CSV Generation (5)
│   ├── Delimiter Options (4)
│   ├── Special Characters (6)
│   ├── Null/Undefined (4)
│   ├── Date Formatting (4)
│   ├── Number Formatting (5)
│   ├── Column Selection (3)
│   ├── Performance Tests (5)
│   ├── Error Handling (4)
│   ├── BOM/Encoding (2)
│   └── Advanced Features (5)
│
└── ExportRouter.test.ts            ← Router tests (41+ tests)
    ├── Service Registration (5)
    ├── Format-Based Routing (6)
    ├── Auto Format Selection (5)
    ├── Complexity Routing (3)
    ├── Validation (6)
    ├── Strategy Pattern (3)
    ├── Performance Optimization (3)
    ├── Error Handling (4)
    ├── Config Merging (2)
    └── Hooks/Middleware (4)
```

## Service Implementation Structure

```
src/services/export/
│
├── types.ts                        ← TypeScript type definitions
│   ├── ExportFormat type
│   ├── ExportConfig interface
│   ├── ExportStrategy interface
│   └── ExportService interface
│
├── PdfExportService.ts             ← PDF export implementation
│   └── export(config) → void
│
├── ExcelExportService.ts           ← Excel export implementation
│   └── export(config) → void
│
├── ImageExportService.ts           ← Image export implementation
│   └── export(config) → void
│
├── CsvExportService.ts             ← CSV export implementation
│   └── export(config) → string
│
└── ExportRouter.ts                 ← Router/Strategy implementation
    ├── registerService()
    ├── selectOptimalFormat()
    ├── export()
    ├── exportMultiple()
    ├── exportBatch()
    └── addHook()
```

## Test Execution Flow

```
1. User runs: npm run test:export
                    │
                    ▼
2. Jest loads configuration (jest.config.ts)
                    │
                    ▼
3. Jest runs global setup (src/__tests__/setup.ts)
   • Mocks Canvas API
   • Mocks URL.createObjectURL
   • Suppresses console errors
                    │
                    ▼
4. Jest discovers test files (*.test.ts)
                    │
                    ▼
5. For each test file:
   ├── Import testUtils (shared utilities)
   ├── Import mocked dependencies (jsPDF, XLSX, etc.)
   ├── Import service under test
   │
   └── Run test suites:
       ├── beforeEach: Setup test fixtures
       ├── Run test: Execute and assert
       └── afterEach: Cleanup
                    │
                    ▼
6. Collect coverage data
                    │
                    ▼
7. Generate coverage report
   • Terminal summary
   • HTML report (coverage/lcov-report/index.html)
                    │
                    ▼
8. Exit with status code (0 = pass, 1 = fail)
```

## Mock Strategy Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                          Test Code                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ imports
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    Service Under Test                          │
│                  (e.g., PdfExportService)                      │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    Mocked Dependencies                          │
├────────────────────────────────────────────────────────────────┤
│  jsPDF                 →  MockJsPDF (testUtils.ts)             │
│  html2canvas          →  mockHtml2Canvas (testUtils.ts)        │
│  XLSX                 →  mockXLSX (testUtils.ts)               │
│  file-saver           →  jest.mock('file-saver')               │
│  HTMLCanvasElement    →  Global mock (setup.ts)                │
│  window.URL           →  Global mock (setup.ts)                │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ returns
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      Mock Responses                             │
│  • Controlled data for assertions                              │
│  • Predictable behavior                                        │
│  • Fast execution (no real I/O)                                │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow in Tests

```
┌──────────────────┐
│  Test Case       │
│  Starts          │
└──────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Generate Mock Data                          │
│  • generateMockContacts(100)                 │
│  • generateMockChartData(10)                 │
│  • createMockChartElement()                  │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Create Export Config                        │
│  {                                           │
│    data: mockData,                           │
│    filename: 'test',                         │
│    format: 'pdf',                            │
│    // ... options                            │
│  }                                           │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Call Service Method                         │
│  await service.export(config)                │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Service Calls Mocked Dependencies           │
│  • jsPDF.addPage()                           │
│  • html2canvas(element)                      │
│  • XLSX.write(workbook)                      │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Assert Expected Behavior                    │
│  • expect(mock).toHaveBeenCalled()           │
│  • expect(result).toBe(expected)             │
│  • expect(duration).toBeLessThan(5000)       │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Test Case       │
│  Complete        │
└──────────────────┘
```

## Coverage Collection Flow

```
┌────────────────────────────────────────────────────────────┐
│  Source Code                                               │
│  src/services/export/PdfExportService.ts                   │
└────────────────────────────────────────────────────────────┘
                          │
                          │ instrumented by Jest
                          ▼
┌────────────────────────────────────────────────────────────┐
│  Instrumented Code (tracks execution)                      │
│  • Line coverage                                           │
│  • Branch coverage                                         │
│  • Function coverage                                       │
│  • Statement coverage                                      │
└────────────────────────────────────────────────────────────┘
                          │
                          │ executed during tests
                          ▼
┌────────────────────────────────────────────────────────────┐
│  Coverage Data Collection                                  │
│  • Which lines executed?                                   │
│  • Which branches taken?                                   │
│  • Which functions called?                                 │
└────────────────────────────────────────────────────────────┘
                          │
                          │ post-processing
                          ▼
┌────────────────────────────────────────────────────────────┐
│  Coverage Reports                                          │
│  ├── Terminal Summary (table format)                       │
│  ├── LCOV Report (coverage/lcov.info)                      │
│  └── HTML Report (coverage/lcov-report/index.html)         │
└────────────────────────────────────────────────────────────┘
                          │
                          │ checked against
                          ▼
┌────────────────────────────────────────────────────────────┐
│  Coverage Thresholds (jest.config.ts)                      │
│  • Lines: 80%                                              │
│  • Branches: 80%                                           │
│  • Functions: 80%                                          │
│  • Statements: 80%                                         │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
           ✅ Pass            ❌ Fail
         Exit 0            Exit 1
```

## Performance Test Architecture

```
┌────────────────────────────────────────────────────────────┐
│  PerformanceBenchmark Class                                │
│  (testUtils.ts)                                            │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│  measure(name, fn)                                         │
│  ├── Start timer: performance.now()                        │
│  ├── Execute function: await fn()                          │
│  ├── End timer: performance.now()                          │
│  └── Store duration                                        │
└────────────────────────────────────────────────────────────┘
                          │
                          │ called multiple times
                          ▼
┌────────────────────────────────────────────────────────────┐
│  Measurements Storage                                      │
│  Map<string, number[]>                                     │
│  {                                                         │
│    "pdf-1000-rows": [4821, 4793, 4856],                   │
│    "excel-5000-rows": [9234, 9187, 9301],                 │
│    ...                                                     │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
                          │
                          │ after all tests
                          ▼
┌────────────────────────────────────────────────────────────┐
│  getStats(name)                                            │
│  ├── Calculate: min, max, avg, median                      │
│  └── Return statistics object                              │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│  Performance Assertions                                    │
│  • expect(duration).toBeLessThan(threshold)                │
│  • expect(variance).toBeLessThan(50%)                      │
└────────────────────────────────────────────────────────────┘
```

## Integration Test Flow

```
┌────────────────────────────────────────────────────────────┐
│  Multi-Format Export Test                                  │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│  ExportRouter.exportMultiple({                             │
│    data: contacts,                                         │
│    filename: 'report',                                     │
│    formats: ['csv', 'excel', 'pdf']                        │
│  })                                                        │
└────────────────────────────────────────────────────────────┘
                          │
                          ├──────────┬──────────┐
                          ▼          ▼          ▼
                   ┌──────────┐ ┌──────────┐ ┌──────────┐
                   │   CSV    │ │  Excel   │ │   PDF    │
                   │ Service  │ │ Service  │ │ Service  │
                   └──────────┘ └──────────┘ └──────────┘
                          │          │          │
                          └──────────┴──────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────┐
│  Verify All Exports Completed                              │
│  • CSV exported                                            │
│  • Excel exported                                          │
│  • PDF exported                                            │
└────────────────────────────────────────────────────────────┘
```

## Test Naming Convention

```
Service Test File: [ServiceName].test.ts
├── describe('[ServiceName]', () => {
│   ├── describe('Feature Category', () => {
│   │   ├── it('should [expected behavior]', async () => {
│   │   │   // Arrange
│   │   │   // Act
│   │   │   // Assert
│   │   │   })
│   │   │   })
│   │   └── ...
│   │   })
│   └── ...
│   })

Example:
PdfExportService.test.ts
├── describe('PdfExportService', () => {
│   ├── describe('Basic PDF Generation', () => {
│   │   ├── it('should generate PDF with default configuration', ...)
│   │   ├── it('should generate PDF with custom filename', ...)
│   │   └── it('should handle empty dataset gracefully', ...)
│   │   })
│   └── ...
│   })
```

## Summary

This test architecture provides:

- **Modular Design**: Shared utilities, independent test files
- **Comprehensive Coverage**: 210+ tests across all services
- **Performance Focus**: Dedicated benchmarking tools
- **Mock Strategy**: Consistent mocking across all tests
- **Clear Flow**: From test execution to coverage reporting
- **Maintainability**: Well-organized, documented structure

The architecture supports both unit testing (individual methods) and integration testing (service interactions), with consistent patterns across all test files.
