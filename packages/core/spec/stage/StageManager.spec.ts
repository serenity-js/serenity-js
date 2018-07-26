import 'mocha';
import { AsyncOperationAttempted, DomainEvent } from '../../src/events';
import { StageCrewMember, StageManager } from '../../src/stage';

import { expect } from '../expect';
import { Recorder } from '../Recorder';

describe('StageManager', () => {

    class TestEvent extends DomainEvent {
        constructor() {
            super();
        }
    }

    class TestStageCrewMember implements StageCrewMember {
        assignTo(stageManager: StageManager): void {
            stageManager.register(this);
        }

        notifyOf(event: DomainEvent): void {
            // ignore
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

        stageManager.notifyOf(new AsyncOperationAttempted(
            TestStageCrewMember,
            'perform task',
            Promise.resolve(),
        ));

        return expect(stageManager.waitForNextCue()).to.be.fulfilled;
    });

    it('provides details should the work in progress fail to complete', () => {

        const stageManager = new StageManager();

        stageManager.notifyOf(new AsyncOperationAttempted(
            TestStageCrewMember,
            'perform some task',
            Promise.reject(new Error('something broke')),
        ));

        return expect(stageManager.waitForNextCue()).to.be.rejected.then(error => {
            expect(error.message).to.match(/^TestStageCrewMember took \d+ms to perform some task and has failed$/);
        });
    });
});
