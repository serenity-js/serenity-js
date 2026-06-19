# Technical Design: @serenity-js/html-reporter

## Overview

The `@serenity-js/html-reporter` module is a `StageCrewMember` that collects domain events during a test run, persists artifacts immediately to disk, and produces a self-contained static HTML report upon test run completion.

### Architecture Principles

- **Write-through**: Artifacts are flushed to disk as they arrive (no in-memory buffering of binary data)
- **Fail-fast**: The Test_Run_Directory is created at test run start; permission errors surface immediately as `ConfigurationError`
- **Non-destructive**: Only `index.html` and `data.js` at the output root are regenerated; existing test-run directories are never modified
- **Self-contained output**: The generated report has no external dependencies; all JS libraries are inlined at build time

## Component Architecture

```
HtmlReporter (StageCrewMember)
├── HtmlReporterConfig              — Configuration interface
├── SceneDataCollector              — Transforms event queues into RunData model
├── ArtifactWriter                  — Persists artifacts to Test_Run_Directory
├── RunDataWriter                   — Writes db.json for the current run
├── DataSnapshotAggregator          — Reads all db.json files, produces data.js
├── ReportTemplateWriter            — Writes the pre-bundled index.html
├── SystemContextDetector           — Detects Node, OS, Serenity/JS version, browser info
└── CIDetector                      — Detects CI provider, build number, branch, commit from env vars
```

## Module Structure

```
packages/html-reporter/
├── src/
│   ├── index.ts                    — Public API exports
│   ├── HtmlReporter.ts             — StageCrewMember implementation
│   ├── HtmlReporterConfig.ts       — Configuration interface
│   ├── SceneDataCollector.ts       — Event queue → RunData transformation
│   ├── ArtifactWriter.ts           — Immediate artifact persistence
│   ├── RunDataWriter.ts            — Writes db.json
│   ├── DataSnapshotAggregator.ts   — Aggregates db.json files → data.js
│   ├── ReportTemplateWriter.ts     — Writes pre-bundled index.html
│   ├── SystemContextDetector.ts    — Detects Node, OS, Serenity/JS version
│   ├── CIDetector.ts              — Detects CI provider, build number, branch, commit
│   └── model/
│       ├── RunData.ts              — TypeScript interface for db.json structure
│       ├── DataSnapshot.ts         — TypeScript interface for data.js structure
│       └── ScenarioIdentity.ts     — Scene identity (name + source path) for cross-run correlation
├── spec/                           — Unit tests
├── template/                       — Development template (index.html, data.js)
├── bundle/                         — Build output: pre-bundled template string
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Class Design

### HtmlReporter

The primary `StageCrewMember` implementation. Simpler than `SerenityBDDReporter` because:
- It writes artifacts directly (no separate `ArtifactArchiver` needed)
- It uses a single `SceneDataCollector` instead of the `EventQueueProcessors` factory pattern
- It handles its own file I/O rather than emitting `ArtifactGenerated` events back to the stage

```typescript
import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import { DomainEventQueues } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    ActivityRelatedArtifactGenerated,
    AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed,
    TestRunStarts, TestRunFinishes,
} from '@serenity-js/core/events';
import { CorrelationId, Description, Name } from '@serenity-js/core/model';

export class HtmlReporter implements StageCrewMember {
    private readonly eventQueues = new DomainEventQueues();
    private testRunStartedAt?: Timestamp;
    private testRunnerName?: string;
    private testRunnerVersion?: string;

    static fromJSON(config: HtmlReporterConfig): StageCrewMemberBuilder<HtmlReporter> {
        return new HtmlReporterBuilder(config);
    }

