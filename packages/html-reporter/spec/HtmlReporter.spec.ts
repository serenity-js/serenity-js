import type * as fs from 'node:fs';

import { expect } from '@integration/testing-tools';
import type { Cast, StageCrewMember } from '@serenity-js/core';
import { Clock, Duration, ErrorFactory, Stage, StageManager, Timestamp } from '@serenity-js/core';
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
import { FileSystem, FileSystemLocation, Path, Version } from '@serenity-js/core/io';
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
import { beforeEach, describe, it } from 'mocha';

import { ArtifactWriter } from '../src/ArtifactWriter.js';
import { HtmlReporter } from '../src/HtmlReporter.js';
import { ReportTemplateWriter } from '../src/ReportTemplateWriter.js';
import { RunDataWriter } from '../src/RunDataWriter.js';
import { SceneDataCollector } from '../src/SceneDataCollector.js';

describe('HtmlReporter', () => {

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
        const artifactWriter = new ArtifactWriter(outputFileSystem);
        const sceneDataCollector = new SceneDataCollector();
        const runDataWriter = new RunDataWriter(outputFileSystem);
        const templateWriter = new ReportTemplateWriter(outputFileSystem);

        const reporter = new HtmlReporter(artifactWriter, sceneDataCollector, runDataWriter, templateWriter, stage);

        return { reporter, filesystem };
    }

    beforeEach(() => {
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()), new ErrorFactory(), clock, interactionTimeout);
        recorder = new EventCollector();
        stage.assign(recorder);
    });

    describe('StageCrewMember integration', () => {

        it('implements the StageCrewMember interface via fromJSON builder', () => {
            const { reporter } = createReporter();

            expect(reporter).to.have.property('assignedTo');
            expect(reporter).to.have.property('notifyOf');
        });

        it('can be assigned to a stage', () => {
            const { reporter } = createReporter();
            const assigned = reporter.assignedTo(stage);

            expect(assigned).to.equal(reporter);
        });
    });

    describe('report generation', () => {

        it('creates a test run directory named with ISO 8601 timestamp on TestRunStarts', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z')).to.equal(true);
        });

        it('emits AsyncOperationAttempted before report generation on TestRunFinishes', () => {
            const { reporter } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const asyncAttempted = recorder.events.find(e => e instanceof AsyncOperationAttempted);
            expect(asyncAttempted).to.be.instanceOf(AsyncOperationAttempted);
        });

        it('emits AsyncOperationCompleted when report generation succeeds', () => {
            const { reporter } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const asyncCompleted = recorder.events.find(e => e instanceof AsyncOperationCompleted);
            expect(asyncCompleted).to.be.instanceOf(AsyncOperationCompleted);
        });

        it('writes db.json to the test run directory', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            const databaseJsonPath = '/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json';
            expect(filesystem.existsSync(databaseJsonPath)).to.equal(true);

            const content = JSON.parse(filesystem.readFileSync(databaseJsonPath, 'utf8') as string);
            expect(content).to.have.property('timestamp', '2024-06-15T14:30:00.000Z');
            expect(content).to.have.property('outcomes');
            expect(content).to.have.property('scenes').that.is.an('array');
        });

        it('writes index.html to the output directory', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            stage.announce(new TestRunStarts(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));
            stage.announce(new TestRunFinishes(new Timestamp(new Date('2024-06-15T14:30:00.000Z'))));

            expect(filesystem.existsSync('/reports/serenity-js/index.html')).to.equal(true);
        });

        it('does not modify existing test run directories', () => {
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
            ).to.equal('existing-data');

            // New directory created alongside
            expect(filesystem.existsSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json')).to.equal(true);
        });
    });

    describe('domain event collection', () => {

        it('records test runner name and version from TestRunnerDetected', () => {
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

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            expect(content.testRunner).to.equal('Playwright');
            expect(content.testRunnerVersion).to.equal('1.45.0');
        });

        it('records scene name, category, source location, and outcome', () => {
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

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            expect(content.scenes).to.have.lengthOf(1);

            const scene = content.scenes[0];
            expect(scene.name).to.equal('A passing test');
            expect(scene.category).to.equal('Login');
            expect(scene.outcome).to.deep.equal({ code: 64 });
            expect(scene.source).to.deep.equal({ path: 'features/login.feature', line: 10 });
            expect(scene.startedAt).to.equal('2024-06-15T14:30:00.000Z');
            expect(scene.duration).to.equal(100);
        });

        it('records tags from SceneTagged events', () => {
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

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            expect(content.scenes[0].tags).to.deep.include({ type: 'tag', name: 'smoke' });
            expect(content.tags).to.deep.include({ type: 'tag', name: 'smoke' });
        });

        it('builds activity tree from Task and Interaction events', () => {
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

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            const activities = content.scenes[0].activities;

            expect(activities).to.have.lengthOf(1);
            expect(activities[0].type).to.equal('Interaction');
            expect(activities[0].name).to.equal('Alice clicks button');
            expect(activities[0].outcome).to.deep.equal({ code: 64 });
            expect(activities[0].duration).to.equal(50);
        });

        it('records error details for failed activities', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const sceneId = CorrelationId.create();
            const activityId = CorrelationId.create();
            const startTime = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));
            const endTime = new Timestamp(new Date('2024-06-15T14:30:00.050Z'));
            const details = new ScenarioDetails(new Name('Failing test'), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));
            const activityDetails = new ActivityDetails(new Name('Verify'), new FileSystemLocation(Path.from('src/Verify.ts'), 10));

            const error = new Error('Expected true to equal false');
            error.name = 'AssertionError';
            error.stack = 'AssertionError: Expected true to equal false\n    at Verify (src/Verify.ts:10:5)';

            stage.announce(new TestRunStarts(startTime));
            stage.announce(new SceneStarts(sceneId, details, startTime));
            stage.announce(new InteractionStarts(sceneId, activityId, activityDetails, startTime));
            stage.announce(new InteractionFinished(sceneId, activityId, activityDetails, new ExecutionFailedWithAssertionError(error as any), endTime));
            stage.announce(new SceneFinished(sceneId, details, new ExecutionFailedWithAssertionError(error as any), endTime));
            stage.announce(new TestRunFinishes(endTime));

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            const activity = content.scenes[0].activities[0];

            expect(activity.outcome.code).to.equal(4);
            expect(activity.error.name).to.equal('AssertionError');
            expect(activity.error.message).to.equal('Expected true to equal false');
            expect(activity.error.stack).to.contain('Verify.ts:10:5');
        });

        it('summarises outcome counts across all scenes', () => {
            const { reporter, filesystem } = createReporter();
            
            stage.assign(reporter);

            const time = new Timestamp(new Date('2024-06-15T14:30:00.000Z'));

            stage.announce(new TestRunStarts(time));

            // Two passing, one failing
            for (const [name, outcome] of [
                ['Pass 1', new ExecutionSuccessful()],
                ['Pass 2', new ExecutionSuccessful()],
                ['Fail 1', new ExecutionFailedWithAssertionError(new Error('fail') as any)],
            ] as const) {
                const id = CorrelationId.create();
                const d = new ScenarioDetails(new Name(name), new Category('Suite'), new FileSystemLocation(Path.from('a.spec.ts'), 1));
                stage.announce(new SceneStarts(id, d, time));
                stage.announce(new SceneFinished(id, d, outcome, time));
            }

            stage.announce(new TestRunFinishes(time));

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            expect(content.outcomes.passed).to.equal(2);
            expect(content.outcomes.failed).to.equal(1);
            expect(content.outcomes.pending).to.equal(0);
        });

        it('correctly associates events with their respective scenes using correlation IDs', () => {
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

            const content = JSON.parse(filesystem.readFileSync('/reports/serenity-js/test-runs/2024-06-15T14:30:00.000Z/db.json', 'utf8') as string);
            expect(content.scenes).to.have.lengthOf(2);
            expect(content.scenes[0].name).to.equal('Scene A');
            expect(content.scenes[0].tags).to.deep.include({ type: 'tag', name: 'tag-a' });
            expect(content.scenes[1].name).to.equal('Scene B');
            expect(content.scenes[1].tags).to.deep.include({ type: 'tag', name: 'tag-b' });
        });
    });
});
