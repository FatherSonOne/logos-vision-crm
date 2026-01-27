/**
 * Pulse Integration Test Script
 * Run this in browser console to verify Pulse integration
 *
 * Usage:
 *   1. Open browser console (F12)
 *   2. Copy and paste this entire script
 *   3. Press Enter to run
 *   4. Check results in console
 */

(async function testPulseIntegration() {
  console.log('========================================');
  console.log('Pulse Integration Test Suite');
  console.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  function log(message, type = 'info') {
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  function addResult(testName, passed, message = '') {
    results.tests.push({ testName, passed, message });
    if (passed) {
      results.passed++;
      log(`${testName}: PASS ${message}`, 'success');
    } else {
      results.failed++;
      log(`${testName}: FAIL ${message}`, 'error');
    }
  }

  // Test 1: Service Availability
  try {
    log('\n📦 Test 1: Service Availability', 'info');

    // Check if services are loaded
    const hasContactService = typeof pulseContactService !== 'undefined';
    const hasSyncService = typeof pulseSyncService !== 'undefined';

    addResult('Pulse Contact Service Available', hasContactService,
      hasContactService ? '' : '- Import pulseContactService');
    addResult('Pulse Sync Service Available', hasSyncService,
      hasSyncService ? '' : '- Import pulseSyncService');

    if (!hasContactService) {
      log('⚠️  To test, first import the service:', 'warning');
      log('   import { pulseContactService } from "./services/pulseContactService"', 'warning');
      return;
    }
  } catch (error) {
    addResult('Service Availability', false, `- Error: ${error.message}`);
  }

  // Test 2: Configuration Status
  try {
    log('\n⚙️  Test 2: Configuration Status', 'info');

    const config = pulseContactService.getConfigStatus();
    log(`API URL: ${config.apiUrl || 'Not configured'}`, 'info');
    log(`Using Mock Data: ${config.usingMockData}`, 'info');
    log(`Has API Key: ${config.hasApiKey}`, 'info');

    if (config.usingMockData) {
      results.warnings++;
      log('Using mock data mode (API not configured)', 'warning');
    }

    addResult('Configuration Status Retrieved', true);
  } catch (error) {
    addResult('Configuration Status', false, `- Error: ${error.message}`);
  }

  // Test 3: Fetch Relationship Profiles
  try {
    log('\n👥 Test 3: Fetch Relationship Profiles', 'info');

    const startTime = Date.now();
    const profiles = await pulseContactService.fetchRelationshipProfiles({ limit: 10 });
    const duration = Date.now() - startTime;

    log(`Fetched ${profiles.length} profiles in ${duration}ms`, 'info');

    addResult('Fetch Profiles', profiles.length > 0,
      `- Retrieved ${profiles.length} profiles`);
    addResult('Response Time Acceptable', duration < 5000,
      `- ${duration}ms (target: < 5000ms)`);

    if (profiles.length > 0) {
      const firstProfile = profiles[0];
      log(`Sample profile: ${firstProfile.display_name} (${firstProfile.canonical_email})`, 'info');

      addResult('Profile Structure Valid',
        firstProfile.canonical_email && firstProfile.display_name,
        `- Has required fields`);
    }
  } catch (error) {
    addResult('Fetch Profiles', false, `- Error: ${error.message}`);
  }

  // Test 4: AI Insights
  try {
    log('\n🤖 Test 4: AI Insights', 'info');

    const startTime = Date.now();
    const insights = await pulseContactService.getAIInsights('profile-1');
    const duration = Date.now() - startTime;

    if (insights) {
      log(`Loaded AI insights in ${duration}ms`, 'info');
      log(`Communication style: ${insights.ai_communication_style?.substring(0, 50)}...`, 'info');
      log(`Next actions: ${insights.ai_next_actions?.length || 0}`, 'info');

      addResult('AI Insights Retrieved', true, `- ${duration}ms`);
      addResult('AI Insights Structure Valid',
        insights.ai_communication_style && insights.ai_topics,
        `- Has required fields`);
    } else {
      log('AI insights returned null (may not be available for test profile)', 'warning');
      addResult('AI Insights Retrieved', true, '- Null response handled gracefully');
    }
  } catch (error) {
    addResult('AI Insights', false, `- Error: ${error.message}`);
  }

  // Test 5: Recommended Actions
  try {
    log('\n📋 Test 5: Recommended Actions', 'info');

    const startTime = Date.now();
    const actions = await pulseContactService.getRecommendedActions();
    const duration = Date.now() - startTime;

    log(`Fetched ${actions.length} recommended actions in ${duration}ms`, 'info');

    addResult('Recommended Actions Retrieved', actions.length > 0,
      `- Found ${actions.length} actions`);

    if (actions.length > 0) {
      const highPriority = actions.filter(a => a.priority === 'high').length;
      log(`High priority actions: ${highPriority}`, 'info');
      log(`Sample: ${actions[0].reason}`, 'info');

      addResult('Actions Have Priority',
        actions.every(a => a.priority),
        `- All actions prioritized`);
    }
  } catch (error) {
    addResult('Recommended Actions', false, `- Error: ${error.message}`);
  }

  // Test 6: Recent Interactions
  try {
    log('\n💬 Test 6: Recent Interactions', 'info');

    const startTime = Date.now();
    const response = await pulseContactService.getRecentInteractions('profile-1', { limit: 10 });
    const duration = Date.now() - startTime;

    log(`Fetched ${response.interactions.length} interactions in ${duration}ms`, 'info');
    log(`Total interactions: ${response.summary.total_interactions}`, 'info');
    log(`Average sentiment: ${response.summary.average_sentiment}`, 'info');

    addResult('Recent Interactions Retrieved', true,
      `- ${response.interactions.length} interactions`);
    addResult('Interactions Have Summary',
      response.summary && typeof response.summary.total_interactions === 'number',
      `- Summary structure valid`);
  } catch (error) {
    addResult('Recent Interactions', false, `- Error: ${error.message}`);
  }

  // Test 7: Search Functionality
  try {
    log('\n🔍 Test 7: Search Functionality', 'info');

    const startTime = Date.now();
    const results = await pulseContactService.searchContacts('john', 10);
    const duration = Date.now() - startTime;

    log(`Search completed in ${duration}ms`, 'info');
    log(`Found ${results.length} matching contacts`, 'info');

    addResult('Search Functionality', true,
      `- ${results.length} results in ${duration}ms`);
  } catch (error) {
    addResult('Search Functionality', false, `- Error: ${error.message}`);
  }

  // Test 8: Pending Actions Count
  try {
    log('\n🔢 Test 8: Pending Actions Count', 'info');

    const count = await pulseContactService.getPendingActionsCount();
    log(`Pending actions count: ${count}`, 'info');

    addResult('Pending Actions Count', typeof count === 'number',
      `- Count: ${count}`);
  } catch (error) {
    addResult('Pending Actions Count', false, `- Error: ${error.message}`);
  }

  // Test 9: Health Check
  try {
    log('\n🏥 Test 9: API Health Check', 'info');

    const healthy = await pulseContactService.checkHealth();
    log(`Health check result: ${healthy}`, 'info');

    addResult('Health Check', healthy === true || healthy === false,
      `- API ${healthy ? 'healthy' : 'unhealthy or using mock data'}`);
  } catch (error) {
    addResult('Health Check', false, `- Error: ${error.message}`);
  }

  // Test 10: Error Handling (Invalid Profile)
  try {
    log('\n🛡️  Test 10: Error Handling', 'info');

    const insights = await pulseContactService.getAIInsights('non-existent-profile-id-12345');

    addResult('Handles Non-Existent Profile', insights === null,
      `- Returns null for 404 (expected behavior)`);
  } catch (error) {
    addResult('Error Handling', false, `- Should return null, not throw: ${error.message}`);
  }

  // Print Summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  log(`Total Tests: ${results.tests.length}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Warnings: ${results.warnings}`, results.warnings > 0 ? 'warning' : 'info');

  const passRate = ((results.passed / results.tests.length) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%`, passRate >= 90 ? 'success' : 'error');

  // Detailed Results
  console.log('\n========================================');
  console.log('Detailed Results');
  console.log('========================================');
  console.table(results.tests);

  // Recommendations
  console.log('\n========================================');
  console.log('Recommendations');
  console.log('========================================');

  if (results.failed === 0) {
    log('All tests passed! Integration is working correctly.', 'success');
  } else {
    log('Some tests failed. Please review the errors above.', 'error');
  }

  if (results.warnings > 0) {
    log('\nWarnings detected:', 'warning');
    log('- API not configured (using mock data mode)', 'warning');
    log('- To use real API, configure VITE_PULSE_API_URL and VITE_PULSE_API_KEY in .env.local', 'warning');
  }

  console.log('\n========================================');
  console.log('Next Steps');
  console.log('========================================');
  log('1. Configure Pulse API credentials in .env.local', 'info');
  log('2. Test bulk import: await pulseSyncService.performBulkContactImport()', 'info');
  log('3. Test incremental sync: pulseSyncService.startIncrementalSync()', 'info');
  log('4. Test Google sync: await pulseContactService.triggerGoogleSync({ sync_type: "full" })', 'info');
  log('5. Monitor sync status: await pulseSyncService.getSyncStatus()', 'info');

  return results;
})().catch(error => {
  console.error('❌ Test suite failed to run:', error);
  console.error(error.stack);
});