    constructor(
        private readonly artifactWriter: ArtifactWriter,
        private readonly sceneDataCollector: SceneDataCollector,
        private readonly runDataWriter: RunDataWriter,
        private readonly aggregator: DataSnapshotAggregator,
        private readonly templateWriter: ReportTemplateWriter,
        private readonly systemContextDetector: SystemContextDetector,
        private stage?: Stage,
    ) {}

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof TestRunStarts) {
            this.testRunStartedAt = event.timestamp;
            this.artifactWriter.createRunDirectory(event.timestamp);
        }

        if (event instanceof TestRunnerDetected) {
            this.testRunnerName = event.name.value;
            this.testRunnerVersion = event.version?.value;  // enriched field
        }

        if (this.isSceneSpecific(event)) {
            this.eventQueues.enqueue(event);
        }

        if (event instanceof ActivityRelatedArtifactGenerated) {
            this.artifactWriter.write(event);
        }

        if (event instanceof TestRunFinishes) {
            this.generateReport();
        }
    }

    private generateReport(): void {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(this.constructor.name),
            new Description('Generating HTML report...'),
            id,
            this.stage.currentTime(),
        ));

        try {
            // 1. Detect system context (Node, OS, CI, etc.)
            const systemContext = this.systemContextDetector.detect();
            systemContext.testRunner = {
                name: this.testRunnerName,
                version: this.testRunnerVersion,
            };

            // 2. Transform collected events into run data model
            const runData = this.sceneDataCollector.collect(
                this.eventQueues,
                this.testRunStartedAt,
                this.artifactWriter.artifactPaths(),
                systemContext,
            );

            // 3. Write db.json for this run
            this.runDataWriter.write(runData);

            // 4. Aggregate all historical db.json files into data.js
            this.aggregator.aggregate();

            // 5. Write the report template (index.html)
            this.templateWriter.write();

            this.stage.announce(new AsyncOperationCompleted(id, this.stage.currentTime()));
        } catch (error) {
            this.stage.announce(new AsyncOperationFailed(error, id, this.stage.currentTime()));
        }
    }

    private isSceneSpecific(event: DomainEvent): event is DomainEvent & { sceneId: CorrelationId } {
        return Object.prototype.hasOwnProperty.call(event, 'sceneId');
    }
}
```

### HtmlReporterConfig

```typescript
export interface HtmlReporterConfig {
    /** Report output directory. Default: './reports/serenity-js' */
    outputDirectory?: string;

    /** Root directory for deriving requirements hierarchy. */
    specDirectory?: string;

    /** Custom title displayed in report header. */
    title?: string;

    /** Max number of test run directories to retain. Older runs are deleted during aggregation. */
    maxHistory?: number;

    /** Number of recent executions to consider for stability analysis. Default: 5 */
    stabilityWindow?: number;
}
```

### HtmlReporterBuilder

Follows the standard `StageCrewMemberBuilder` pattern. Validates configuration and wires up dependencies.

```typescript
class HtmlReporterBuilder implements StageCrewMemberBuilder<HtmlReporter> {
    constructor(private readonly config: HtmlReporterConfig) {}

    build({ stage, fileSystem }: StageCrewMemberBuilderDependencies): HtmlReporter {
        const outputDir = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const specDir = this.config.specDirectory ? Path.from(this.config.specDirectory) : undefined;

        // Fail-fast: validate output directory is writable
        const reportFileSystem = new FileSystem(outputDir);

        const artifactWriter = new ArtifactWriter(reportFileSystem);
        const sceneDataCollector = new SceneDataCollector(specDir, fileSystem);
        const runDataWriter = new RunDataWriter(reportFileSystem);
        const aggregator = new DataSnapshotAggregator(reportFileSystem, {
            maxHistory: this.config.maxHistory,
            stabilityWindow: this.config.stabilityWindow ?? 5,
            title: this.config.title,
        });
        const templateWriter = new ReportTemplateWriter(reportFileSystem);
        const systemContextDetector = new SystemContextDetector();

        return new HtmlReporter(
            artifactWriter, sceneDataCollector, runDataWriter, aggregator,
            templateWriter, systemContextDetector, stage,
        );
    }
}
```

### ArtifactWriter

Handles immediate persistence of artifacts (screenshots, videos, traces) to the Test_Run_Directory. Called synchronously on each `ActivityRelatedArtifactGenerated` event.

```typescript
export class ArtifactWriter {
    private runDirectory?: Path;
    private readonly paths = new Map<CorrelationId, Path[]>();  // activityId → artifact paths

    constructor(private readonly fileSystem: FileSystem) {}

    createRunDirectory(timestamp: Timestamp): void {
        const dirName = timestamp.toISOString();  // e.g. '2024-06-15T14:30:00.000Z'
        this.runDirectory = Path.from('test-runs', dirName);

        // Fail-fast: create directory now; throws ConfigurationError if not writable
        this.fileSystem.ensureDirectoryExists(this.runDirectory);
    }

