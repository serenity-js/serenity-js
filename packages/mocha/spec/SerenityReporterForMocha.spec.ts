import { EventEmitter } from 'node:events';

import { EventRecorder, expect } from '@integration/testing-tools';
import { Serenity } from '@serenity-js/core';
import {
    SceneFinished,
    SceneStarts,
    TestRunnerDetected,
} from '@serenity-js/core/events';
import { FileSystem, Path, RequirementsHierarchy, Version } from '@serenity-js/core/io';
import { ExecutionFailedWithError, ExecutionSuccessful, ImplementationPending } from '@serenity-js/core/model';
import type { Test } from 'mocha';
import { beforeEach, describe, it } from 'mocha';
import { Runner } from 'mocha';

import { SerenityReporterForMocha } from '../src/SerenityReporterForMocha.js';

describe('SerenityReporterForMocha', () => {

    describe('in parallel mode', () => {

        let serenity: Serenity;
        let recorder: EventRecorder;

        beforeEach(() => {
            serenity = new Serenity();
            recorder = new EventRecorder();
            serenity.configure({ crew: [recorder] });
        });

        function createParallelRunner(): any {
            const runner = new EventEmitter();
            (runner as any).isParallelMode = () => true;
            (runner as any).suite = { afterEach: () => void 0 };
            return runner;
        }

        function createReporter(runner: any): SerenityReporterForMocha {
            const cwd = Path.from('/fake/path');
            const requirementsHierarchy = new RequirementsHierarchy(new FileSystem(cwd));
            const mochaVersion = new Version('11.0.0');

            return new SerenityReporterForMocha(serenity, requirementsHierarchy, mochaVersion, runner);
        }

        function parallelTest(overrides: Partial<Test> = {}): Test {
            return {
                title: 'passes',
                file: '/fake/path/spec/example.spec.ts',
                state: 'passed',
                pending: false,
                duration: 10,
                slow: () => 75,
                isPassed: () => true,
                isFailed: () => false,
                isPending: () => false,
                fullTitle: () => 'A feature passes',
                parent: { title: 'A feature', root: false, parent: { title: '', root: true } },
                ...overrides,
            } as unknown as Test;
        }

        it('emits SceneStarts when a test begins', () => {
            const runner = createParallelRunner();
            createReporter(runner);

            runner.emit(Runner.constants.EVENT_RUN_BEGIN);
            runner.emit(Runner.constants.EVENT_TEST_BEGIN, parallelTest());

            const sceneStarts = recorder.events.filter(e => e instanceof SceneStarts);
            expect(sceneStarts).to.have.lengthOf(1);
        });

        it('emits SceneFinished when a test passes', () => {
            const runner = createParallelRunner();
            createReporter(runner);

            const test = parallelTest();
            runner.emit(Runner.constants.EVENT_RUN_BEGIN);
            runner.emit(Runner.constants.EVENT_TEST_BEGIN, test);
            runner.emit(Runner.constants.EVENT_TEST_PASS, test);

            const sceneFinished = recorder.events.filter(e => e instanceof SceneFinished);
            expect(sceneFinished).to.have.lengthOf(1);
            expect(sceneFinished[0].outcome).to.be.instanceOf(ExecutionSuccessful);
        });

        it('emits SceneFinished with error outcome when a test fails', () => {
            const runner = createParallelRunner();
            createReporter(runner);

            const error = new Error('Something went wrong');
            const test = parallelTest({ state: 'failed', isPassed: () => false, isFailed: () => true });
            runner.emit(Runner.constants.EVENT_RUN_BEGIN);
            runner.emit(Runner.constants.EVENT_TEST_BEGIN, test);
            runner.emit(Runner.constants.EVENT_TEST_FAIL, test, error);

            const sceneFinished = recorder.events.filter(e => e instanceof SceneFinished);
            expect(sceneFinished).to.have.lengthOf(1);
            expect(sceneFinished[0].outcome).to.be.instanceOf(ExecutionFailedWithError);
        });

        it('emits SceneStarts and SceneFinished for pending tests', () => {
            const runner = createParallelRunner();
            createReporter(runner);

            const test = parallelTest({ pending: true, isPending: () => true, fn: undefined });
            runner.emit(Runner.constants.EVENT_RUN_BEGIN);
            runner.emit(Runner.constants.EVENT_TEST_PENDING, test);

            const sceneStarts = recorder.events.filter(e => e instanceof SceneStarts);
            const sceneFinished = recorder.events.filter(e => e instanceof SceneFinished);
            expect(sceneStarts).to.have.lengthOf(1);
            expect(sceneFinished).to.have.lengthOf(1);
            expect(sceneFinished[0].outcome).to.be.instanceOf(ImplementationPending);
        });

        it('emits TestRunnerDetected with test runner name and version', () => {
            const runner = createParallelRunner();
            createReporter(runner);

            runner.emit(Runner.constants.EVENT_RUN_BEGIN);
            runner.emit(Runner.constants.EVENT_TEST_BEGIN, parallelTest());

            const detected = recorder.events.filter(e => e instanceof TestRunnerDetected);
            expect(detected).to.have.lengthOf(1);
            expect(detected[0].name.value).to.equal('Mocha');
        });
    });
});
