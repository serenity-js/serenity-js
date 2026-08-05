/**
 * Generates synthetic multi-module test data for integration testing.
 * Creates 10 modules under test-runs/42/ to exercise trend chart detail
 * panel scrolling and clipping on mobile viewports.
 */
import { resolve } from 'node:path';

import {
    addMilliseconds,
    aggregateReport,
    createModule,
    createSystemContext,
    writeModuleFile,
} from './test-data-generators';

const reportsDirectory = resolve(__dirname, 'reports', 'multi-module');
const testRunsDirectory = resolve(reportsDirectory, 'test-runs', '42');
const baseTimestamp = '2026-07-27T15:00:00.000Z';
const systemContext = createSystemContext('42');

// Module 1: playwright-web (mostly passing, some failures)
const playwrightModule = createModule({
    testRunId: '42',
    moduleId: 'playwright-web',
    startedAt: baseTimestamp,
    finishedAt: addMilliseconds(baseTimestamp, 60_000),
    testRunner: { name: 'Playwright', version: '1.50.0' },
    systemContext,
    scenes: [
        { name: 'Login should authenticate with valid credentials', category: 'Authentication', source: { path: 'playwright-web/auth.spec.ts', line: 10 }, features: ['Authentication'], duration: 1200 },
        { name: 'Login should show error for invalid credentials', category: 'Authentication', source: { path: 'playwright-web/auth.spec.ts', line: 20 }, features: ['Authentication'], duration: 800 },
        { name: 'Checkout should complete purchase successfully', category: 'E-commerce', source: { path: 'playwright-web/checkout.spec.ts', line: 15 }, features: ['E-commerce'], duration: 2500 },
        { name: 'Cart should add items correctly', category: 'E-commerce', source: { path: 'playwright-web/cart.spec.ts', line: 8 }, features: ['E-commerce'], duration: 1500 },
        { name: 'Profile should display user information', category: 'User Management', source: { path: 'playwright-web/profile.spec.ts', line: 12 }, features: ['User Management'], duration: 900 },
        { name: 'Settings should save preferences', category: 'User Management', source: { path: 'playwright-web/settings.spec.ts', line: 18 }, features: ['User Management'], duration: 1100 },
        { name: 'Payment should process credit card', category: 'E-commerce', source: { path: 'playwright-web/payment.spec.ts', line: 25 }, features: ['E-commerce'], duration: 3000, passed: false, error: { name: 'AssertionError', message: 'Expected payment status to be "completed"' } },
        { name: 'Search should return relevant results', category: 'Search', source: { path: 'playwright-web/search.spec.ts', line: 30 }, features: ['Search'], duration: 1800, passed: false, error: { name: 'AssertionError', message: 'Expected 10 results, got 8' } },
    ],
});

// Module 2: webdriverio-cucumber (mostly passing, one failure)
const webdriverioModule = createModule({
    testRunId: '42',
    moduleId: 'webdriverio-cucumber',
    startedAt: addMilliseconds(baseTimestamp, 5_000),
    finishedAt: addMilliseconds(baseTimestamp, 55_000),
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext,
    scenes: [
        { name: 'User registration should create a new account', category: 'Registration', source: { path: 'webdriverio-cucumber/registration.feature', line: 5 }, features: ['Registration'], duration: 2000 },
        { name: 'Password reset should send reset email', category: 'Account Recovery', source: { path: 'webdriverio-cucumber/recovery.feature', line: 12 }, features: ['Account Recovery'], duration: 1500 },
        { name: 'Admin dashboard should display statistics', category: 'Administration', source: { path: 'webdriverio-cucumber/admin.feature', line: 8 }, features: ['Administration'], duration: 1800 },
        { name: 'Notifications should appear for new messages', category: 'Messaging', source: { path: 'webdriverio-cucumber/notifications.feature', line: 15 }, features: ['Messaging'], duration: 1200 },
        { name: 'File upload should accept PDF documents', category: 'File Management', source: { path: 'webdriverio-cucumber/upload.feature', line: 20 }, features: ['File Management'], duration: 2200 },
        { name: 'Export should generate CSV report', category: 'Reports', source: { path: 'webdriverio-cucumber/export.feature', line: 25 }, features: ['Reports'], duration: 3500, passed: false, error: { name: 'AssertionError', message: 'CSV file was not generated' } },
    ],
});