    write(event: ActivityRelatedArtifactGenerated): void {
        const artifact = event.artifact;
        const filename = this.generateFilename(event);
        const relativePath = this.runDirectory.join(filename);

        if (artifact instanceof Photo) {
            this.fileSystem.storeSync(relativePath, artifact.base64EncodedValue, 'base64');
        } else if (artifact instanceof TextualData) {
            this.fileSystem.storeSync(relativePath, artifact.map(String), 'utf8');
        }
        // ... other artifact types

        // Track paths for later inclusion in db.json
        const paths = this.paths.get(event.activityId) || [];
        paths.push(relativePath);
        this.paths.set(event.activityId, paths);
    }

    artifactPaths(): Map<CorrelationId, Path[]> {
        return this.paths;
    }
}
```

### SceneDataCollector

Transforms `DomainEventQueues` into the `RunData` model. This replaces the `EventQueueProcessors` hierarchy from `@serenity-js/serenity-bdd` with a single unified processor that handles both:

- **Regular scenes** (Cucumber `Scenario:`, Playwright Test `it()`, Mocha `it()`) — each produces one event queue
- **Scenario outlines / sequences** (Cucumber `Scenario Outline:`) — each example row produces its own event queue; the `DomainEventQueues` groups them under a `SceneSequenceDetected` event

The simplification is possible because our output format treats each execution as a separate scene record regardless of whether it came from an outline or a standalone scenario. Retries are grouped in post-processing by matching scenario identity.

```typescript
export class SceneDataCollector {
    constructor(
        private readonly specDirectory?: Path,
        private readonly fileSystem?: FileSystem,
    ) {}

    collect(
        queues: DomainEventQueues,
        testRunStartedAt: Timestamp,
        artifactPaths: Map<CorrelationId, Path[]>,
    ): RunData {
        const scenes: SceneRecord[] = [];

        queues.forEach(queue => {
            const scene = this.processQueue(queue, artifactPaths);
            scenes.push(scene);
        });

        return {
            timestamp: testRunStartedAt.toISOString(),
            duration: /* computed from events */,
            outcomes: this.summariseOutcomes(scenes),
            scenes,
            tags: this.collectTags(scenes),
            systemContext: this.detectSystemContext(),
        };
    }

    private processQueue(queue: DomainEventQueue, artifactPaths: Map<CorrelationId, Path[]>): SceneRecord {
        // Walk the event queue, building the activity tree, collecting tags,
        // recording outcomes, associating artifacts with activities
    }
}
```

### DataSnapshotAggregator

Reads all `test-runs/*/db.json` files and produces the aggregated `data.js` snapshot.

```typescript
export class DataSnapshotAggregator {
    constructor(
        private readonly fileSystem: FileSystem,
        private readonly config: { maxHistory?: number; stabilityWindow: number; title?: string },
    ) {}

    aggregate(): void {
        // 1. Find all test-runs/*/db.json files, sorted chronologically
        const runDataFiles = this.findRunDataFiles();

        // 2. Apply maxHistory: delete excess old directories
        if (this.config.maxHistory && runDataFiles.length > this.config.maxHistory) {
            this.pruneOldRuns(runDataFiles, this.config.maxHistory);
        }

        // 3. Parse all remaining db.json files
        const allRuns = runDataFiles.map(f => JSON.parse(this.fileSystem.readSync(f)));

        // 4. Build the data snapshot
        const latestRun = allRuns[allRuns.length - 1];
        const snapshot: DataSnapshot = {
            summary: this.buildSummary(latestRun),
            scenarios: this.enrichWithHistory(latestRun.scenes, allRuns),
            history: this.buildHistory(allRuns),
            tags: latestRun.tags,
            requirements: this.buildRequirements(),
            unstableTests: this.identifyUnstableTests(allRuns),
            systemContext: latestRun.systemContext,
        };

        // 5. Write data.js
        const js = `window.__SERENITY_REPORT_DATA__ = ${JSON.stringify(snapshot)};`;
        this.fileSystem.storeSync(Path.from('data.js'), js, 'utf8');
    }

    private identifyUnstableTests(allRuns: RunData[]): UnstableTest[] {
        // Use only the last `stabilityWindow` runs for stability analysis
        const recentRuns = allRuns.slice(-this.config.stabilityWindow);
        // Correlate scenes by identity (name + source path)
        // Identify tests with mixed outcomes within the window
    }

    private enrichWithHistory(scenes: SceneRecord[], allRuns: RunData[]): EnrichedScene[] {
        // For each scene in the latest run, look up its outcome in all previous runs
        // using ScenarioIdentity (name + source.path) as the correlation key
    }
}
```

### ReportTemplateWriter

Writes the pre-bundled `index.html` to the output directory. The template is bundled at package build time (not at report generation time).

```typescript
export class ReportTemplateWriter {
    constructor(private readonly fileSystem: FileSystem) {}

