import { afterEach, beforeEach, describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '../../src/events';
import { CorrelationId, Description, Name } from '../../src/model';
import { Clock, Duration } from '../../src/screenplay';
import { StageManager } from '../../src/stage';
import { expect } from '../expect';
import { Recorder } from '../Recorder';

describe('StageManager', () => {

    class TestEvent extends DomainEvent {
        constructor() {
            super();
        }
    }

    const testEvent = new TestEvent();

    it('broadcasts the domain event it receives to all the registered subscribers', () => {

        const stageManager = new StageManager(Duration.ofMilliseconds(250), new Clock());
        const crewMember1 = new Recorder();
        const crewMember2 = new Recorder();

        stageManager.register(crewMember1, crewMember2);

        stageManager.notifyOf(testEvent);

        expect(crewMember1.events).to.have.lengthOf(1);
        expect(crewMember1.events[0]).to.be.instanceOf(TestEvent);
        expect(crewMember2.events).to.have.lengthOf(1);
        expect(crewMember2.events[0]).to.be.instanceOf(TestEvent);
    });

    it('keeps track of the work in progress', () => {

        const stageManager = new StageManager(Duration.ofMilliseconds(250), new Clock());

        const id = CorrelationId.create();

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Name('Example stage crew member'),
            new Description('Saving a file...'),
            id,
        ));
        stageManager.notifyOf(new AsyncOperationCompleted(
            id,
        ));

        return expect(stageManager.waitForNextCue()).to.be.fulfilled;
    });

    it('resolves waitForNextCue without polling when there is no work in progress', async () => {

        const timers = sinon.useFakeTimers({ toFake: [ 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval' ] });

        try {
            const stageManager = new StageManager(Duration.ofMilliseconds(250), new Clock());

            const cue = settlementOf(stageManager.waitForNextCue());

            // flush pending promise callbacks without advancing the clock
            await timers.tickAsync(0);

            expect(cue.settled).to.equal(true);
        }
        finally {
            timers.restore();
        }
    });

    describe('when waiting for async operations to complete', () => {

        let timers: sinon.SinonFakeTimers;

        beforeEach(() => {
            timers = sinon.useFakeTimers({ toFake: [ 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval' ] });
        });

        afterEach(() => {
            timers.restore();
        });

        it('ignores the operations it has been asked to exclude', async () => {
            const stageManager = new StageManager(Duration.ofSeconds(5), new Clock());

            const excludedOperation = CorrelationId.create();
            const otherOperation = CorrelationId.create();

            stageManager.notifyOf(new AsyncOperationAttempted(new Name('Stage'), new Description('Actor Alice exits the stage'), excludedOperation));
            stageManager.notifyOf(new AsyncOperationAttempted(new Name('Photographer'), new Description('Taking a photo...'), otherOperation));

            const wait = settlementOf(stageManager.waitForAsyncOperationsToComplete({ except: [ excludedOperation ] }));

            await timers.tickAsync(50);

            expect(wait.settled, 'should wait for operations that are not excluded').to.equal(false);

            stageManager.notifyOf(new AsyncOperationCompleted(otherOperation));

            await timers.tickAsync(50);

            expect(wait.settled, 'should not wait for the excluded operation').to.equal(true);
        });

        it('waits for all the operations when none are excluded', async () => {
            const stageManager = new StageManager(Duration.ofSeconds(5), new Clock());

            const operation = CorrelationId.create();

            stageManager.notifyOf(new AsyncOperationAttempted(new Name('Photographer'), new Description('Taking a photo...'), operation));

            const wait = settlementOf(stageManager.waitForAsyncOperationsToComplete());

            await timers.tickAsync(50);

            expect(wait.settled).to.equal(false);

            stageManager.notifyOf(new AsyncOperationCompleted(operation));

            await timers.tickAsync(50);

            expect(wait.settled).to.equal(true);
        });

        it('resolves once the cue timeout expires, even if some operations are still in progress', async () => {
            const stageManager = new StageManager(Duration.ofMilliseconds(250), new Clock());

            stageManager.notifyOf(new AsyncOperationAttempted(new Name('Photographer'), new Description('Taking a photo...'), CorrelationId.create()));

            const wait = settlementOf(stageManager.waitForAsyncOperationsToComplete());

            await timers.tickAsync(249);

            expect(wait.settled).to.equal(false);

            await timers.tickAsync(1);

            expect(wait.settled).to.equal(true);
        });
    });

    function settlementOf(promise: Promise<void>): { settled: boolean } {
        const result = { settled: false };

        promise.then(
            () => { result.settled = true },
            () => { result.settled = true },
        );

        return result;
    }

    it('provides details should the work in progress fail to complete', () => {

        const timeout       = Duration.ofMilliseconds(50);
        const stageManager = new StageManager(timeout, new Clock());

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Name('Service 1'),
            new Description('Starting...'),
            CorrelationId.create(),
        ));

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Name('Service 2'),
            new Description('Starting...'),
            CorrelationId.create(),
        ));

        return expect(stageManager.waitForNextCue()).to.be.rejected.then(error => {
            const lines = error.message.split('\n');

            expect(lines, `message: \n${ error.message }`).to.have.lengthOf(3);
            expect(lines[0]).to.equal('2 async operations have failed to complete within a 50ms cue timeout:');
            expect(lines[1], error.message).to.match(/^\d+ms.*?- \[Service 1] Starting...$/);
            expect(lines[2], error.message).to.match(/^\d+ms.*?- \[Service 2] Starting...$/);
        });
    });

    it('provides details should the work in progress fail with an error', () => {

        const timeout       = Duration.ofMilliseconds(100);
        const stageManager  = new StageManager(timeout, new Clock());
        const correlationId = CorrelationId.create();

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Name('Service 1'),
            new Description('Starting...'),
            correlationId,
        ));

        stageManager.notifyOf(new AsyncOperationFailed(
            new Error('Something happened'),
            correlationId,
        ));

        return expect(stageManager.waitForNextCue()).to.be.rejected.then(error => {
            const lines = error.message.split('\n');

            expect(lines[0]).to.equal('1 async operation has failed to complete:');
            expect(lines[1]).to.equal('[Service 1] Starting... - Error: Something happened');
        });
    });
});
