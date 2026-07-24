/**
 * Reads the most recent db.json produced by the stub run, creates a historical
 * variant with inverted outcomes for specific scenarios, and re-runs
 * the reporter's aggregation to produce data.js with trend history.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportDirectory = resolve(__dirname, 'reports', 'serenity');
const testRunsDirectory = resolve(reportDirectory, 'test-runs');

// Find the most recent run
const runs = readdirSync(testRunsDirectory).sort();
if (runs.length === 0) {
    throw new Error('No test runs found. Run the stub spec first.');
}

const latestRunDirectory = resolve(testRunsDirectory, runs[runs.length - 1]);
const latestDatabase = JSON.parse(readFileSync(resolve(latestRunDirectory, 'db.json'), 'utf8'));

// Create a historical run (1 day earlier) with inverted outcomes:
// - "should complete an item" was PASSING (now it fails → degraded)
// - "should persist items" was FAILING (now it passes → recovered)
const previousTimestamp = new Date(new Date(latestDatabase.startedAt).getTime() - 86_400_000).toISOString();

const previousScenes = latestDatabase.scenes.map((scene: any) => {
    const clone = { ...scene, startedAt: previousTimestamp, activities: [...scene.activities] };

    if (scene.name.includes('should complete an item')) {
        clone.outcome = { code: 64 }; // ExecutionSuccessful
        delete clone.error;
    } else if (scene.name.includes('should persist items')) {
        clone.outcome = { code: 4 }; // ExecutionFailedWithAssertionError
        clone.error = { name: 'AssertionError', message: 'Expected items to persist', stack: '' };
    } else if (scene.name.includes('should reject an expired card')) {
        // Was passing before → now fails (degraded)
        clone.outcome = { code: 64 }; // ExecutionSuccessful
        delete clone.error;
    } else if (scene.name.includes('should display a timeout error')) {
        // Was also timing out before (consistently failing)
        clone.outcome = { code: 2 }; // ExecutionFailedWithError
        clone.error = { name: 'Error', message: 'Timeout waiting for condition', stack: '' };
    }

    return clone;
});

const previousOutcomes = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
for (const scene of previousScenes) {
    if (scene.outcome.code === 64) previousOutcomes.passed++;
    else if (scene.outcome.code === 4) previousOutcomes.failed++;
    else if (scene.outcome.code === 8) previousOutcomes.pending++;
    else if (scene.outcome.code === 32) previousOutcomes.skipped++;
    else if (scene.outcome.code === 1) previousOutcomes.compromised++;
    else previousOutcomes.error++;
}

const previousDatabase = {
    ...latestDatabase,
    testRunId: '41',
    startedAt: previousTimestamp, finishedAt: new Date(new Date(previousTimestamp).getTime() + 5000).toISOString(),
    outcomes: previousOutcomes,
    scenes: previousScenes,
};

// Write the historical run
const previousRunDirectory = resolve(testRunsDirectory, '41');
mkdirSync(previousRunDirectory, { recursive: true });
writeFileSync(resolve(previousRunDirectory, 'db.json'), JSON.stringify(previousDatabase, undefined, 2), 'utf8');

// Create a multi-module incomplete run (simulates a CI build where one module crashed)
// Three modules sharing testRunId '40': one passed, one failed, one incomplete
const incompleteTimestamp = new Date(new Date(previousTimestamp).getTime() - 86_400_000).toISOString(); // 1 day before historical run
const incompleteFinished = new Date(new Date(incompleteTimestamp).getTime() + 120_000).toISOString(); // 2 min later

const passingModuleDatabase = {
    schemaVersion: latestDatabase.schemaVersion,
    testRunId: '40',
    startedAt: incompleteTimestamp,
    finishedAt: incompleteFinished,
    outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
    scenes: [
        { name: 'Module A test 1', category: 'Passing Module', outcome: { code: 64 }, duration: 100, startedAt: incompleteTimestamp, source: { path: 'passing-module/a.spec.ts', line: 1 }, tags: [], activities: [] },
        { name: 'Module A test 2', category: 'Passing Module', outcome: { code: 64 }, duration: 150, startedAt: incompleteTimestamp, source: { path: 'passing-module/a.spec.ts', line: 10 }, tags: [], activities: [] },
        { name: 'Module A test 3', category: 'Passing Module', outcome: { code: 64 }, duration: 200, startedAt: incompleteTimestamp, source: { path: 'passing-module/b.spec.ts', line: 1 }, tags: [], activities: [] },
    ],
    tags: [],
    testRunner: { name: 'Playwright', version: '1.50.0' },
    systemContext: { ...latestDatabase.systemContext, projectName: 'passing-module' },
};

const failingModuleDatabase = {
    schemaVersion: latestDatabase.schemaVersion,
    testRunId: '40',
    startedAt: new Date(new Date(incompleteTimestamp).getTime() + 60_000).toISOString(),
    finishedAt: new Date(new Date(incompleteTimestamp).getTime() + 180_000).toISOString(),
    outcomes: { passed: 1, failed: 2, pending: 0, skipped: 0, compromised: 0, error: 0 },
    scenes: [
        { name: 'Module B test 1', category: 'Failing Module', outcome: { code: 64 }, duration: 100, startedAt: incompleteTimestamp, source: { path: 'failing-module/c.spec.ts', line: 1 }, tags: [], activities: [] },
        { name: 'Module B test 2', category: 'Failing Module', outcome: { code: 4 }, duration: 200, startedAt: incompleteTimestamp, source: { path: 'failing-module/c.spec.ts', line: 10 }, tags: [], activities: [], error: { name: 'AssertionError', message: 'Expected value to match', stack: '' } },
        { name: 'Module B test 3', category: 'Failing Module', outcome: { code: 4 }, duration: 150, startedAt: incompleteTimestamp, source: { path: 'failing-module/d.spec.ts', line: 1 }, tags: [], activities: [], error: { name: 'AssertionError', message: 'Assertion failed', stack: '' } },
    ],
    tags: [],
    testRunner: { name: 'Playwright', version: '1.50.0' },
    systemContext: { ...latestDatabase.systemContext, projectName: 'failing-module' },
};

const crashedModuleDatabase = {
    schemaVersion: latestDatabase.schemaVersion,
    testRunId: '40',
    startedAt: new Date(new Date(incompleteTimestamp).getTime() + 30_000).toISOString(),
    // No finishedAt — simulates a crashed runner
    outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
    scenes: [],
    tags: [],
    systemContext: { ...latestDatabase.systemContext, projectName: 'crashed-module' },
};

const incompleteRunDirectory = resolve(testRunsDirectory, '40');
mkdirSync(resolve(incompleteRunDirectory, 'passing-module-1'), { recursive: true });
mkdirSync(resolve(incompleteRunDirectory, 'failing-module-1'), { recursive: true });
mkdirSync(resolve(incompleteRunDirectory, 'crashed-module-1'), { recursive: true });
writeFileSync(resolve(incompleteRunDirectory, 'passing-module-1', 'db.json'), JSON.stringify(passingModuleDatabase, undefined, 2), 'utf8');
writeFileSync(resolve(incompleteRunDirectory, 'failing-module-1', 'db.json'), JSON.stringify(failingModuleDatabase, undefined, 2), 'utf8');
writeFileSync(resolve(incompleteRunDirectory, 'crashed-module-1', 'db.json'), JSON.stringify(crashedModuleDatabase, undefined, 2), 'utf8');

// Re-run aggregation using the html-reporter CLI
const cliPath = resolve(__dirname, '../../../packages/html-reporter/bin/html-reporter.mjs');
const specDirectory = resolve(__dirname, 'specs');

execSync([
    'node', cliPath, 'aggregate',
    '--input', `"${testRunsDirectory}/*"`,
    '--output', reportDirectory,
    '--title', '"Test Project"',
    '--specRoot', specDirectory,
].join(' '), { stdio: 'inherit' });

console.log(`Generated historical run at ${previousTimestamp}`);
console.log(`Generated incomplete run at ${incompleteTimestamp}`);
console.log(`Re-aggregated data.js with ${runs.length + 2} runs`);
