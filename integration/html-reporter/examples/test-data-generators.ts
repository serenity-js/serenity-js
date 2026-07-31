/**
 * Test data generators for html-reporter integration tests.
 *
 * Provides builder functions for creating synthetic RunData structures
 * that match the schema expected by the aggregator. Use these to create
 * test fixtures for multi-module, multi-worker, and other aggregation scenarios.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SceneDefinition {
    name: string;
    category: string;
    passed?: boolean;           // defaults to true
    duration?: number;          // defaults to 1000ms
    source: { path: string; line: number };
    features?: string[];        // creates feature tags automatically
    error?: { name: string; message: string; stack?: string };
}

export interface ModuleDefinition {
    testRunId: string;
    moduleId: string;
    startedAt: string;
    finishedAt: string;
    testRunner: { name: string; version: string };
    scenes: SceneDefinition[];
    systemContext?: SystemContext;
}

export interface SystemContext {
    nodeVersion: string;
    os: { name: string; version: string; arch: string };
    serenityVersion: string;
    runtime: { provider: string; buildNumber: string; branch: string; commit: string };
}

interface Scene {
    name: string;
    category: string;
    outcome: { code: number };
    duration: number;
    startedAt: string;
    source: { path: string; line: number };
    tags: Array<{ type: string; name: string }>;
    activities: unknown[];
    error?: { name: string; message: string; stack: string };
}

interface RunData {
    schemaVersion: number;
    testRunId: string;
    moduleId: string;
    startedAt: string;
    finishedAt: string;
    outcomes: { passed: number; failed: number; pending: number; skipped: number; compromised: number; error: number };
    scenes: Scene[];
    tags: Array<{ type: string; name: string }>;
    testRunner: { name: string; version: string };
    systemContext: SystemContext;
}

// -----------------------------------------------------------------------------
// Outcome codes (from Serenity/JS ExecutionOutcome)
// -----------------------------------------------------------------------------

const OUTCOME_SUCCESS = 64;
const OUTCOME_FAILURE = 4;

// -----------------------------------------------------------------------------
// Generators
// -----------------------------------------------------------------------------

/**
 * Creates a default system context for test data.
 * Override specific fields as needed.
 */
export function createSystemContext(buildNumber: string, overrides: Partial<SystemContext> = {}): SystemContext {
    return {
        nodeVersion: 'v24.18.0',
        os: { name: 'linux', version: '6.2', arch: 'x64' },
        serenityVersion: '3.44.1',
        runtime: { provider: 'GitHub Actions', buildNumber, branch: 'main', commit: 'abc123' },
        ...overrides,
    };
}

/**
 * Creates a scene (test scenario) from a definition.
 * Automatically derives outcome code from passed flag and builds tags from features.
 */
export function createScene(baseTimestamp: string, moduleId: string, definition: SceneDefinition): Scene {
    const passed = definition.passed ?? true;
    const featureTags = (definition.features ?? []).map(name => ({ type: 'feature', name }));

    return {
        name: definition.name,
        category: definition.category,
        outcome: { code: passed ? OUTCOME_SUCCESS : OUTCOME_FAILURE },
        duration: definition.duration ?? 1000,
        startedAt: baseTimestamp,
        source: definition.source,
        tags: [
            ...featureTags,
            { type: 'module', name: moduleId },
        ],
        activities: [],
        ...(definition.error && {
            error: {
                name: definition.error.name,
                message: definition.error.message,
                stack: definition.error.stack ?? '',
            },
        }),
    };
}

/**
 * Creates a complete module (RunData) from a definition.
 * Automatically computes outcomes from scenes and collects feature tags.
 */
export function createModule(definition: ModuleDefinition): RunData {
    const scenes = definition.scenes.map(s =>
        createScene(definition.startedAt, definition.moduleId, s)
    );

    const passed = scenes.filter(s => s.outcome.code === OUTCOME_SUCCESS).length;
    const failed = scenes.filter(s => s.outcome.code === OUTCOME_FAILURE).length;

    // Collect unique feature tags from all scenes
    const featureNames = new Set<string>();
    for (const scene of scenes) {
        for (const tag of scene.tags) {
            if (tag.type === 'feature') {
                featureNames.add(tag.name);
            }
        }
    }
    const featureTags = [...featureNames].map(name => ({ type: 'feature', name }));

    return {
        schemaVersion: 1,
        testRunId: definition.testRunId,
        moduleId: definition.moduleId,
        startedAt: definition.startedAt,
        finishedAt: definition.finishedAt,
        outcomes: { passed, failed, pending: 0, skipped: 0, compromised: 0, error: 0 },
        scenes,
        tags: [...featureTags, { type: 'module', name: definition.moduleId }],
        testRunner: definition.testRunner,
        systemContext: definition.systemContext ?? createSystemContext(definition.testRunId),
    };
}

// -----------------------------------------------------------------------------
// File operations
// -----------------------------------------------------------------------------

/**
 * Writes a module's RunData to a JSON file.
 * Creates the directory if it doesn't exist.
 */
export function writeModuleFile(directory: string, filename: string, module: RunData): void {
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, filename), JSON.stringify(module, undefined, 2), 'utf8');
}

/**
 * Runs the html-reporter aggregate command for a report directory.
 */
export function aggregateReport(outputDirectory: string, title: string, cwd: string): void {
    const command = `npx html-reporter aggregate --input "${outputDirectory}/test-runs/*" --output "${outputDirectory}" --title "${title}"`;
    execSync(command, { cwd, stdio: 'inherit' });
}

// -----------------------------------------------------------------------------
// Timestamp utilities
// -----------------------------------------------------------------------------

/**
 * Adds milliseconds to an ISO timestamp string.
 */
export function addMilliseconds(timestamp: string, ms: number): string {
    return new Date(new Date(timestamp).getTime() + ms).toISOString();
}
