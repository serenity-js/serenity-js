import 'mocha';

import { AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed, DomainEvent } from '../../src/events';
import { CorrelationId, Description, Duration } from '../../src/model';
import { StageCrewMember, StageManager } from '../../src/stage';

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

        const stageManager = new StageManager();
        const crewMember1 = new Recorder();
        const crewMember2 = new Recorder();

        crewMember1.assignTo(stageManager);
        crewMember2.assignTo(stageManager);

        stageManager.notifyOf(testEvent);

        expect(crewMember1.events).to.have.lengthOf(1);
        expect(crewMember1.events[0]).to.be.instanceOf(TestEvent);
        expect(crewMember2.events).to.have.lengthOf(1);
        expect(crewMember2.events[0]).to.be.instanceOf(TestEvent);
    });

    it('keeps track of the work in progress', () => {

        const stageManager = new StageManager();

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

    it('provides details should the work in progress fail to complete', () => {

        const timeout       = Duration.ofMillis(250);
        const stageManager  = new StageManager(timeout);

        stageManager.notifyOf(new AsyncOperationAttempted(
            new Description('[Service 1] Starting...'),
            CorrelationId.create(),
        ));

        setTimeout(() => {
            stageManager.notifyOf(new AsyncOperationAttempted(
                new Description('[Service 2] Starting...'),
                CorrelationId.create(),
            ));
        }, 50);

        return expect(stageManager.waitForNextCue()).to.be.rejected.then(error => {
            const lines = error.message.split('\n');

            expect(lines[0]).to.equal('Some of the 2 async operations have failed to complete within 250ms:');
            expect(lines[1]).to.match(/^[\d]+ms - \[Service 1\] Starting...$/);
            expect(lines[2]).to.match(/^[\d]+ms - \[Service 2\] Starting...$/);
        });
    });

    it('provides details should the work in progress fail with an error', () => {

        const timeout       = Duration.ofMillis(100);
        const stageManager  = new StageManager(timeout);
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

            expect(lines[0]).to.match(/^Some of the async operations have failed:$/);
            expect(lines[1]).to.equal('[Service 1] Starting... - Error: Something happened');
        });
    });
});