// Module 3: rest-api (all passing)
const restApiModule = createModule({
    testRunId: '42',
    moduleId: 'rest-api',
    startedAt: addMilliseconds(baseTimestamp, 10_000),
    finishedAt: addMilliseconds(baseTimestamp, 35_000),
    testRunner: { name: 'Mocha', version: '11.0.0' },
    systemContext,
    scenes: [
        { name: 'GET /users should return user list', category: 'API Tests', source: { path: 'rest-api/users.spec.ts', line: 8 }, features: ['API'], duration: 500 },
        { name: 'POST /users should create new user', category: 'API Tests', source: { path: 'rest-api/users.spec.ts', line: 18 }, features: ['API'], duration: 700 },
        { name: 'PUT /users/:id should update user', category: 'API Tests', source: { path: 'rest-api/users.spec.ts', line: 28 }, features: ['API'], duration: 650 },
        { name: 'DELETE /users/:id should remove user', category: 'API Tests', source: { path: 'rest-api/users.spec.ts', line: 38 }, features: ['API'], duration: 600 },
    ],
});

// Module 4: cucumber-acceptance (all passing)
const cucumberModule = createModule({
    testRunId: '42',
    moduleId: 'cucumber-acceptance',
    startedAt: addMilliseconds(baseTimestamp, 12_000),
    finishedAt: addMilliseconds(baseTimestamp, 48_000),
    testRunner: { name: 'Cucumber', version: '11.0.0' },
    systemContext,
    scenes: [
        { name: 'Booking a flight should show confirmation', category: 'Bookings', source: { path: 'cucumber-acceptance/booking.feature', line: 5 }, features: ['Bookings'], duration: 3200 },
        { name: 'Cancelling a booking should refund payment', category: 'Bookings', source: { path: 'cucumber-acceptance/booking.feature', line: 22 }, features: ['Bookings'], duration: 2800 },
        { name: 'Modifying a booking should update itinerary', category: 'Bookings', source: { path: 'cucumber-acceptance/booking.feature', line: 40 }, features: ['Bookings'], duration: 2100 },
    ],
});

// Module 5: jasmine-unit (all passing, fast)
const jasmineModule = createModule({
    testRunId: '42',
    moduleId: 'jasmine-unit',
    startedAt: addMilliseconds(baseTimestamp, 1_000),
    finishedAt: addMilliseconds(baseTimestamp, 8_000),
    testRunner: { name: 'Jasmine', version: '5.4.0' },
    systemContext,
    scenes: [
        { name: 'DateFormatter should format ISO dates', category: 'Utils', source: { path: 'jasmine-unit/date-formatter.spec.ts', line: 5 }, features: ['Utils'], duration: 12 },
        { name: 'DateFormatter should handle timezone offsets', category: 'Utils', source: { path: 'jasmine-unit/date-formatter.spec.ts', line: 18 }, features: ['Utils'], duration: 8 },
        { name: 'StringUtils should truncate long strings', category: 'Utils', source: { path: 'jasmine-unit/string-utils.spec.ts', line: 5 }, features: ['Utils'], duration: 3 },
        { name: 'StringUtils should escape HTML entities', category: 'Utils', source: { path: 'jasmine-unit/string-utils.spec.ts', line: 15 }, features: ['Utils'], duration: 4 },
        { name: 'Validator should reject empty email', category: 'Validation', source: { path: 'jasmine-unit/validator.spec.ts', line: 10 }, features: ['Validation'], duration: 2 },
    ],
});

// Module 6: playwright-mobile (one failure)
const playwrightMobileModule = createModule({
    testRunId: '42',
    moduleId: 'playwright-mobile',
    startedAt: addMilliseconds(baseTimestamp, 15_000),
    finishedAt: addMilliseconds(baseTimestamp, 72_000),
    testRunner: { name: 'Playwright', version: '1.50.0' },
    systemContext,
    scenes: [
        { name: 'Mobile nav should toggle hamburger menu', category: 'Mobile', source: { path: 'playwright-mobile/nav.spec.ts', line: 8 }, features: ['Mobile'], duration: 1800 },
        { name: 'Mobile nav should close on outside click', category: 'Mobile', source: { path: 'playwright-mobile/nav.spec.ts', line: 22 }, features: ['Mobile'], duration: 1500 },
        { name: 'Touch gestures should support swipe', category: 'Mobile', source: { path: 'playwright-mobile/gestures.spec.ts', line: 10 }, features: ['Mobile'], duration: 2200, passed: false, error: { name: 'TimeoutError', message: 'Swipe gesture timed out after 5000ms' } },
    ],
});

