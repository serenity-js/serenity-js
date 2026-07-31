/**
 * Generates synthetic multi-module test data for integration testing.
 * Creates 3 modules under test-runs/42/:
 * - playwright-web (8 scenarios: 6 passed, 2 failed)
 * - webdriverio-cucumber (6 scenarios: 5 passed, 1 failed)
 * - rest-api (4 scenarios: 4 passed, 0 failed)
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

// Write each module's db.json
writeModuleFile(resolve(testRunsDirectory, 'playwright-web-1'), 'db.json', playwrightModule);
writeModuleFile(resolve(testRunsDirectory, 'webdriverio-cucumber-1'), 'db.json', webdriverioModule);
writeModuleFile(resolve(testRunsDirectory, 'rest-api-1'), 'db.json', restApiModule);

console.log('✓ Generated multi-module test data');
console.log('  - playwright-web: 8 scenarios (6 passed, 2 failed)');
console.log('  - webdriverio-cucumber: 6 scenarios (5 passed, 1 failed)');
console.log('  - rest-api: 4 scenarios (4 passed, 0 failed)');
console.log('Total: 18 scenarios from 3 modules\n');

// Aggregate the report
console.log('Aggregating multi-module report...');
aggregateReport(reportsDirectory, 'Multi-Module Test Project', __dirname);

console.log('✓ Multi-module report ready at examples/reports/multi-module/index.html');
