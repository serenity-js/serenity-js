import type * as fs from 'node:fs';

import { expect, test } from '@playwright/test';
import type { Cast, StageCrewMember } from '@serenity-js/core';
import { Clock, Duration, ErrorFactory, Stage, StageManager, Timestamp } from '@serenity-js/core';
import { AssertionError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    InteractionFinished,
    InteractionStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/events';
import { FileSystem, FileSystemLocation, ModuleLoader, Path, RequirementsHierarchy, Version } from '@serenity-js/core/io';
import {
    ActivityDetails,
    ArbitraryTag,
    Category,
    CorrelationId,
    ExecutionFailedWithAssertionError,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
} from '@serenity-js/core/model';
import { createFsFromVolume, Volume } from 'memfs';

import pkg from '../../package.json' with { type: 'json' };
import { SingleSourceAggregator } from '../../src/cli/aggregation/SingleSourceAggregator.js';
import { ArtifactWriter } from '../../src/cli/collection/ArtifactWriter.js';
import { CIDetector } from '../../src/cli/collection/CiDetector.js';
import { RunDataWriter } from '../../src/cli/collection/RunDataWriter.js';
import { SceneDataCollector } from '../../src/cli/collection/SceneDataCollector.js';
import { SystemContextDetector } from '../../src/cli/collection/SystemContextDetector.js';
import { detectModuleId, detectTestRunId, detectWorkerId, TestRunArchiver } from '../../src/cli/collection/TestRunArchiver.js';
import { HtmlReporter } from '../../src/cli/HtmlReporter.js';
import { HtmlReportGenerator } from '../../src/cli/HtmlReportGenerator.js';
import { ReportTemplateWriter } from '../../src/cli/reporting/ReportTemplateWriter.js';

test.describe('HtmlReporter', () => {

    const outputDirectory = Path.from('/reports/serenity-js');
    const clock = new Clock();
    const interactionTimeout = Duration.ofSeconds(2);

    class Extras implements Cast {
        prepare(actor) { return actor; }
    }

    class EventCollector implements StageCrewMember {
        readonly events: DomainEvent[] = [];
        assignedTo(stage: Stage): StageCrewMember { return this; }
        notifyOf(event: DomainEvent): void { this.events.push(event); }
    }

    let stage: Stage;
    let recorder: EventCollector;

    function createReporter(tree: Record<string, any> = {}): { reporter: HtmlReporter; filesystem: typeof fs } {
        const filesystem = createFsFromVolume(Volume.fromNestedJSON({
            [outputDirectory.value]: tree,
        }, '/')) as unknown as typeof fs;

        const outputFileSystem = new FileSystem(outputDirectory, filesystem);
        const rootFileSystem = new FileSystem(Path.from('/'), filesystem);
        const artifactWriter = new ArtifactWriter(outputFileSystem);
        const sceneDataCollector = new SceneDataCollector();
        const runDataWriter = new RunDataWriter(outputFileSystem);
        const aggregator = new SingleSourceAggregator(outputFileSystem, { consistencyWindow: 5 }, new RequirementsHierarchy(rootFileSystem), rootFileSystem, () => undefined);
        const templateWriter = new ReportTemplateWriter(outputFileSystem);
        const systemContextDetector = new SystemContextDetector(new CIDetector({}), new ModuleLoader(process.cwd()));

        const archiver = new TestRunArchiver({ artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector }, { testRunId: undefined, moduleId: undefined, attempt: 1 }, stage);
        const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);
        const reporter = new HtmlReporter(archiver, generator);

        return { reporter, filesystem };
    }

    function findRunDirectory(filesystem: typeof fs, startsWith: string): string {
        const directories = filesystem.readdirSync('/reports/serenity-js/test-runs') as string[];
        const match = directories.find(d => d.startsWith(startsWith));
        return match
            ? `/reports/serenity-js/test-runs/${ match }`
            : `/reports/serenity-js/test-runs/${ startsWith }`;
    }

    test.beforeEach(() => {
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()), new ErrorFactory(), clock, interactionTimeout);
        recorder = new EventCollector();
        stage.assign(recorder);
    });

    test.describe('StageCrewMember integration', () => {

        test('implements the StageCrewMember interface via fromJSON builder', () => {
            const { reporter } = createReporter();

            expect(reporter).toHaveProperty('assignedTo');
            expect(reporter).toHaveProperty('notifyOf');
        });

        test('can be assigned to a stage', () => {
            const { reporter } = createReporter();
            const assigned = reporter.assignedTo(stage);

            expect(assigned).toBe(reporter);
        });
    });

    test.describe('report generation', () => {

        test('creates a test run directory named with ISO 8601 timestamp on TestRunStarts', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const directories = filesystem.readdirSync('/reports/serenity-js/test-runs') as string[];
            const hasMatchingDirectory = directories.some(d => d.startsWith('2024-06-15T14-30-00.000Z'));
            expect(hasMatchingDirectory).toBe(true);
        });

        test('writes placeholder db.json on TestRunStarts with startedAt but no finishedAt', () => {
            const { reporter, filesystem } = createReporter();

            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const databaseJsonPath = findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json';
            expect(filesystem.existsSync(databaseJsonPath)).toBe(true);

            const content = JSON.parse(filesystem.readFileSync(databaseJsonPath, 'utf8') as string);
            expect(content.startedAt).toBe('2024-06-15T14:30:00.000Z');
            expect(content.finishedAt).toBeUndefined();
            expect(content.schemaVersion).toBe(1);
            expect(content.scenes).toEqual([]);
            expect(content.outcomes).toEqual({ passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 });
            expect(content.systemContext).toBeDefined();
            expect(content.testRunner).toBeUndefined();
        });

        test('overwrites placeholder with full db.json on TestRunFinishes including finishedAt', () => {
            const { reporter, filesystem } = createReporter();

            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunnerDetected(CorrelationId.create(), new Name('Playwright'), new Version('1.50.0'), new Timestamp(new Date('2024-06-15T14:30:00.100Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:01.000Z'))));

            const databaseJsonPath = findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json';
            const content = JSON.parse(filesystem.readFileSync(databaseJsonPath, 'utf8') as string);
            expect(content.startedAt).toBe('2024-06-15T14:30:00.000Z');
            expect(content.finishedAt).toBeDefined();
            expect(content.testRunner).toEqual({ name: 'Playwright', version: '1.50.0' });
        });

        test('stores explicit moduleId in placeholder and final db.json', () => {
            const filesystem = createFsFromVolume(Volume.fromNestedJSON({
                [outputDirectory.value]: {},
            }, '/')) as unknown as typeof fs;

            const outputFileSystem = new FileSystem(outputDirectory, filesystem);
            const rootFileSystem = new FileSystem(Path.from('/'), filesystem);
            const artifactWriter = new ArtifactWriter(outputFileSystem);
            const sceneDataCollector = new SceneDataCollector();
            const runDataWriter = new RunDataWriter(outputFileSystem);
            const systemContextDetector = new SystemContextDetector(new CIDetector({}), new ModuleLoader(process.cwd()));

            const archiver = new TestRunArchiver({ artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector }, { testRunId: '100', moduleId: 'webdriverio-8-web-devtools', attempt: 1 }, stage);
            const aggregator = new SingleSourceAggregator(outputFileSystem, { consistencyWindow: 5 }, new RequirementsHierarchy(rootFileSystem), rootFileSystem, () => undefined);
            const templateWriter = new ReportTemplateWriter(outputFileSystem);
            const reporter = new HtmlReporter(archiver, new HtmlReportGenerator(aggregator, templateWriter, stage));

            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            // Placeholder should include moduleId
            const runDirectory = findRunDirectory(filesystem, '100') + '/webdriverio-8-web-devtools-1';
            const placeholderContent = JSON.parse(filesystem.readFileSync(runDirectory + '/db.json', 'utf8') as string);
            expect(placeholderContent.moduleId).toBe('webdriverio-8-web-devtools');

            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:01.000Z'))));

            // Final db.json should also include moduleId
            const finalContent = JSON.parse(filesystem.readFileSync(runDirectory + '/db.json', 'utf8') as string);
            expect(finalContent.moduleId).toBe('webdriverio-8-web-devtools');
        });

        test('emits AsyncOperationAttempted before report generation on TestRunFinishes', () => {
            const { reporter } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const asyncAttempted = recorder.events.find(e => e instanceof AsyncOperationAttempted);
            expect(asyncAttempted).toBeInstanceOf(AsyncOperationAttempted);
        });

        test('emits AsyncOperationCompleted when report generation succeeds', () => {
            const { reporter } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const asyncCompleted = recorder.events.find(e => e instanceof AsyncOperationCompleted);
            expect(asyncCompleted).toBeInstanceOf(AsyncOperationCompleted);
        });

        test('writes db.json to the test run directory', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const databaseJsonPath = findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json';
            expect(filesystem.existsSync(databaseJsonPath)).toBe(true);

            const content = JSON.parse(filesystem.readFileSync(databaseJsonPath, 'utf8') as string);
            expect(content).toHaveProperty('startedAt');
            expect(content).toHaveProperty('outcomes');
            expect(Array.isArray(content.scenes)).toBe(true);
        });

        test('writes index.html to the output directory', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            expect(filesystem.existsSync('/reports/serenity-js/index.html')).toBe(true);
        });

        test('does not modify existing test run directories', () => {
            const { reporter, filesystem } = createReporter({
                'test-runs': {
                    '2024-06-14T10:00:00.000Z': {
                        'db.json': '{"timestamp":"2024-06-14T10:00:00.000Z"}',
                        'screenshot-001.png': 'existing-data',
                    },
                },
            });

            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            // Existing data untouched
            expect(
                filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-14T10:00:00.000Z/screenshot-001.png', 'utf8'),
            ).toBe('existing-data');

            // New directory created alongside
            const newRunDirectory = findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z');
            expect(filesystem.existsSync(`${ newRunDirectory }/db.json`)).toBe(true);
        });

        test('includes system context in db.json', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            expect(content).toHaveProperty('systemContext');
            expect(content.systemContext).toHaveProperty('nodeVersion', process.version);
            expect(content.systemContext.os).toHaveProperty('arch');
            expect(content.systemContext).toHaveProperty('serenityVersion', pkg.version);
            expect(content.systemContext.runtime).toHaveProperty('provider');
        });

        test('includes capabilities hierarchy in data.js when specDirectory is configured', () => {
            const projectFs = createFsFromVolume(Volume.fromNestedJSON({
                '/project': { spec: { 'readme.md': '**Project** narrative', 'example.spec.ts': '' } }
            }, '/')) as unknown as typeof fs;
            const projectFileSystem = new FileSystem(Path.from('/project'), projectFs);
            const hierarchy = new RequirementsHierarchy(projectFileSystem, Path.from('spec'));

            const reportFs = createFsFromVolume(Volume.fromNestedJSON({
                [outputDirectory.value]: {},
            }, '/')) as unknown as typeof fs;
            const outputFileSystem = new FileSystem(outputDirectory, reportFs);
            const aggregator = new SingleSourceAggregator(outputFileSystem, { consistencyWindow: 5, buildCapabilities: true }, hierarchy, projectFileSystem, () => undefined);
            const artifactWriter = new ArtifactWriter(outputFileSystem);
            const sceneDataCollector = new SceneDataCollector();
            const runDataWriter = new RunDataWriter(outputFileSystem);
            const templateWriter = new ReportTemplateWriter(outputFileSystem);
            const systemContextDetector = new SystemContextDetector(new CIDetector({}), new ModuleLoader(process.cwd()));
            const archiver = new TestRunArchiver({ artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector }, { testRunId: undefined, moduleId: undefined, attempt: 1 }, stage);
            const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);
            const reporter = new HtmlReporter(archiver, generator);

            stage.assign(reporter);

            const scenarioDetails = new ScenarioDetails(new Name('should work'), new Category('Example'), new FileSystemLocation(Path.from('/project/spec/example.spec.ts'), 1, 1));
            const sceneId = CorrelationId.create();

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new SceneStarts(sceneId, scenarioDetails, new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new SceneFinished(sceneId, scenarioDetails, new ExecutionSuccessful(), new Timestamp(new Date('2024-06-15T14:30:00.100Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.200Z'))));

            const dataJs = reportFs.readFileSync('/reports/serenity-js/data.js', 'utf8') as string;
            const data = JSON.parse(dataJs.replace(/^window\.__SERENITY_REPORT_DATA__\s*=\s*/, '').replace(/;\s*$/, ''));

            expect(data.capabilities).toBeDefined();
            expect(data.capabilities.name).toBe('spec');
            expect(data.capabilities.readme).toContain('<strong>Project</strong>');
            expect(data.capabilities.scenarioCount).toBe(1);
            expect(data.capabilities.outcomes.passed).toBe(1);
            expect(data.capabilities.children).toHaveLength(1);
            expect(data.capabilities.children[0].name).toBe('example');
        });
    });

    test.describe('domain event collection', () => {

        test('records test runner name and version from TestRunnerDetected', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const sceneId = CorrelationId.create();
            const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const details = new ScenarioDetails(new Name('Test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));

            stage.announce(new TestRunStarts(time));
            stage.announce(new SceneStarts(sceneId, details, time));
            stage.announce(new TestRunnerDetected(sceneId, new Name('Playwright'), new Version('1.45.0'), time));
            stage.announce(new SceneFinished(sceneId, details, new ExecutionSuccessful(), time));
            stage.announce(new TestRunFinishes(time));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            expect(content.testRunner).toEqual({ name: 'Playwright', version: '1.45.0' });
        });

        test('records scene name, category, source location, and outcome', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const sceneId = CorrelationId.create();
            const startTime = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const endTime = new Timestamp(new Date('2024-06-15T14:30:00.100Z'));
            const details = new ScenarioDetails(
                new Name('A passing test'),
                new Category('Login'),
                new FileSystemLocation(Path.from('features/login.feature'), 10),
            );

            stage.announce(new TestRunStarts(startTime));
            stage.announce(new SceneStarts(sceneId, details, startTime));
            stage.announce(new SceneFinished(sceneId, details, new ExecutionSuccessful(), endTime));
            stage.announce(new TestRunFinishes(endTime));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            expect(content.scenes).toHaveLength(1);

            const scene = content.scenes[0];
            expect(scene.name).toBe('A passing test');
            expect(scene.category).toBe('Login');
            expect(scene.outcome).toEqual({ code: 64 });
            expect(scene.source).toEqual({ path: 'features/login.feature', line: 10 });
            expect(scene.startedAt).toBe('2024-06-15T14:30:00.000Z');
            expect(scene.duration).toBe(100);
        });

        test('records tags from SceneTagged events', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const sceneId = CorrelationId.create();
            const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const details = new ScenarioDetails(new Name('Test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));

            stage.announce(new TestRunStarts(time));
            stage.announce(new SceneStarts(sceneId, details, time));
            stage.announce(new SceneTagged(sceneId, new ArbitraryTag('smoke'), time));
            stage.announce(new SceneFinished(sceneId, details, new ExecutionSuccessful(), time));
            stage.announce(new TestRunFinishes(time));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            expect(content.scenes[0].tags).toContainEqual({ type: 'tag', name: 'smoke' });
            expect(content.tags).toContainEqual({ type: 'tag', name: 'smoke' });
        });

        test('builds activity tree from Task and Interaction events', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const startTime = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const endTime = new Timestamp(new Date('2024-06-15T14:30:00.050Z'));
            const details = new ScenarioDetails(new Name('Test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));
            const activityDetails = new ActivityDetails(new Name('Alice clicks button'), new FileSystemLocation(Path.from('src/Click.ts'), 20));

            stage.announce(new TestRunStarts(startTime));
            stage.announce(new SceneStarts(sceneId, details, startTime));
            stage.announce(new InteractionStarts(sceneId, activityId, activityDetails, startTime));
            stage.announce(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionSuccessful(), endTime));
            stage.announce(new SceneFinished(sceneId, details, new ExecutionSuccessful(), endTime));
            stage.announce(new TestRunFinishes(endTime));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            const activities = content.scenes[0].activities;

            expect(activities).toHaveLength(1);
            expect(activities[0].type).toBe('Interaction');
            expect(activities[0].name).toBe('Alice clicks button');
            expect(activities[0].outcome).toEqual({ code: 64 });
            expect(activities[0].duration).toBe(50);
        });

        test('records error details for failed activities', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const startTime = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const endTime = new Timestamp(new Date('2024-06-15T14:30:00.050Z'));
            const details = new ScenarioDetails(new Name('Failing test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));
            const activityDetails = new ActivityDetails(new Name('Verify'), new FileSystemLocation(Path.from('src/Verify.ts'), 10));

            const error = new AssertionError('Expected true to equal false');
            error.stack = 'AssertionError: Expected true to equal false\n    at Verify (src/Verify.ts:10:5)';

            stage.announce(new TestRunStarts(startTime));
            stage.announce(new SceneStarts(sceneId, details, startTime));
            stage.announce(new InteractionStarts(sceneId, activityId, activityDetails, startTime));
            stage.announce(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionFailedWithAssertionError(error), endTime));
            stage.announce(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(error), endTime));
            stage.announce(new TestRunFinishes(endTime));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            const activity = content.scenes[0].activities[0];

            expect(activity.outcome.code).toBe(4);
            expect(activity.error.name).toBe('AssertionError');
            expect(activity.error.message).toBe('Expected true to equal false');
            expect(activity.error.stack).toContain('Verify.ts:10:5');
        });

        test('summarises outcome counts across all scenes', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));

            stage.announce(new TestRunStarts(time));

            // Two passing, one failing
            for (const [name, outcome] of [
                ['Pass 1', new ExecutionSuccessful()],
                ['Pass 2', new ExecutionSuccessful()],
                ['Fail 1', new ExecutionFailedWithAssertionError(new AssertionError('fail'))],
            ] as const) {
                const id = CorrelationId.create();
                const d = new ScenarioDetails(new Name(name), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));
                stage.announce(new SceneStarts(id, d, time));
                stage.announce(new SceneFinished(id, d, outcome, time));
            }

            stage.announce(new TestRunFinishes(time));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            expect(content.outcomes.passed).toBe(2);
            expect(content.outcomes.failed).toBe(1);
            expect(content.outcomes.pending).toBe(0);
        });

        test('correctly associates events with their respective scenes using correlation IDs', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const endTime = new Timestamp(new Date('2024-06-15T14:30:00.050Z'));

            const scene1Id = CorrelationId.create();
            const scene2Id = CorrelationId.create();
            const details1 = new ScenarioDetails(new Name('Scene A'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));
            const details2 = new ScenarioDetails(new Name('Scene B'), new Category('Suite'), new FileSystemLocation(Path.from('b.spec.ts'), 1));

            stage.announce(new TestRunStarts(time));
            stage.announce(new SceneStarts(scene1Id, details1, time));
            stage.announce(new SceneStarts(scene2Id, details2, time));
            stage.announce(new SceneTagged(scene1Id, new ArbitraryTag('tag-a'), time));
            stage.announce(new SceneTagged(scene2Id, new ArbitraryTag('tag-b'), time));
            stage.announce(new SceneFinished(scene1Id, details1, new ExecutionSuccessful(), endTime));
            stage.announce(new SceneFinished(scene2Id, details2, new ExecutionSuccessful(), endTime));
            stage.announce(new TestRunFinishes(endTime));

            const content = JSON.parse(filesystem.readFileSync(findRunDirectory(filesystem, '2024-06-15T14-30-00.000Z') + '/db.json', 'utf8') as string);
            expect(content.scenes).toHaveLength(2);
            expect(content.scenes[0].name).toBe('Scene A');
            expect(content.scenes[0].tags).toContainEqual({ type: 'tag', name: 'tag-a' });
            expect(content.scenes[1].name).toBe('Scene B');
            expect(content.scenes[1].tags).toContainEqual({ type: 'tag', name: 'tag-b' });
        });
    });

    test.describe('CI environment detection', () => {

        test('uses GITHUB_RUN_NUMBER as testRunId when not explicitly configured', () => {
            const originalEnvironment = process.env.GITHUB_RUN_NUMBER;
            process.env.GITHUB_RUN_NUMBER = '8265';

            try {
                const filesystem = createFsFromVolume(Volume.fromNestedJSON({
                    [outputDirectory.value]: {},
                }, '/')) as unknown as typeof fs;
                const outputFileSystem = new FileSystem(outputDirectory, filesystem);
                const artifactWriter = new ArtifactWriter(outputFileSystem);
                const sceneDataCollector = new SceneDataCollector();
                const runDataWriter = new RunDataWriter(outputFileSystem);
                const systemContextDetector = new SystemContextDetector(new CIDetector(process.env), new ModuleLoader(process.cwd()));

                // Mimics HtmlReporterBuilder with no explicit testRunId
                const archiver = new TestRunArchiver({ artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector }, { testRunId: detectTestRunId(), moduleId: detectModuleId(), attempt: 1 }, stage);
                const rootFileSystem = new FileSystem(Path.from('/'), filesystem);
                const aggregator = new SingleSourceAggregator(outputFileSystem, { consistencyWindow: 5 }, new RequirementsHierarchy(rootFileSystem), rootFileSystem, () => undefined);
                const templateWriter = new ReportTemplateWriter(outputFileSystem);
                const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);
                const reporter = new HtmlReporter(archiver, generator);

                stage.assign(reporter);

                const sceneId = CorrelationId.create();
                const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
                const details = new ScenarioDetails(new Name('Test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));

                stage.announce(new TestRunStarts(time));
                stage.announce(new SceneStarts(sceneId, details, time));
                stage.announce(new SceneFinished(sceneId, details, new ExecutionSuccessful(), time));
                stage.announce(new TestRunFinishes(time));

                // Directory should be named with the build number, not a timestamp
                const directories = filesystem.readdirSync('/reports/serenity-js/test-runs') as string[];
                expect(directories.some(d => d === '8265')).toBe(true);
            } finally {
                if (originalEnvironment === undefined) {
                    delete process.env.GITHUB_RUN_NUMBER;
                } else {
                    process.env.GITHUB_RUN_NUMBER = originalEnvironment;
                }
            }
        });

        test('falls back to ISO timestamp directory name when no CI env vars are set', () => {
            const originalEnvironment = process.env.GITHUB_RUN_NUMBER;
            delete process.env.GITHUB_RUN_NUMBER;

            try {
                const filesystem = createFsFromVolume(Volume.fromNestedJSON({
                    [outputDirectory.value]: {},
                }, '/')) as unknown as typeof fs;
                const outputFileSystem = new FileSystem(outputDirectory, filesystem);
                const artifactWriter = new ArtifactWriter(outputFileSystem);
                const sceneDataCollector = new SceneDataCollector();
                const runDataWriter = new RunDataWriter(outputFileSystem);
                const systemContextDetector = new SystemContextDetector(new CIDetector(process.env), new ModuleLoader(process.cwd()));

                // Mimics HtmlReporterBuilder with no explicit testRunId and no env vars
                const archiver = new TestRunArchiver({ artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector }, { testRunId: detectTestRunId(), moduleId: detectModuleId(), attempt: 1 }, stage);
                const rootFileSystem2 = new FileSystem(Path.from('/'), filesystem);
                const aggregator = new SingleSourceAggregator(outputFileSystem, { consistencyWindow: 5 }, new RequirementsHierarchy(rootFileSystem2), rootFileSystem2, () => undefined);
                const templateWriter = new ReportTemplateWriter(outputFileSystem);
                const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);
                const reporter = new HtmlReporter(archiver, generator);

                stage.assign(reporter);

                const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
                const sceneId = CorrelationId.create();
                const details = new ScenarioDetails(new Name('Test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));

                stage.announce(new TestRunStarts(time));
                stage.announce(new SceneStarts(sceneId, details, time));
                stage.announce(new SceneFinished(sceneId, details, new ExecutionSuccessful(), time));
                stage.announce(new TestRunFinishes(time));

                // Directory should be named with a timestamp
                const directories = filesystem.readdirSync('/reports/serenity-js/test-runs') as string[];
                expect(directories.some(d => d.startsWith('2024-06-15'))).toBe(true);
            } finally {
                if (originalEnvironment === undefined) {
                    delete process.env.GITHUB_RUN_NUMBER;
                } else {
                    process.env.GITHUB_RUN_NUMBER = originalEnvironment;
                }
            }
        });

        test('detects WDIO_WORKER_ID when running in WebdriverIO parallel mode', () => {
            const originalWorkerId = process.env.WDIO_WORKER_ID;
            process.env.WDIO_WORKER_ID = '0-5';

            try {
                expect(detectWorkerId()).toBe('0-5');
            } finally {
                if (originalWorkerId === undefined) {
                    delete process.env.WDIO_WORKER_ID;
                } else {
                    process.env.WDIO_WORKER_ID = originalWorkerId;
                }
            }
        });

        test('returns undefined when WDIO_WORKER_ID is not set', () => {
            const originalWorkerId = process.env.WDIO_WORKER_ID;
            delete process.env.WDIO_WORKER_ID;

            try {
                expect(detectWorkerId()).toBeUndefined();
            } finally {
                if (originalWorkerId === undefined) {
                    delete process.env.WDIO_WORKER_ID;
                } else {
                    process.env.WDIO_WORKER_ID = originalWorkerId;
                }
            }
        });
    });
});
