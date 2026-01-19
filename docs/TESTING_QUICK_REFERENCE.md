# Export Services Testing - Quick Reference

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Run all export service tests
npm run test:export

# Run with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:export:watch
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:export` | Run export service tests only |
| `npm run test:watch` | Watch mode for all tests |
| `npm run test:export:watch` | Watch mode for export tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:verbose` | Run tests with verbose output |

## Running Individual Test Files

```bash
# PDF Export Tests
npm test -- PdfExportService.test.ts

# Excel Export Tests
npm test -- ExcelExportService.test.ts

# Image Export Tests
npm test -- ImageExportService.test.ts

# CSV Export Tests
npm test -- CsvExportService.test.ts

# Router Tests
npm test -- ExportRouter.test.ts
```

## Running Specific Test Suites

```bash
# Run only "Basic PDF Generation" tests
npm test -- PdfExportService.test.ts -t "Basic PDF Generation"

# Run only performance tests
npm test -- -t "Performance Tests"

# Run only error handling tests
npm test -- -t "Error Handling"
```

## Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage

# View coverage report
# Open: coverage/lcov-report/index.html
```

## Test File Structure

```
src/__tests__/services/export/
├── testUtils.ts               # Shared utilities
├── PdfExportService.test.ts   # 40+ tests
├── ExcelExportService.test.ts # 42+ tests
├── ImageExportService.test.ts # 40+ tests
├── CsvExportService.test.ts   # 47+ tests
└── ExportRouter.test.ts       # 41+ tests
```

## Performance Benchmarks

| Test | Dataset | Expected Time |
|------|---------|---------------|
| PDF Export | 1,000 rows | <5s |
| PDF Export | 5,000 rows | <15s |
| Excel Export | 1,000 rows | <3s |
| Excel Export | 5,000 rows | <10s |
| Image Export | Standard | <1s |
| Image Export | High Res | <2s |
| CSV Export | 1,000 rows | <1s |
| CSV Export | 10,000 rows | <5s |

## Common Test Patterns

### Testing Export Success
```typescript
it('should export data successfully', async () => {
  const data = generateMockContacts(10);
  const config: ExportConfig = {
    data,
    filename: 'test',
    format: 'csv',
  };

  await service.export(config);

  expect(mockService.export).toHaveBeenCalled();
});
```

### Testing Error Handling
```typescript
it('should handle errors gracefully', async () => {
  const config: ExportConfig = {
    data: null,
    filename: 'test',
    format: 'csv',
  };

  await expect(service.export(config)).rejects.toThrow();
});
```

### Testing Performance
```typescript
it('should complete within time limit', async () => {
  const data = generateMockContacts(1000);
  const { duration } = await measureExecutionTime(() =>
    service.export(config)
  );

  expect(duration).toBeLessThan(5000);
});
```

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- PdfExportService.test.ts -t "should generate PDF"
```

### Check Test Coverage for Specific File
```bash
npm test -- --coverage --collectCoverageFrom="src/services/export/PdfExportService.ts"
```

## Coverage Targets

- Lines: 80%+
- Branches: 80%+
- Functions: 80%+
- Statements: 80%+

## Test Categories

### Unit Tests
- Individual method testing
- Input/output validation
- Error handling

### Integration Tests
- Multi-service workflows
- Format conversion chains
- Batch processing

### Performance Tests
- Large dataset handling
- Memory efficiency
- Concurrent operations

### Edge Case Tests
- Empty data
- Null/undefined values
- Special characters
- Invalid inputs

## Troubleshooting

### Tests Failing?
1. Check Node version (18+ required)
2. Clear jest cache: `npx jest --clearCache`
3. Reinstall dependencies: `npm install`
4. Check for TypeScript errors: `npx tsc --noEmit`

### Coverage Not Updating?
1. Delete coverage folder
2. Run: `npm run test:coverage -- --no-cache`

### Tests Timing Out?
1. Increase timeout in jest.config.ts
2. Check for infinite loops
3. Ensure async operations complete

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm test

- name: Check Coverage
  run: npm run test:coverage
```

### Pre-commit Hook
```bash
# In .husky/pre-commit
npm test
```

## Next Steps

1. Run tests: `npm run test:export`
2. Check coverage: `npm run test:coverage`
3. Review results in coverage/lcov-report/index.html
4. Add new tests as features are added

## Support

- Full documentation: `docs/EXPORT_SERVICES_TESTING.md`
- Test utilities: `src/__tests__/services/export/testUtils.ts`
- Jest config: `jest.config.ts`
