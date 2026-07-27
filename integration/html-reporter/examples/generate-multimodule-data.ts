/**
 * Generates synthetic multi-module test data for integration testing.
 * Creates 3 modules under test-runs/42/:
 * - playwright-web (8 scenarios: 6 passed, 2 failed)
 * - webdriverio-cucumber (6 scenarios: 5 passed, 1 failed)
 * - rest-api (4 scenarios: 4 passed, 0 failed)
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const testRunsDirectory = resolve(__dirname, 'reports', 'multi', 'test-runs', '42');
const baseTimestamp = '2026-07-27T15:00:00.000Z';

// Module 1: playwright-web (mostly passing, some failures)
const playwrightModule = {
    schemaVersion: 1,
    testRunId: '42',
    moduleId: 'playwright-web',
    startedAt: baseTimestamp,
    finishedAt: new Date(new Date(baseTimestamp).getTime() + 60_000).toISOString(),
    outcomes: { passed: 6, failed: 2, pending: 0, skipped: 0, compromised: 0, error: 0 },
    scenes: [
        // Passing scenarios
        { name: 'Login should authenticate with valid credentials', category: 'Authentication', outcome: { code: 64 }, duration: 1200, startedAt: baseTimestamp, source: { path: 'playwright-web/auth.spec.ts', line: 10 }, tags: [{ type: 'feature', name: 'Authentication' }, { type: 'module', name: 'playwright-web' }], activities: [] },
        { name: 'Login should show error for invalid credentials', category: 'Authentication', outcome: { code: 64 }, duration: 800, startedAt: baseTimestamp, source: { path: 'playwright-web/auth.spec.ts', line: 20 }, tags: [{ type: 'feature', name: 'Authentication' }, { type: 'module', name: 'playwright-web' }], activities: [] },
        { name: 'Checkout should complete purchase successfully', category: 'E-commerce', outcome: { code: 64 }, duration: 2500, startedAt: baseTimestamp, source: { path: 'playwright-web/checkout.spec.ts', line: 15 }, tags: [{ type: 'feature', name: 'E-commerce' }, { type: 'module', name: 'playwright-web' }], activities: [] },
        { name: 'Cart should add items correctly', category: 'E-commerce', outcome: { code: 64 }, duration: 1500, startedAt: baseTimestamp, source: { path: 'playwright-web/cart.spec.ts', line: 8 }, tags: [{ type: 'feature', name: 'E-commerce' }, { type: 'module', name: 'playwright-web' }], activities: [] },
        { name: 'Profile should display user information', category: 'User Management', outcome: { code: 64 }, duration: 900, startedAt: baseTimestamp, source: { path: 'playwright-web/profile.spec.ts', line: 12 }, tags: [{ type: 'feature', name: 'User Management' }, { type: 'module', name: 'playwright-web' }], activities: [] },
        { name: 'Settings should save preferences', category: 'User Management', outcome: { code: 64 }, duration: 1100, startedAt: baseTimestamp, source: { path: 'playwright-web/settings.spec.ts', line: 18 }, tags: [{ type: 'feature', name: 'User Management' }, { type: 'module', name: 'playwright-web' }], activities: [] },
        // Failing scenarios
        { name: 'Payment should process credit card', category: 'E-commerce', outcome: { code: 4 }, duration: 3000, startedAt: baseTimestamp, source: { path: 'playwright-web/payment.spec.ts', line: 25 }, tags: [{ type: 'feature', name: 'E-commerce' }, { type: 'module', name: 'playwright-web' }], activities: [], error: { name: 'AssertionError', message: 'Expected payment status to be "completed"', stack: '' } },
        { name: 'Search should return relevant results', category: 'Search', outcome: { code: 4 }, duration: 1800, startedAt: baseTimestamp, source: { path: 'playwright-web/search.spec.ts', line: 30 }, tags: [{ type: 'feature', name: 'Search' }, { type: 'module', name: 'playwright-web' }], activities: [], error: { name: 'AssertionError', message: 'Expected 10 results, got 8', stack: '' } },
    ],
    tags: [
        { type: 'feature', name: 'Authentication' },
        { type: 'feature', name: 'E-commerce' },
        { type: 'feature', name: 'User Management' },
        { type: 'feature', name: 'Search' },
        { type: 'module', name: 'playwright-web' },
    ],
    testRunner: { name: 'Playwright', version: '1.50.0' },
    systemContext: { nodeVersion: 'v24.18.0', os: { name: 'linux', version: '6.2', arch: 'x64' }, serenityVersion: '3.44.1', runtime: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123' } },
};

// Module 2: webdriverio-cucumber (mostly passing, one failure)
const webdriverioModule = {
    schemaVersion: 1,
    testRunId: '42',
    moduleId: 'webdriverio-cucumber',
    startedAt: new Date(new Date(baseTimestamp).getTime() + 5_000).toISOString(),
    finishedAt: new Date(new Date(baseTimestamp).getTime() + 55_000).toISOString(),
    outcomes: { passed: 5, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
    scenes: [
        // Passing scenarios
        { name: 'User registration should create a new account', category: 'Registration', outcome: { code: 64 }, duration: 2000, startedAt: baseTimestamp, source: { path: 'webdriverio-cucumber/registration.feature', line: 5 }, tags: [{ type: 'feature', name: 'Registration' }, { type: 'module', name: 'webdriverio-cucumber' }], activities: [] },
        { name: 'Password reset should send reset email', category: 'Account Recovery', outcome: { code: 64 }, duration: 1500, startedAt: baseTimestamp, source: { path: 'webdriverio-cucumber/recovery.feature', line: 12 }, tags: [{ type: 'feature', name: 'Account Recovery' }, { type: 'module', name: 'webdriverio-cucumber' }], activities: [] },
        { name: 'Admin dashboard should display statistics', category: 'Administration', outcome: { code: 64 }, duration: 1800, startedAt: baseTimestamp, source: { path: 'webdriverio-cucumber/admin.feature', line: 8 }, tags: [{ type: 'feature', name: 'Administration' }, { type: 'module', name: 'webdriverio-cucumber' }], activities: [] },
        { name: 'Notifications should appear for new messages', category: 'Messaging', outcome: { code: 64 }, duration: 1200, startedAt: baseTimestamp, source: { path: 'webdriverio-cucumber/notifications.feature', line: 15 }, tags: [{ type: 'feature', name: 'Messaging' }, { type: 'module', name: 'webdriverio-cucumber' }], activities: [] },
        { name: 'File upload should accept PDF documents', category: 'File Management', outcome: { code: 64 }, duration: 2200, startedAt: baseTimestamp, source: { path: 'webdriverio-cucumber/upload.feature', line: 20 }, tags: [{ type: 'feature', name: 'File Management' }, { type: 'module', name: 'webdriverio-cucumber' }], activities: [] },
        // Failing scenario
        { name: 'Export should generate CSV report', category: 'Reports', outcome: { code: 4 }, duration: 3500, startedAt: baseTimestamp, source: { path: 'webdriverio-cucumber/export.feature', line: 25 }, tags: [{ type: 'feature', name: 'Reports' }, { type: 'module', name: 'webdriverio-cucumber' }], activities: [], error: { name: 'AssertionError', message: 'CSV file was not generated', stack: '' } },
    ],
    tags: [
        { type: 'feature', name: 'Registration' },
        { type: 'feature', name: 'Account Recovery' },
        { type: 'feature', name: 'Administration' },
        { type: 'feature', name: 'Messaging' },
        { type: 'feature', name: 'File Management' },
        { type: 'feature', name: 'Reports' },
        { type: 'module', name: 'webdriverio-cucumber' },
    ],
    testRunner: { name: 'WebdriverIO', version: '9.2.0' },
    systemContext: { nodeVersion: 'v24.18.0', os: { name: 'linux', version: '6.2', arch: 'x64' }, serenityVersion: '3.44.1', runtime: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123' } },
};

// Module 3: rest-api (all passing)
const restApiModule = {
    schemaVersion: 1,
    testRunId: '42',
    moduleId: 'rest-api',
    startedAt: new Date(new Date(baseTimestamp).getTime() + 10_000).toISOString(),
    finishedAt: new Date(new Date(baseTimestamp).getTime() + 35_000).toISOString(),
    outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
    scenes: [
        { name: 'GET /users should return user list', category: 'API Tests', outcome: { code: 64 }, duration: 500, startedAt: baseTimestamp, source: { path: 'rest-api/users.spec.ts', line: 8 }, tags: [{ type: 'feature', name: 'API' }, { type: 'module', name: 'rest-api' }], activities: [] },
        { name: 'POST /users should create new user', category: 'API Tests', outcome: { code: 64 }, duration: 700, startedAt: baseTimestamp, source: { path: 'rest-api/users.spec.ts', line: 18 }, tags: [{ type: 'feature', name: 'API' }, { type: 'module', name: 'rest-api' }], activities: [] },
        { name: 'PUT /users/:id should update user', category: 'API Tests', outcome: { code: 64 }, duration: 650, startedAt: baseTimestamp, source: { path: 'rest-api/users.spec.ts', line: 28 }, tags: [{ type: 'feature', name: 'API' }, { type: 'module', name: 'rest-api' }], activities: [] },
        { name: 'DELETE /users/:id should remove user', category: 'API Tests', outcome: { code: 64 }, duration: 600, startedAt: baseTimestamp, source: { path: 'rest-api/users.spec.ts', line: 38 }, tags: [{ type: 'feature', name: 'API' }, { type: 'module', name: 'rest-api' }], activities: [] },
    ],
    tags: [
        { type: 'feature', name: 'API' },
        { type: 'module', name: 'rest-api' },
    ],
    testRunner: { name: 'Mocha', version: '11.0.0' },
    systemContext: { nodeVersion: 'v24.18.0', os: { name: 'linux', version: '6.2', arch: 'x64' }, serenityVersion: '3.44.1', runtime: { provider: 'GitHub Actions', buildNumber: '42', branch: 'main', commit: 'abc123' } },
};

// Write each module's db.json
mkdirSync(resolve(testRunsDirectory, 'playwright-web-1'), { recursive: true });
writeFileSync(resolve(testRunsDirectory, 'playwright-web-1', 'db.json'), JSON.stringify(playwrightModule, undefined, 2), 'utf8');

mkdirSync(resolve(testRunsDirectory, 'webdriverio-cucumber-1'), { recursive: true });
writeFileSync(resolve(testRunsDirectory, 'webdriverio-cucumber-1', 'db.json'), JSON.stringify(webdriverioModule, undefined, 2), 'utf8');

mkdirSync(resolve(testRunsDirectory, 'rest-api-1'), { recursive: true });
writeFileSync(resolve(testRunsDirectory, 'rest-api-1', 'db.json'), JSON.stringify(restApiModule, undefined, 2), 'utf8');

console.log('✓ Generated multi-module test data');
console.log('  - playwright-web: 8 scenarios (6 passed, 2 failed)');
console.log('  - webdriverio-cucumber: 6 scenarios (5 passed, 1 failed)');
console.log('  - rest-api: 4 scenarios (4 passed, 0 failed)');
console.log('Total: 18 scenarios from 3 modules\n');

// Aggregate the report
console.log('Aggregating multi-module report...');
const outputDirectory = resolve(__dirname, 'reports', 'multi');
const aggregateCommand = `npx html-reporter aggregate --input "${outputDirectory}/test-runs/*" --output "${outputDirectory}" --title "Multi-Module Test Project"`;
execSync(aggregateCommand, { cwd: __dirname, stdio: 'inherit' });

console.log('✓ Multi-module report ready at examples/reports/multi/index.html');
