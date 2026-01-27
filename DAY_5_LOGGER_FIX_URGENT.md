# URGENT: Logger import.meta.env Test Compatibility Fix

**Issue Discovered**: 2026-01-26 during Day 5 Pulse API Integration Testing
**Severity**: 🔴 **CRITICAL - BLOCKING PRODUCTION**
**Impact**: All tests that import ContactsPage or ContactStoryView fail after cache invalidation

---

## Problem Description

The `src/utils/logger.ts` utility uses `import.meta.env` which Jest cannot parse:

```typescript
// src/utils/logger.ts:20
const isDevelopment = import.meta.env.DEV;  // ❌ Not compatible with Jest
const debugEnabled = import.meta.env.VITE_DEBUG_LOGGING === 'true';
```

### Error Message

```
SyntaxError: Cannot use 'import.meta' outside a module
  at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1318:40)
  at Object.<anonymous> (src/utils/logger.ts:13)
```

### Tests Affected

- ❌ `PulseApiIntegration.test.tsx` (21 tests)
- ❌ `ContactsPage.test.tsx` (multiple tests)
- ❌ `ContactStoryView.test.tsx` (multiple tests)
- ❌ `PrioritiesFeedView.test.tsx` (multiple tests)
- ✅ Tests without logger imports still pass

### Current Behavior

- ✅ Tests pass when Jest cache is valid
- ❌ Tests fail on fresh test runs (`jest --clearCache`)
- ❌ Tests fail in CI/CD environments
- ❌ Tests fail for new developers

---

## Root Cause Analysis

1. **Logger** was added to ContactsPage.tsx and ContactStoryView.tsx
2. **import.meta** is a Vite-specific feature not supported by Jest
3. **Polyfill** in `src/__tests__/setup.ts` doesn't work correctly:
   ```typescript
   // Current polyfill (doesn't work)
   (global as any).import = { meta: { env: {...} } };
   ```

4. **Jest transform** doesn't convert import.meta to compatible code

---

## Solution Options

### Option 1: Mock Logger in Tests (RECOMMENDED - Quick Fix)

**File**: Add to `src/__tests__/setup.ts`

```typescript
// Mock the logger module to avoid import.meta issues
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn((...args) => console.error('[ERROR]', ...args)),
    warn: jest.fn((...args) => console.warn('[WARN]', ...args)),
    info: jest.fn((...args) => console.log('[INFO]', ...args)),
    debug: jest.fn((...args) => console.log('[DEBUG]', ...args)),
  }
}));
```

**Pros**:
- ✅ Immediate fix, no code changes needed
- ✅ Tests pass reliably
- ✅ Can verify logger calls in tests
- ✅ No production code impact

**Cons**:
- ⚠️ Logger behavior not tested
- ⚠️ Mock must be maintained

**Effort**: 5 minutes

---

### Option 2: Refactor Logger to be Test-Compatible (BEST - Long-term)

**File**: `src/utils/logger.ts`

```typescript
/**
 * Production-ready logging utility for Logos Vision CRM
 * Compatible with both Vite (import.meta) and Jest (process.env)
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerConfig {
  level: LogLevel;
  enableDebug: boolean;
}

// Helper to safely access environment variables
function getEnvVariable(key: string, defaultValue: string = ''): string {
  // Try import.meta first (Vite runtime)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] ?? defaultValue;
  }

  // Fallback to process.env (Node/Jest runtime)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }

  return defaultValue;
}

function isDevelopmentMode(): boolean {
  // Try import.meta first (Vite runtime)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true;
  }

  // Fallback to process.env (Node/Jest runtime)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV !== 'production';
  }

  // Default to production mode if neither available
  return false;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    const isDevelopment = isDevelopmentMode();
    const debugEnabled = getEnvVariable('VITE_DEBUG_LOGGING') === 'true';

    this.config = {
      level: isDevelopment ? 'debug' : 'error',
      enableDebug: debugEnabled
    };
  }

  /**
   * Log error messages (always enabled in all environments)
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Log warning messages (enabled in development or when debug is on)
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log informational messages (enabled in development or when debug is on)
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log debug messages (only enabled when explicitly turned on)
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.enableDebug || this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex <= currentLevelIndex;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel };
```

**Pros**:
- ✅ Works in both Vite and Jest environments
- ✅ No mocking needed
- ✅ Logger behavior fully testable
- ✅ Future-proof solution

**Cons**:
- ⚠️ Requires code change and testing
- ⚠️ Slightly more complex logic

**Effort**: 15-20 minutes

---

### Option 3: Configure Jest to Handle import.meta (COMPLEX)

**File**: `jest.config.ts`

Add custom transformer or babel plugin to convert import.meta.

**Pros**:
- ✅ No code changes needed

**Cons**:
- ❌ Complex configuration
- ❌ May break other things
- ❌ Harder to maintain
- ❌ Not recommended

**Effort**: 1-2 hours + testing

---

## Recommended Implementation Plan

### Phase 1: Immediate Hotfix (Now)

1. **Add logger mock to setup.ts** (Option 1)
2. Run all tests to verify they pass
3. Commit and push