    write(): void {
        // The bundled template is imported as a string constant from the build output
        const template = require('../bundle/template.js').default;
        this.fileSystem.storeSync(Path.from('index.html'), template, 'utf8');
    }
}
```

### SystemContextDetector

Detects runtime environment information from Node.js APIs and `process.env`. Designed as an injectable dependency so it can be substituted with a mock in unit tests.

```typescript
export interface SystemContext {
    nodeVersion: string;
    os: { name: string; version: string; arch: string };
    serenityVersion: string;
    testRunner?: { name: string; version?: string };
    browsers: Array<{ name: string; version: string }>;
    ci?: CIContext;
}

export class SystemContextDetector {
    constructor(
        private readonly ciDetector: CIDetector = new CIDetector(),
    ) {}

    detect(): SystemContext {
        return {
            nodeVersion: process.version,
            os: {
                name: os.platform(),
                version: os.release(),
                arch: os.arch(),
            },
            serenityVersion: this.detectSerenityVersion(),
            ci: this.ciDetector.isCI() ? this.ciDetector.detect() : undefined,
        };
    }

    private detectSerenityVersion(): string {
        // Read from @serenity-js/core/package.json
    }
}
```

### CIDetector

Detects CI provider metadata from environment variables. Supports GitHub Actions, GitLab CI, Jenkins, CircleCI, and other common providers. Also injectable for testing.

Uses the `isCI()` / `detect()` guard pattern to avoid returning `undefined`:

```typescript
export interface CIContext {
    provider: string;
    buildNumber?: string;
    branch?: string;
    commit?: string;
    commitMessage?: string;
    jobUrl?: string;
}

export class CIDetector {
    constructor(private readonly env: Record<string, string | undefined> = process.env) {}

    isCI(): boolean {
        return Boolean(
            this.env.GITHUB_ACTIONS ||
            this.env.GITLAB_CI ||
            this.env.JENKINS_URL ||
            this.env.CIRCLECI
        );
    }

    detect(): CIContext {
        if (this.env.GITHUB_ACTIONS) {
            return {
                provider: 'GitHub Actions',
                buildNumber: this.env.GITHUB_RUN_NUMBER,
                branch: this.env.GITHUB_REF_NAME,
                commit: this.env.GITHUB_SHA?.slice(0, 8),
                jobUrl: `${this.env.GITHUB_SERVER_URL}/${this.env.GITHUB_REPOSITORY}/actions/runs/${this.env.GITHUB_RUN_ID}`,
            };
        }

        if (this.env.GITLAB_CI) {
            return {
                provider: 'GitLab CI',
                buildNumber: this.env.CI_PIPELINE_IID,
                branch: this.env.CI_COMMIT_REF_NAME,
                commit: this.env.CI_COMMIT_SHORT_SHA,
                commitMessage: this.env.CI_COMMIT_MESSAGE,
                jobUrl: this.env.CI_JOB_URL,
            };
        }

        if (this.env.JENKINS_URL) {
            return {
                provider: 'Jenkins',
                buildNumber: this.env.BUILD_NUMBER,
                branch: this.env.GIT_BRANCH,
                commit: this.env.GIT_COMMIT?.slice(0, 8),
                jobUrl: this.env.BUILD_URL,
            };
        }

        if (this.env.CIRCLECI) {
            return {
                provider: 'CircleCI',
                buildNumber: this.env.CIRCLE_BUILD_NUM,
                branch: this.env.CIRCLE_BRANCH,
                commit: this.env.CIRCLE_SHA1?.slice(0, 8),
                jobUrl: this.env.CIRCLE_BUILD_URL,
            };
        }

        throw new LogicError('CIDetector.detect() called when isCI() is false');
    }
}
```

Usage pattern — callers always guard with `isCI()` before calling `detect()`:

```typescript
const systemContext: SystemContext = {
    // ...
    ci: this.ciDetector.isCI() ? this.ciDetector.detect() : undefined,
};
```

### Run Label Resolution

The test run label displayed in the report's history pills is determined by:
1. CI build number if detected (e.g. `#142`) — short, fits naturally in a pill
2. Otherwise, a compact time-only format (e.g. `14:30` for same-day, `Jun 15` for older runs)

