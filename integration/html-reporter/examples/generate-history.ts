/**
 * Reads the most recent db.json produced by the stub run, creates a historical
 * variant with inverted outcomes for specific scenarios, and re-runs
 * the reporter's aggregation to produce data.js with trend history.
 */
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
    startedAt: previousTimestamp, finishedAt: new Date(new Date(previousTimestamp).getTime() + 5000).toISOString(),
    outcomes: previousOutcomes,
    scenes: previousScenes,
};

// Write the historical run
const previousRunDirectory = resolve(testRunsDirectory, previousTimestamp);
mkdirSync(previousRunDirectory, { recursive: true });
writeFileSync(resolve(previousRunDirectory, 'db.json'), JSON.stringify(previousDatabase, undefined, 2), 'utf8');

// Re-run aggregation using the compiled reporter package
 
const { DataSnapshotAggregator } = require('@serenity-js/html-reporter/lib/DataSnapshotAggregator') as typeof import('@serenity-js/html-reporter/lib/DataSnapshotAggregator');
 
const { FileSystem, Path, RequirementsHierarchy } = require('@serenity-js/core/lib/io') as typeof import('@serenity-js/core/lib/io');

const specDirectory = resolve(__dirname, 'specs');
const outputFileSystem = new FileSystem(Path.from(reportDirectory));
const projectFileSystem = new FileSystem(Path.from(resolve(__dirname, '..')));
const aggregator = new DataSnapshotAggregator(outputFileSystem, {
    stabilityWindow: 5,
    title: 'Test Project',
}, new RequirementsHierarchy(projectFileSystem, Path.from(specDirectory)), projectFileSystem);

aggregator.aggregate();

console.log(`Generated historical run at ${previousTimestamp}`);
console.log(`Re-aggregated data.js with ${runs.length + 1} runs`);
