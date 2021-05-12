import 'mocha';

import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '../../src/events';
import { CorrelationId, Description, Duration } from '../../src/model';
import { Clock, StageManager } from '../../src/stage';
import { expect } from '../expect';
import { Recorder } from '../Recorder';

describe('StageManager', () => {

    class TestEvent extends DomainEvent {
        constructor() {
            super();
        }
    }

    const testEvent = new TestEvent();

    /** @test {StageManager} */
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

    /**
     * @test {StageManager}
     * @test {AsyncOperationAttempted}
     * @test {AsyncOperationCompleted}
     */
    it('keeps track of the work in progress', () => {

        const stageManager = new StageManager(Duration.ofMilliseconds(250), new Clock());

        const id = CorrelationId.create();

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Description('Saving a file...'),
            id,
        ));
        stageManager.notifyOf(new AsyncOperationCompleted(
            new Description('File saved'),
            id,
        ));

        return expect(stageManager.waitForNextCue()).to.be.fulfilled;
    });

    /**
     * @test {StageManager}
     * @test {AsyncOperationAttempted}
     */
    it('provides details should the work in progress fail to complete', () => {

        const timeout       = Duration.ofMilliseconds(50);
        const stageManager = new StageManager(timeout, new Clock());

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Description('[Service 1] Starting...'),
            CorrelationId.create(),
        ));

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Description('[Service 2] Starting...'),
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

    /**
     * @test {StageManager}
     * @test {AsyncOperationAttempted}
     * @test {AsyncOperationFailed}
     */
    it('provides details should the work in progress fail with an error', () => {

        const timeout       = Duration.ofMilliseconds(100);
        const stageManager  = new StageManager(timeout, new Clock());
        const correlationId = CorrelationId.create();

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Description('[Service 1] Starting...'),
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