// Module 7: webdriverio-visual (all passing)
const visualModule = createModule({
    testRunId: '42',
    moduleId: 'webdriverio-visual',
    startedAt: addMilliseconds(baseTimestamp, 20_000),
    finishedAt: addMilliseconds(baseTimestamp, 80_000),
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext,
    scenes: [
        { name: 'Homepage should match baseline screenshot', category: 'Visual', source: { path: 'webdriverio-visual/homepage.spec.ts', line: 5 }, features: ['Visual'], duration: 4500 },
        { name: 'Dashboard should match baseline screenshot', category: 'Visual', source: { path: 'webdriverio-visual/dashboard.spec.ts', line: 5 }, features: ['Visual'], duration: 5200 },
        { name: 'Login form should match baseline screenshot', category: 'Visual', source: { path: 'webdriverio-visual/login.spec.ts', line: 5 }, features: ['Visual'], duration: 3800 },
    ],
});

// Module 8: mocha-integration (one compromised)
const mochaIntegrationModule = createModule({
    testRunId: '42',
    moduleId: 'mocha-integration',
    startedAt: addMilliseconds(baseTimestamp, 25_000),
    finishedAt: addMilliseconds(baseTimestamp, 65_000),
    testRunner: { name: 'Mocha', version: '11.0.0' },
    systemContext,
    scenes: [
        { name: 'Database migration should apply cleanly', category: 'Infrastructure', source: { path: 'mocha-integration/migration.spec.ts', line: 10 }, features: ['Infrastructure'], duration: 8000 },
        { name: 'Cache invalidation should clear stale entries', category: 'Infrastructure', source: { path: 'mocha-integration/cache.spec.ts', line: 8 }, features: ['Infrastructure'], duration: 2500 },
        { name: 'Message queue should process events in order', category: 'Infrastructure', source: { path: 'mocha-integration/queue.spec.ts', line: 12 }, features: ['Infrastructure'], duration: 4500 },
        { name: 'External API should handle rate limiting', category: 'Infrastructure', source: { path: 'mocha-integration/external-api.spec.ts', line: 5 }, features: ['Infrastructure'], duration: 12000, passed: false, error: { name: 'ConnectionError', message: 'ECONNREFUSED: external service unavailable' } },
    ],
});

// Module 9: playwright-a11y (all passing)
const a11yModule = createModule({
    testRunId: '42',
    moduleId: 'playwright-a11y',
    startedAt: addMilliseconds(baseTimestamp, 30_000),
    finishedAt: addMilliseconds(baseTimestamp, 50_000),
    testRunner: { name: 'Playwright', version: '1.50.0' },
    systemContext,
    scenes: [
        { name: 'Homepage should have no a11y violations', category: 'Accessibility', source: { path: 'playwright-a11y/axe-scan.spec.ts', line: 10 }, features: ['Accessibility'], duration: 3000 },
        { name: 'Forms should have proper labels', category: 'Accessibility', source: { path: 'playwright-a11y/axe-scan.spec.ts', line: 25 }, features: ['Accessibility'], duration: 2500 },
        { name: 'Color contrast should meet WCAG AA', category: 'Accessibility', source: { path: 'playwright-a11y/axe-scan.spec.ts', line: 40 }, features: ['Accessibility'], duration: 2800 },
    ],
});

// Module 10: cucumber-smoke (fast, all passing)
const smokeModule = createModule({
    testRunId: '42',
    moduleId: 'cucumber-smoke',
    startedAt: addMilliseconds(baseTimestamp, 2_000),
    finishedAt: addMilliseconds(baseTimestamp, 12_000),
    testRunner: { name: 'Cucumber', version: '11.0.0' },
    systemContext,
    scenes: [
        { name: 'Health check should return 200', category: 'Smoke', source: { path: 'cucumber-smoke/health.feature', line: 3 }, features: ['Smoke'], duration: 200 },
        { name: 'Login page should load within 2 seconds', category: 'Smoke', source: { path: 'cucumber-smoke/performance.feature', line: 5 }, features: ['Smoke'], duration: 1500 },
    ],
});