The full timestamp is always available in the tooltip for disambiguation.

```typescript
function resolveRunLabel(ci?: CIContext, startTimestamp?: string): string {
    if (ci?.buildNumber) {
        return `#${ci.buildNumber}`;
    }

    const date = new Date(startTimestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // e.g. "14:30"
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    // e.g. "Jun 15"
}
```

This keeps pills narrow (~5-6 characters) regardless of whether the user runs locally or on CI. The test scenario list view's run selector and trend chart x-axis both use this label. The full ISO timestamp is shown in tooltips and the Test Runs detail view.

> **TODO**: Revisit the local run label format once we have real data flowing through the template. The compact format may need adjustment for cases like multiple runs in the same hour, or users in locales where month/day ordering differs.

## Build-Time Template Bundling

The `packages/html-reporter/` build process has an additional step that produces the pre-bundled template:

1. **Input**: `template/index.html` (with CDN imports for dev)
2. **Process**: A build script (esbuild or custom Node.js script) replaces CDN `<script>` tags with inlined library code from `node_modules/`
3. **Output**: `bundle/template.ts` exporting the complete HTML as a string constant

```
// package.json scripts
"compile:template": "node scripts/bundle-template.js",
"compile": "npm run compile:template && npm run compile:clean && ..."
```

### Bundle Script (scripts/bundle-template.js)

```javascript
// Reads template/index.html
// For each CDN <script> import, replaces with the local library source from node_modules
// Outputs bundle/template.ts with: export default `<html>...</html>`;
```

### Dev Dependencies for Client-Side Libraries

```json
{
  "devDependencies": {
    "preact": "10.25.4",
    "htm": "3.1.1",
    "chart.js": "4.4.7",
    "chartjs-plugin-zoom": "2.2.0",
    "@tanstack/virtual-core": "3.13.6"
  }
}
```

These are `devDependencies` because they're consumed at build time (inlined into the template), not at runtime. Renovate will keep them updated via PRs with precise version bumps. Exact versions are used (no ranges) for reproducible builds.

## Data Model

### RunData (db.json)

```typescript
interface RunData {
    timestamp: string;              // ISO 8601 UTC
    duration: number;               // ms
    outcomes: OutcomeCounts;
    scenes: SceneRecord[];
    tags: TagRecord[];
    testRunner?: string;
    systemContext?: SystemContext;
}

interface SceneRecord {
    id: string;                     // unique within the run
    name: string;
    category: string;               // derived from requirements hierarchy
    outcome: string;                // SUCCESS | FAILURE | PENDING | SKIPPED | COMPROMISED | ERROR
    duration: number;               // ms
    startedAt: string;              // ISO 8601 UTC
    source: { path: string; line: number };
    tags: Array<{ type: string; name: string }>;
    activities: ActivityRecord[];
    error?: ErrorRecord;
    retries?: number;
    attempts?: AttemptRecord[];
    cast?: ActorRecord[];
    narrative?: string;
    artifacts?: Array<{ path: string; type: string; activityId?: string }>;
}
```

### ScenarioIdentity (cross-run correlation)

We use `ScenarioDetails` (from `@serenity-js/core/model`) as the basis for cross-run identity. It provides `name`, `category`, and `location` (file path + line). For correlation, we use `name + location.path` as the identity key:

```typescript
import type { ScenarioDetails } from '@serenity-js/core/model';

function identityOf(details: ScenarioDetails): string {
    return `${details.name.value}@${details.location.path.value}`;
}
```

Using `ScenarioDetails` directly (rather than inventing a custom identity type) means:
- The identity is derived from the same data already carried by `SceneStarts` events
- No additional mapping layer needed between event data and the correlation key
- `category` is available for grouping in the report UI but is not part of the identity (categories can be renamed without losing history)

We include `name` alongside `path` to handle files containing multiple tests. We exclude `line` because lines can shift when code above the test changes. We may revisit this when integrating with example projects that have parameterised tests or scenario outlines.

### DataSnapshot (data.js)

```typescript
interface DataSnapshot {
    summary: {
        title: string;
        totalScenarios: number;
        outcomes: OutcomeCounts;
        duration: number;
        startedAt: string;
        finishedAt: string;
        testRunner: string;
    };
    scenarios: EnrichedScene[];     // latest run scenes with executionHistory
    history: HistoryEntry[];        // one per run, chronological
    tags: TagRecord[];
    requirements?: RequirementsNode;
    unstableTests: UnstableTest[];
    newFailures: SceneSummary[];    // regressed since previous run
    newPasses: SceneSummary[];      // recovered since previous run
    systemContext?: SystemContext;
}
```

## Event Flow

```
TestRunStarts
  → Create Test_Run_Directory (fail-fast on permission error)
  → Record start timestamp

