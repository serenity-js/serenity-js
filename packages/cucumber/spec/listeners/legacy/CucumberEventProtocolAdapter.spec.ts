
import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { ImplementationPendingError, Serenity } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TaskFinished, TaskStarts, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { FileSystemLocation, ModuleLoader, Path, Version } from '@serenity-js/core/lib/io';
import { Category, ExecutionFailedWithError, ExecutionSkipped, ExecutionSuccessful, FeatureTag, ImplementationPending, Name, ScenarioDetails } from '@serenity-js/core/lib/model';
import { EventEmitter } from 'events';
import { beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';
import type { JSONObject } from 'tiny-types';

import { AmbiguousStepDefinitionError } from '../../../src/errors';
import { createListener } from '../../../src/listeners/legacy';

describe('CucumberEventProtocolAdapter', () => {

    type CucumberHook = (event?: object) =>
    Promise<void> | void;

    let afterHook: CucumberHook;

    const fakeCucumber = {
        BeforeAll: (hook: CucumberHook) => Promise.resolve(hook()),
        Before: (hook: CucumberHook) => Promise.resolve(hook()),
        After: (hook: CucumberHook) => { afterHook = hook; },
        AfterAll: (hook: CucumberHook) => Promise.resolve(hook()),
    };

    let recorder: EventRecorder,
        serenity: Serenity,
        log: typeof console.log,
        eventBroadcaster: EventEmitter,
        moduleLoader: sinon.SinonStubbedInstance<ModuleLoader>,
        adapter_: any;

    beforeEach(() => {

        log      = sinon.spy();
        moduleLoader = sinon.createStubInstance(ModuleLoader);
        serenity = new Serenity();
        recorder = new EventRecorder();
        eventBroadcaster = new EventEmitter();

        serenity.configure({
            crew: [recorder],
        });

        moduleLoader.hasAvailable.withArgs('@cucumber/cucumber').returns(false);

        moduleLoader.hasAvailable.withArgs('cucumber').returns(true);
        moduleLoader.versionOf.withArgs('cucumber').returns(new Version('5.0.0'));
        moduleLoader.require.withArgs('cucumber').returns(fakeCucumber);

        const listener = createListener(serenity, moduleLoader);

        adapter_ = new listener({ eventBroadcaster, log });
    });

    it('correctly recognises Cucumber Event Protocol events', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({ result: { duration: 2, status: 'passed' } }));

        emitAllFrom(require('./samples/scenario-with-hooks.json'));

        const expectedScenarioDetails = new ScenarioDetails(
            new Name('Hooks'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/tasty-cucumber.feature'),
                3,
                3,
            ),
        );

        return serenity.waitForNextCue().then(() => {
            PickEvent.from(recorder.events)
                .next(SceneStarts,          e => expect(e.details).to.equal(expectedScenarioDetails))
                .next(TestRunnerDetected,   e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged,          e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts,           e => expect(e.details.name).to.equal(new Name('Given I have a tasty cucumber in my belly')))
                .next(TaskFinished,         e => {
                    expect(e.details.name).to.equal(new Name('Given I have a tasty cucumber in my belly'));
                    expect(e.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TaskStarts,           e => expect(e.details.name).to.equal(new Name(`Then I'm very happy`)))
                .next(TaskFinished,         e => {
                    expect(e.details.name).to.equal(new Name(`Then I'm very happy`));
                    expect(e.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(SceneFinished,        e => {
                    expect(e.details).to.equal(expectedScenarioDetails);
                    expect(e.outcome).to.equal(new ExecutionSuccessful());
                })
            ;
        });
    });

    it('correctly recognises undefined steps', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({ result: { duration: 0, status: 'undefined' } }));

        emitAllFrom(require('./samples/scenario-with-undefined-steps.json'));

        const expectedScenarioDetails = new ScenarioDetails(
            new Name('Undefined steps'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/undefined-steps.feature'),
                3,
                3,
            ),
        );

        return serenity.waitForNextCue().then(() => {

            PickEvent.from(recorder.events)
                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I have an undefined step')))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Given I have an undefined step'));
                    expect(e.outcome).to.be.instanceOf(ImplementationPending);
                })
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name(`Then I should implement it`)))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Then I should implement it'));
                    expect(e.outcome).to.be.instanceOf(ImplementationPending);
                })
                .next(SceneFinished, e => {
                    expect(e.details).to.equal(expectedScenarioDetails);
                    expect(e.outcome).to.be.instanceOf(ImplementationPending);
                })
            ;
        });
    });

    it('correctly recognises pending steps', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({ result: { duration: 0, status: 'pending' } }));

        emitAllFrom(require('./samples/scenario-with-pending-steps.json'));

        const expectedScenarioDetails = new ScenarioDetails(
            new Name('Pending steps'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/pending-steps.feature'),
                3,
                3,
            ),
        );

        return serenity.waitForNextCue().then(() => {

            PickEvent.from(recorder.events)
                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I have a pending step')))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Given I have a pending step'));
                    expect(e.outcome).to.be.instanceOf(ImplementationPending);
                })
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name(`Then I should implement it`)))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Then I should implement it'));
                    expect(e.outcome).to.be.instanceOf(ExecutionSkipped);
                })
                .next(SceneFinished, e => {
                    expect(e.details).to.equal(expectedScenarioDetails);
                    expect(e.outcome).to.be.instanceOf(ImplementationPending);
                })
            ;
        });
    });

    it('correctly recognises ambiguous steps', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({
            result: {
                duration: 0,
                status: 'ambiguous',
                exception: 'Multiple step definitions match:\n  /^I have an ambiguous step definition$/ - step_definitions/ambiguous.steps.ts:3\n  /^I have an ambiguous step definition$/ - step_definitions/ambiguous.steps.ts:7'
            },
        }));

        emitAllFrom(require('./samples/scenario-with-ambiguous-steps.json'));

        const expectedScenarioDetails = new ScenarioDetails(
            new Name('Ambiguous steps'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/ambiguous-steps.feature'),
                3,
                3,
            ),
        );

        return serenity.waitForNextCue().then(() => {
            PickEvent.from(recorder.events)
                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I have an ambiguous step definition')))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Given I have an ambiguous step definition'));
                    expect(e.outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect((e.outcome as ExecutionFailedWithError).error).to.be.instanceOf(AmbiguousStepDefinitionError);
                })
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name(`Then I should correct it`)))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Then I should correct it'));
                    expect(e.outcome).to.be.instanceOf(ExecutionSkipped);
                })
                .next(SceneFinished, e => {
                    expect(e.details).to.equal(expectedScenarioDetails);
                    expect(e.outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect((e.outcome as ExecutionFailedWithError).error).to.be.instanceOf(AmbiguousStepDefinitionError);
                })
            ;
        });
    });

    it('correctly recognises errors thrown in steps', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({
            result: {
                duration: 0,
                status: 'failed',
                exception: `Error: We're sorry, something happened\n    at World.<anonymous> (step_definitions/errors.steps.ts:4:11)`
            },
        }));

        emitAllFrom(require('./samples/scenario-with-errors.json'));

        const expectedScenarioDetails = new ScenarioDetails(
            new Name('Errors in steps'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/errors-in-steps.feature'),
                3,
                3,
            ),
        );

        return serenity.waitForNextCue().then(() => {

            PickEvent.from(recorder.events)
                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I have a step that throws an error')))
                .next(TaskFinished, e => {
                    expect(e.details.name).to.equal(new Name('Given I have a step that throws an error'));
                    expect(e.outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect((e.outcome as ExecutionFailedWithError).error).to.be.instanceOf(Error);
                    expect((e.outcome as ExecutionFailedWithError).error.message).to.equal(`We're sorry, something happened`);
                })
                .next(SceneFinished, e => {
                    expect(e.details).to.equal(expectedScenarioDetails);
                    expect(e.outcome).to.be.instanceOf(ExecutionFailedWithError);
                    expect((e.outcome as ExecutionFailedWithError).error).to.be.instanceOf(Error);
                    expect((e.outcome as ExecutionFailedWithError).error.message).to.equal(`We're sorry, something happened`);
                })
            ;
        });
    });

    it('correctly recognises scenario outlines', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({
            result: {
                duration: 0,
                status: 'passed',
            },
        }));

        emitAllFrom(require('./samples/scenario-outline.json'));

        const expectedScenarioDetails = (line: number) => new ScenarioDetails(
            new Name('The things I like'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/outlines.feature'),
                line,
                7,
            ),
        );

        return serenity.waitForNextCue().then(() => {

            PickEvent.from(recorder.events)
                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails(10)))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I like programming')))
                .next(TaskFinished, e => expect(e.details.name).to.equal(new Name('Given I like programming')))
                .next(SceneFinished, e => expect(e.details).to.equal(expectedScenarioDetails(10)))

                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails(11)))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I like to play guitar')))
                .next(TaskFinished, e => expect(e.details.name).to.equal(new Name('Given I like to play guitar')))
                .next(SceneFinished, e => expect(e.details).to.equal(expectedScenarioDetails(11)))

                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails(12)))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(TaskStarts, e => expect(e.details.name).to.equal(new Name('Given I like martial arts')))
                .next(TaskFinished, e => expect(e.details.name).to.equal(new Name('Given I like martial arts')))
                .next(SceneFinished, e => expect(e.details).to.equal(expectedScenarioDetails(12)))
            ;
        });
    });

    it('considers a scenario with no steps and no hooks to be pending implementation', () => {

        eventBroadcaster.on('test-case-finished', () => afterHook({
            result: {
                duration: 0,
                status: 'passed',
            },
        }));

        emitAllFrom(require('./samples/pending-scenario.json'));

        const expectedScenarioDetails = new ScenarioDetails(
            new Name('Implement me'),
            new Category('Event Protocol'),
            new FileSystemLocation(
                new Path('features/pending-scenario.feature'),
                3,
                3,
            ),
        );

        return serenity.waitForNextCue().then(() => {

            PickEvent.from(recorder.events)
                .next(SceneStarts, e => expect(e.details).to.equal(expectedScenarioDetails))
                .next(TestRunnerDetected, e => expect(e.name).to.equal(new Name('JS')))
                .next(SceneTagged, e => expect(e.tag).to.equal(new FeatureTag('Event Protocol')))
                .next(SceneFinished, e => {
                    expect(e.details).to.equal(expectedScenarioDetails);
                    expect(e.outcome).to.be.instanceOf(ImplementationPending);
                    expect((e.outcome as ImplementationPending).error).to.be.instanceOf(ImplementationPendingError);
                    expect((e.outcome as ImplementationPending).error.message).to.equal(`"Implement me" has no test steps`);
                })
            ;
        });
    });

    function emitAllFrom(events: JSONObject[]): void {
        events.forEach(event => {
            const { type, ...body } = event;
            eventBroadcaster.emit(type as string, body);
        });
    }
});