// Module 11: webdriverio-perf (performance tests, one slow failure)
const perfModule = createModule({
    testRunId: '42',
    moduleId: 'webdriverio-perf',
    startedAt: addMilliseconds(baseTimestamp, 35_000),
    finishedAt: addMilliseconds(baseTimestamp, 95_000),
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext,
    scenes: [
        { name: 'Page load should complete within budget', category: 'Performance', source: { path: 'webdriverio-perf/load-time.spec.ts', line: 8 }, features: ['Performance'], duration: 15000 },
        { name: 'LCP should be under 2.5 seconds', category: 'Performance', source: { path: 'webdriverio-perf/core-web-vitals.spec.ts', line: 12 }, features: ['Performance'], duration: 8000 },
        { name: 'CLS should be under 0.1', category: 'Performance', source: { path: 'webdriverio-perf/core-web-vitals.spec.ts', line: 30 }, features: ['Performance'], duration: 6000, passed: false, error: { name: 'AssertionError', message: 'CLS was 0.23, expected < 0.1' } },
    ],
});

// Module 12: mocha-contract (API contract tests, all passing)
const contractModule = createModule({
    testRunId: '42',
    moduleId: 'mocha-contract',
    startedAt: addMilliseconds(baseTimestamp, 8_000),
    finishedAt: addMilliseconds(baseTimestamp, 22_000),
    testRunner: { name: 'Mocha', version: '11.0.0' },
    systemContext,
    scenes: [
        { name: 'User schema should match OpenAPI spec', category: 'Contracts', source: { path: 'mocha-contract/user-schema.spec.ts', line: 5 }, features: ['Contracts'], duration: 400 },
        { name: 'Order schema should match OpenAPI spec', category: 'Contracts', source: { path: 'mocha-contract/order-schema.spec.ts', line: 5 }, features: ['Contracts'], duration: 350 },
        { name: 'Payment response should match schema', category: 'Contracts', source: { path: 'mocha-contract/payment-schema.spec.ts', line: 5 }, features: ['Contracts'], duration: 380 },
    ],
});

// Write each module's db.json
writeModuleFile(resolve(testRunsDirectory, 'playwright-web-1'), 'db.json', playwrightModule);
writeModuleFile(resolve(testRunsDirectory, 'webdriverio-cucumber-1'), 'db.json', webdriverioModule);
writeModuleFile(resolve(testRunsDirectory, 'rest-api-1'), 'db.json', restApiModule);
writeModuleFile(resolve(testRunsDirectory, 'cucumber-acceptance-1'), 'db.json', cucumberModule);
writeModuleFile(resolve(testRunsDirectory, 'jasmine-unit-1'), 'db.json', jasmineModule);
writeModuleFile(resolve(testRunsDirectory, 'playwright-mobile-1'), 'db.json', playwrightMobileModule);
writeModuleFile(resolve(testRunsDirectory, 'webdriverio-visual-1'), 'db.json', visualModule);
writeModuleFile(resolve(testRunsDirectory, 'mocha-integration-1'), 'db.json', mochaIntegrationModule);
writeModuleFile(resolve(testRunsDirectory, 'playwright-a11y-1'), 'db.json', a11yModule);
writeModuleFile(resolve(testRunsDirectory, 'cucumber-smoke-1'), 'db.json', smokeModule);
writeModuleFile(resolve(testRunsDirectory, 'webdriverio-perf-1'), 'db.json', perfModule);
writeModuleFile(resolve(testRunsDirectory, 'mocha-contract-1'), 'db.json', contractModule);

console.log('✓ Generated multi-module test data');
console.log('  - playwright-web: 8 scenarios (6 passed, 2 failed)');
console.log('  - webdriverio-cucumber: 6 scenarios (5 passed, 1 failed)');
console.log('  - rest-api: 4 scenarios (4 passed, 0 failed)');
console.log('  - cucumber-acceptance: 3 scenarios (3 passed, 0 failed)');
console.log('  - jasmine-unit: 5 scenarios (5 passed, 0 failed)');
console.log('  - playwright-mobile: 3 scenarios (2 passed, 1 failed)');
console.log('  - webdriverio-visual: 3 scenarios (3 passed, 0 failed)');
console.log('  - mocha-integration: 4 scenarios (3 passed, 1 failed)');
console.log('  - playwright-a11y: 3 scenarios (3 passed, 0 failed)');
console.log('  - cucumber-smoke: 2 scenarios (2 passed, 0 failed)');
console.log('  - webdriverio-perf: 3 scenarios (2 passed, 1 failed)');
console.log('  - mocha-contract: 3 scenarios (3 passed, 0 failed)');
console.log('Total: 47 scenarios from 12 modules\n');

// Aggregate the report
console.log('Aggregating multi-module report...');
aggregateReport(reportsDirectory, 'Multi-Module Test Project', __dirname);

console.log('✓ Multi-module report ready at examples/reports/multi-module/index.html');