### Phase 2: Proper Fix (Next Sprint)

1. **Refactor logger.ts** (Option 2)
2. Add unit tests for logger utility
3. Verify all integration tests still pass
4. Update documentation

---

## Implementation: Option 1 (Quick Fix)

### Step 1: Update Test Setup

**File**: `src/__tests__/setup.ts`

Add this at the end of the file:

```typescript
// Mock logger to avoid import.meta compatibility issues in Jest
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn((...args) => console.error('[MOCKED ERROR]', ...args)),
    warn: jest.fn((...args) => console.warn('[MOCKED WARN]', ...args)),
    info: jest.fn((...args) => console.log('[MOCKED INFO]', ...args)),
    debug: jest.fn((...args) => console.log('[MOCKED DEBUG]', ...args)),
  }
}));
```

### Step 2: Verify Fix

```bash
# Clear cache and run tests
npx jest --clearCache
npm test -- PulseApiIntegration

# Expected output:
# PASS src/components/contacts/__tests__/PulseApiIntegration.test.tsx
#   ✓ All 21 tests passing
```

### Step 3: Run Full Test Suite

```bash
npm test -- contacts/__tests__

# Expected output:
# PASS src/components/contacts/__tests__/*.test.tsx
#   ✓ All 382 tests passing
```

---

## Implementation: Option 2 (Proper Fix)

### Step 1: Replace logger.ts

Replace the entire contents of `src/utils/logger.ts` with the code from Option 2 above.

### Step 2: Add Logger Tests

**File**: `src/utils/__tests__/logger.test.ts` (new file)

```typescript
import { logger } from '../logger';

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log error messages in all environments', () => {
    logger.error('Test error', { detail: 'info' });
    expect(console.error).toHaveBeenCalledWith(
      '[ERROR] Test error',
      { detail: 'info' }
    );
  });

  it('should log warn messages in development', () => {
    logger.warn('Test warning');
    // Assertion depends on environment
    expect(console.warn).toHaveBeenCalled();
  });

  it('should work in test environment', () => {
    // Should not throw errors
    expect(() => {
      logger.error('Error');
      logger.warn('Warn');
      logger.info('Info');
      logger.debug('Debug');
    }).not.toThrow();
  });
});
```

### Step 3: Test in Both Environments

```bash
# Test in Jest environment
npm test -- logger

# Test in Vite environment
npm run dev
# Open browser console and verify logger works
```

---

## Verification Checklist

After implementing the fix:

- [ ] Run `npx jest --clearCache` to clear cache
- [ ] Run `npm test -- PulseApiIntegration` → All 21 tests pass
- [ ] Run `npm test -- contacts/__tests__` → All 382 tests pass
- [ ] Run `npm run dev` → Logger works in browser console
- [ ] Verify console logs show correct format: `[ERROR]`, `[WARN]`, etc.
- [ ] Check no console errors on app startup
- [ ] Verify tests pass in CI/CD (if applicable)

---

## Success Criteria

✅ **Fix is successful when**:
1. All Pulse API Integration tests pass (21/21)
2. All Contacts component tests pass (382/382)
3. Tests pass after cache clear
4. Logger works in production (browser)
5. Logger works in tests (Jest)
6. No regression in other test suites

---

## Timeline

- **Option 1 (Mock)**: 5-10 minutes
- **Option 2 (Refactor)**: 20-30 minutes + testing
- **Testing & Verification**: 10-15 minutes

**Total Time to Resolution**: 30-45 minutes (Option 1) or 1 hour (Option 2)

---

## Risk Assessment

**Current Risk**: 🔴 **HIGH**
- Tests are unreliable
- CI/CD may fail
- New developers will encounter issues
- Production deployment blocked

**After Fix**: 🟢 **LOW**
- Tests reliable and reproducible
- CI/CD stable
- Smooth developer onboarding
- Production deployment unblocked

---

## Stakeholder Communication

**Message to Team**:

> **URGENT: Test infrastructure issue discovered during Day 5 integration testing**
>
> **Issue**: Logger utility breaks Jest tests due to import.meta compatibility
> **Impact**: Pulse API integration tests fail on clean cache
> **Resolution**: Implementing logger mock (5 min fix) or refactor (30 min fix)
> **Timeline**: Fix deployed within 1 hour
> **Status**: All functionality working, only test infrastructure affected
>
> No action needed from team. Tests will be stable after fix is merged.

---

## Post-Fix Actions

1. [ ] Update `DAY_5_PULSE_API_INTEGRATION_TEST_REPORT.md` with fix status
2. [ ] Document logger testing patterns for future reference
3. [ ] Add "import.meta compatibility" to code review checklist
4. [ ] Consider adding pre-commit hook to detect import.meta in new files

---

**Priority**: 🔴 **CRITICAL - FIX IMMEDIATELY**
**Assigned To**: Current session developer
**Due Date**: End of Day 5 Morning Session
**Estimated Time**: 30-60 minutes

---

**Document Version**: 1.0
**Created**: 2026-01-26
**Last Updated**: 2026-01-26
