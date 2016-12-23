import { DomainEvent } from '../../../../src/serenity/domain/events';
import { Journal, Stage, StageCrewMember, StageManager } from '../../../../src/serenity/stage';
import sinon = require('sinon');

import expect = require('../../../expect');

describe('Recording what happened during the test', () => {

    describe('The Stage Manager', () => {
        const now = 1467395872000;

        let chronicle: Journal;

        beforeEach(() => { chronicle = new Journal(); });

        describe('Reading the Journal', () => {
            it('provides a record of what happened', () => {

                let event   = new DomainEvent<string>('You would not believe what just happened!');

                chronicle.record(event);

                expect(chronicle.read()).to.deep.equal([event]);
            });

            it('always provides the full record of what happened, no matter how many times it is called', () => {
                let A   = new DomainEvent('A', now - 3),
                    B   = new DomainEvent('B', now - 2),
                    C   = new DomainEvent('C', now - 1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.read()).to.deep.equal([A, B, C]);
                expect(chronicle.read()).to.deep.equal([A, B, C]);
            });

            it('provides a chronological record of what happened', () => {
                let A   = new DomainEvent('A', now - 3),
                    B   = new DomainEvent('B', now - 2),
                    C   = new DomainEvent('C', now - 1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.read()).to.deep.equal([
                    A, B, C,
                ]);
            });

            it('guarantees the chronological read order, even defer the write order was not chronological', () => {
                let A   = new DomainEvent('A', now - 3),
                    B   = new DomainEvent('B', now - 2),
                    C   = new DomainEvent('C', now - 1);

                chronicle.record(C);
                chronicle.record(B);
                chronicle.record(A);

                expect(chronicle.read()).to.deep.equal([
                    A, B, C,
                ]);
            });

            it('maintains the write order of the events, if they occurred at the exact same time', () => {
                let A   = new DomainEvent('A', now),
                    B   = new DomainEvent('B', now),
                    C   = new DomainEvent('C', now);

                chronicle.record(A);
                chronicle.record(C);
                chronicle.record(B);

                expect(chronicle.read()).to.deep.equal([
                    A, C, B,
                ]);
            });

            it('maintains the write order of the events, if some of them arrived to the party', () => {
                let A   = new DomainEvent('A', now - 3),
                    B   = new DomainEvent('B', now - 2),
                    C   = new DomainEvent('C', now - 1),

                    B1  = new DomainEvent('C', now - 2),
                    A1  = new DomainEvent('C', now - 3);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);
                chronicle.record(B1);
                chronicle.record(A1);

                expect(chronicle.read()).to.deep.equal([
                    A, A1, B, B1, C,
                ]);
            });

        });

        describe('Buffered reading', () => {
            it('provides a full record of past events', () => {
                let A   = new DomainEvent('A', now - 3),
                    B   = new DomainEvent('B', now - 2),
                    C   = new DomainEvent('C', now - 1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.read()).to.deep.equal(chronicle.readAs('some reader'));
            });

            it('allows the reader to read from where they have left', () => {

                let id  = 'unique identifier of the reader',
                    A   = new DomainEvent('A', now - 5),
                    B   = new DomainEvent('B', now - 4),
                    C   = new DomainEvent('C', now - 3),
                    D   = new DomainEvent('D', now - 2),
                    E   = new DomainEvent('E', now - 1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.readAs(id)).to.deep.equal([A, B, C]);

                chronicle.record(D);
                chronicle.record(E);

                expect(chronicle.readAs(id)).to.deep.equal([D, E]);
            });

            it('allows multiple readers to read from where they have left', () => {

                let reader1 = 'unique identifier of the first reader',
                    reader2 = 'unique identifier of the second reader',
                    A   = new DomainEvent('A', now - 5),
                    B   = new DomainEvent('B', now - 4),
                    C   = new DomainEvent('C', now - 3),
                    D   = new DomainEvent('D', now - 2),
                    E   = new DomainEvent('E', now - 1);

                chronicle.record(A);
                chronicle.record(B);

                expect(chronicle.readAs(reader1)).to.deep.equal([A, B]);

                chronicle.record(C);
                chronicle.record(D);

                expect(chronicle.readAs(reader2)).to.deep.equal([A, B, C, D]);

                chronicle.record(E);

                expect(chronicle.readAs(reader1)).to.deep.equal([C, D, E]);
                expect(chronicle.readAs(reader2)).to.deep.equal([E]);
            });
        });

        describe('Altering the records', () => {

            it('contents cannot be altered', () => {
                chronicle.record(new DomainEvent('You would not believe what just happened!'));

                chronicle.read()[0].value = 'Oh yes I would!';

                expect(chronicle.read()[0].value).to.equal('You would not believe what just happened!');
            });

            it('contents cannot be deleted', () => {
                chronicle.record(new DomainEvent('You would not believe what just happened!'));

                delete chronicle.read()[0];

                expect(chronicle.read()).to.have.length(1);
            });
        });
    });

    describe('The Stage Manager', () => {

        describe('Journal Maintenance', () => {
            it('maintains a Journal of what happened during the test', () => {

                let chronicle = <any> sinon.createStubInstance(Journal),
                    manager    = new StageManager(chronicle),
                    event     = new DomainEvent('A');

                manager.notifyOf(event);

                expect(chronicle.record).to.have.been.calledWith(event);
            });

            it('provides means to access the contents of the chronicle', () => {

                let chronicle = <any> sinon.createStubInstance(Journal),
                    manager  = new StageManager(chronicle);

                manager.readTheJournal();
                expect(chronicle.read).to.have.been.called;

                manager.readNewJournalEntriesAs('some reader');
                expect(chronicle.readAs).to.have.been.calledWith('some reader');
            });
        });

        // todo: extract into the 'stage' package
        describe('Notifications', () => {
            it('will notify you defer something of interest happens', () => {
                let chronicle = <any> sinon.createStubInstance(Journal),
                    manager  = new StageManager(chronicle),
                    event   = new DomainEvent('A'),
                    spy     = <any> sinon.createStubInstance(StageSpy);

                manager.registerInterestIn([DomainEvent], spy);

                manager.notifyOf(event);

                expect(spy.notifyOf).to.have.been.calledWith(event);
            });

            it('will only notify the listeners interested in a specific type of an event', () => {

                class DomainEventA extends DomainEvent<string> {}
                class DomainEventB extends DomainEvent<string> {}
                class DomainEventC extends DomainEvent<string> {}

                let chronicle = new Journal(),
                    manager   = new StageManager(chronicle),
                    A         = new DomainEventA('A'),
                    B         = new DomainEventB('B'),
                    spyA      = <any> sinon.createStubInstance(StageSpy),
                    spyB      = <any> sinon.createStubInstance(StageSpy),
                    spyC      = <any> sinon.createStubInstance(StageSpy);

                manager.registerInterestIn([DomainEventA], spyA);
                manager.registerInterestIn([DomainEventB], spyB);
                manager.registerInterestIn([DomainEventC], spyC);

                manager.notifyOf(A);
                manager.notifyOf(B);

                expect(spyA.notifyOf).to.have.been.calledWith(A);
                expect(spyA.notifyOf).to.not.have.been.calledWith(B);

                expect(spyB.notifyOf).to.have.been.calledWith(B);
                expect(spyB.notifyOf).to.not.have.been.calledWith(A);

                expect(spyC.notifyOf).to.not.have.been.called;
            });

            it('will notify the "catch-all" listeners, listening an all DomainEvents', () => {

                class DomainEventA extends DomainEvent<string> {}

                let chronicle = new Journal(),
                    manager   = new StageManager(chronicle),
                    A         = new DomainEventA('A'),
                    spyDE     = <any> sinon.createStubInstance(StageSpy);

                manager.registerInterestIn([DomainEvent],  spyDE);

                manager.notifyOf(A);

                expect(spyDE.notifyOf).to.have.been.calledWith(A);
            });

            it('does not allow the listener to alter the event it received', () => {
                let chronicle = new Journal(),
                    manager   = new StageManager(chronicle),
                    event     = new DomainEvent('original'),
                    noughty   = new StageHacker();

                manager.registerInterestIn([DomainEvent], noughty);

                manager.notifyOf(event);

                expect(manager.readTheJournal().pop().value).to.deep.equal('original');
            });

            class StageSpy implements StageCrewMember {
                assignTo(stageManager: Stage) {
                    return null;
                }

                notifyOf(event: DomainEvent<any>): void {
                    return null;
                }
            }

            class StageHacker implements StageCrewMember {
                assignTo(stageManager: Stage) {
                    return null;
                }

                notifyOf(event: DomainEvent<any>): void {
                    event.value = 'modified';
                }
            }
        });
    });
});