SceneStarts / ActivityStarts / ActivityFinished / SceneTagged / SceneFinished
  → Enqueue in DomainEventQueues (buffered per scene)

ActivityRelatedArtifactGenerated
  → Write artifact to Test_Run_Directory immediately
  → Track artifact path for later inclusion in db.json

TestRunFinishes
  → Emit AsyncOperationAttempted (CRITICAL: prevents test runner from exiting)
  → Process all event queues → RunData model
  → Write db.json to Test_Run_Directory
  → Read all test-runs/*/db.json (including the one just written)
  → Aggregate into DataSnapshot
  → Write data.js
  → Write index.html (from pre-bundled template)
  → Emit AsyncOperationCompleted (signals test runner it's safe to exit)
  → On error: Emit AsyncOperationFailed
```

### Why AsyncOperationAttempted is critical

The Serenity/JS `StageManager` tracks in-flight async operations. A test runner adapter (Playwright Test, WebdriverIO, etc.) will not call `process.exit()` while there are pending `AsyncOperationAttempted` events without a corresponding `AsyncOperationCompleted` or `AsyncOperationFailed`. Without emitting `AsyncOperationAttempted` before starting file I/O, the test runner could exit before the report is fully written to disk.

## Simplifications vs SerenityBDDReporter

| SerenityBDDReporter | HtmlReporter | Rationale |
|---|---|---|
| `EventQueueProcessors` with `SingleSceneEventQueueProcessor` and `SceneSequenceEventQueueProcessor` | Single `SceneDataCollector` that handles both regular scenes and scenario outlines | Our data format doesn't need separate processing — SceneSequences (Cucumber Scenario Outlines) produce multiple scene queues that share the same outline name; the collector groups them via retry/attempt semantics |
| Emits `ArtifactGenerated` back to stage for `ArtifactArchiver` to handle | Writes artifacts directly via `ArtifactWriter` | Self-contained; eliminates the ArtifactArchiver dependency |
| Complex Serenity BDD JSON schema (Java-compatible) | Simple JSON schema optimised for the report UI | No external tool compatibility needed |
| Synchronous event processing, async file I/O | Synchronous artifact writes (`storeSync`) | Ensures data is on disk before test runner exits; prevents data loss on crash |
| DomainEventQueues processed per-scene to emit ArtifactGenerated per report file | DomainEventQueues processed once at end to build a single RunData object | One output file per run instead of one per scene |

## Integration Tests

Integration tests for the HTML reporter are distributed across the existing test runner integration suites rather than concentrated in a single `integration/html-reporter/` directory. This mirrors how the reporter will actually be used — configured alongside each test runner — and avoids duplicating test infrastructure.

### Approach

Each existing integration module (e.g. `integration/playwright-test/`, `integration/cucumber-12/`, `integration/webdriverio/`) gains additional specs that:

1. **Configure the HtmlReporter** as part of the crew for that runner
2. **Run the existing test scenarios** (which already exercise various outcomes, retries, tags, etc.)
3. **Verify the output directory structure** — test-runs/ directory exists, db.json is valid, artifacts are present
4. **Open the generated report** in Playwright and verify key views render correctly

This means the HTML reporter is tested against real domain events produced by real test runners, not synthetic mocks.

### What lives in `integration/html-reporter/` (if anything)

A minimal dedicated module may still be useful for:
- Testing multi-run aggregation (run a suite twice, verify history)
- Testing `maxHistory` pruning behaviour
- Testing the report template UI interactions in isolation (with a known `data.js` fixture)

These are scenarios that don't naturally fit within a single-runner integration test.

## Package Configuration

```json
{
  "name": "@serenity-js/html-reporter",
  "peerDependencies": {
    "@serenity-js/core": "workspace:*"
  },
  "devDependencies": {
    "@serenity-js/core": "workspace:*",
    "preact": "10.25.4",
    "htm": "3.1.1",
    "chart.js": "4.4.7",
    "chartjs-plugin-zoom": "2.2.0",
    "@tanstack/virtual-core": "3.13.6",
    "typescript": "5.9.3"
  }
}
```

## Open Questions (to revisit during implementation)

1. ~~**Synchronous file I/O**~~: **Resolved** — Add a `storeSync()` method to `FileSystem` in `@serenity-js/core` with corresponding unit tests. The `ArtifactWriter` and `RunDataWriter` will use this for crash safety.
2. **Scene identity stability**: The `name + sourcePath` correlation key (derived from `ScenarioDetails`) will be validated against the monorepo example projects to confirm it handles parameterised tests and scenario outlines correctly.
3. **Video artifacts**: Large video files may arrive as file paths rather than base64 data. Need to verify how Playwright exposes video paths via domain events and whether we copy or symlink. Add an integration test in `integration/playwright-test/` to exercise video recording and attachment.
4. ~~**TestRunnerDetected enrichment**~~: **Resolved — start here.** Enrich the `TestRunnerDetected` event in `@serenity-js/core` with an optional `version` field (backwards-compatible additive change). Implement this first and validate across integration modules before starting the main HTML reporter work.

## Remaining Work

### Wire up to real projects (high priority)
- Configure the HTML reporter in `examples/playwright-test-todomvc` to produce real `data.js`
- Validate scene identity correlation works with parameterised tests and scenario outlines
- Remove mock `template/data.js` once examples produce real output

### Features not yet implemented
- `DataSnapshotAggregator`: derive per-scene `executionHistory` (correlating same test across runs by `name@path`)
- `DataSnapshotAggregator`: produce `newFailures` / `newPasses` (regressed/recovered tests)
- Requirements hierarchy derivation (reading spec directory structure)
- Cast/abilities collection from events
- Video/trace artifact handling (large file copy vs base64)
- `maxHistory` pruning integration test
- **Introduce `EnvironmentDetected` domain event**: Currently, the `SystemContextDetector` detects `environmentUnderTest` from `BASE_URL` / `TEST_ENV` environment variables. A cleaner approach would be to introduce a new domain event (e.g. `EnvironmentDetected` or `TestEnvironmentConfigured`) emitted by each test runner adapter, which would carry the `baseURL` directly from the runner's configuration (Playwright's `use.baseURL`, WebdriverIO's `baseUrl`, etc.). This would require changes to `@serenity-js/core` (new event), and each adapter package (`@serenity-js/playwright-test`, `@serenity-js/webdriverio`, `@serenity-js/mocha`, `@serenity-js/jasmine`, `@serenity-js/cucumber`) to emit the event. The `HtmlReporter` would then observe this event and include the value in the system context, eliminating the need for env var–based detection.

### Template bundling refinement
- The Preact/HTM/virtual-core IIFE inlining is a rough first pass — needs testing in the actual report rendered in a browser

### CI / packaging
- Add `@serenity-js/html-reporter` to Lerna publish configuration
- Add to CI test matrix
- Add to monorepo Nx project graph

### Documentation
- README.md for the package
- Usage examples in JSDoc

Based on the dependency graph and risk reduction, the implementation should proceed in this order:

1. **`@serenity-js/core`: Add `FileSystem.storeSync()`** — unit tests in `packages/core/spec/`
2. **`@serenity-js/core`: Enrich `TestRunnerDetected` with version** — update event, update adapters (playwright-test, webdriverio, cucumber, mocha, jasmine) to emit version, validate across integration modules
3. **`@serenity-js/html-reporter`: Scaffold package** — package.json, tsconfig, build scripts, template bundling pipeline
4. **`@serenity-js/html-reporter`: Implement core reporter** — HtmlReporter, ArtifactWriter, SceneDataCollector, RunDataWriter
5. **`@serenity-js/html-reporter`: Implement aggregation** — DataSnapshotAggregator, SystemContextDetector, CIDetector
6. **`@serenity-js/html-reporter`: Template bundling** — build script to inline libraries, ReportTemplateWriter
7. **Integration tests** — extend existing runner suites with HTML reporter configuration, add video attachment test to playwright-test
