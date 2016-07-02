import * as sinon from 'sinon';
import * as chai from 'chai';
import {Journal, Scribe} from "../../lib/serenity/events/scribe";
import {DomainEvent} from "../../lib/serenity/events/domain_events";

const expect = chai.expect;

chai.use(require("sinon-chai"));

describe('Domain Events', () => {

    describe('The Journal', () => {
        const now = 1467395872000;

        let journal: Journal;

        beforeEach(() => { journal = new Journal(); });

        describe('Reading the Journal', () => {
            it('provides a record of what happened', () => {

                let event   = new DomainEvent<string>("You wouldn't believe what just happened!");

                journal.record(event);

                expect(journal.read()).to.deep.equal([event]);
            });

            it('always provides the full record of what happened, no matter how many times it is called', () => {
                let A   = new DomainEvent("A", now-3),
                    B   = new DomainEvent("B", now-2),
                    C   = new DomainEvent("C", now-1);

                journal.record(A);
                journal.record(B);
                journal.record(C);

                expect(journal.read()).to.deep.equal([A, B, C]);
                expect(journal.read()).to.deep.equal([A, B, C]);
            });

            it('provides a chronological record of what happened', () => {
                let A   = new DomainEvent("A", now - 3),
                    B   = new DomainEvent("B", now - 2),
                    C   = new DomainEvent("C", now - 1);

                journal.record(A);
                journal.record(B);
                journal.record(C);

                expect(journal.read()).to.deep.equal([
                    A, B, C
                ]);
            });

            it('guarantees the chronological read order, even when the write order was not chronological', () => {
                let A   = new DomainEvent("A", now - 3),
                    B   = new DomainEvent("B", now - 2),
                    C   = new DomainEvent("C", now - 1);

                journal.record(C);
                journal.record(B);
                journal.record(A);

                expect(journal.read()).to.deep.equal([
                    A, B, C
                ])
            });

            it('maintains the write order of the events, if they occurred at the exact same time', () => {
                let A   = new DomainEvent("A", now),
                    B   = new DomainEvent("B", now),
                    C   = new DomainEvent("C", now);

                journal.record(A);
                journal.record(C);
                journal.record(B);

                expect(journal.read()).to.deep.equal([
                    A, C, B
                ])
            });

            it('maintains the write order of the events, if some of them arrived to the party', () => {
                let A   = new DomainEvent("A", now-3),
                    B   = new DomainEvent("B", now-2),
                    C   = new DomainEvent("C", now-1),

                    B1  = new DomainEvent("C", now-2),
                    A1  = new DomainEvent("C", now-3);

                journal.record(A);
                journal.record(B);
                journal.record(C);
                journal.record(B1);
                journal.record(A1);

                expect(journal.read()).to.deep.equal([
                    A, A1, B, B1, C
                ])
            });

        });

        describe('Buffered reading', () => {
            it('provides a full record of past events', () => {
                let A   = new DomainEvent("A", now-3),
                    B   = new DomainEvent("B", now-2),
                    C   = new DomainEvent("C", now-1);

                journal.record(A);
                journal.record(B);
                journal.record(C);

                expect(journal.read()).to.deep.equal(journal.readAs('some reader'));
            });

            it('allows the reader to read from where they have left', () => {

                let id  = 'unique identifier of the reader',
                    A   = new DomainEvent("A", now-5),
                    B   = new DomainEvent("B", now-4),
                    C   = new DomainEvent("C", now-3),
                    D   = new DomainEvent("D", now-2),
                    E   = new DomainEvent("E", now-1);

                journal.record(A);
                journal.record(B);
                journal.record(C);

                expect(journal.readAs(id)).to.deep.equal([A, B, C]);

                journal.record(D);
                journal.record(E);

                expect(journal.readAs(id)).to.deep.equal([D, E]);
            });


            it('allows multiple readers to read from where they have left', () => {

                let reader1 = 'unique identifier of the first reader',
                    reader2 = 'unique identifier of the second reader',
                    A   = new DomainEvent("A", now-5),
                    B   = new DomainEvent("B", now-4),
                    C   = new DomainEvent("C", now-3),
                    D   = new DomainEvent("D", now-2),
                    E   = new DomainEvent("E", now-1);

                journal.record(A);
                journal.record(B);

                expect(journal.readAs(reader1)).to.deep.equal([A, B]);

                journal.record(C);
                journal.record(D);

                expect(journal.readAs(reader2)).to.deep.equal([A, B, C, D]);

                journal.record(E);

                expect(journal.readAs(reader1)).to.deep.equal([C, D, E]);
                expect(journal.readAs(reader2)).to.deep.equal([E]);
            });
        });

        describe('Altering the records', () => {

            it('contents cannot be altered', () => {
                journal.record(new DomainEvent("You wouldn't believe what just happened!"));

                journal.read()[0].value = "Oh yes I would!";

                expect(journal.read()[0].value).to.equal("You wouldn't believe what just happened!");
            });

            it('contents cannot be deleted', () => {
                journal.record(new DomainEvent("You wouldn't believe what just happened!"));

                delete journal.read()[0];

                expect(journal.read()).to.have.length(1)
            });
        });
    });

    describe('The Scribe', () => {

        describe('Journal Maintenance', () => {
            it('maintains a Journal of what happened during the test', () => {

                let journal = <any> sinon.createStubInstance(Journal),
                    scribe  = new Scribe(journal),
                    event   = new DomainEvent('A');

                scribe.record(event)

                expect(journal.record).to.have.been.calledWith(event);
            });

            it('provides means to access the contents of the journal', () => {

                let journal = <any> sinon.createStubInstance(Journal),
                    scribe  = new Scribe(journal);

                scribe.readJournal();
                expect(journal.read).to.have.been.called;

                scribe.readNewJournalEntriesAs('some reader');
                expect(journal.readAs).to.have.been.calledWith('some reader');
            });
        });

        describe('Notifications', () => {
            it('will notify you when something of interest happens', () => {
                let journal = <any> sinon.createStubInstance(Journal),
                    scribe  = new Scribe(journal),
                    event   = new DomainEvent('A'),
                    spy     = sinon.spy();

                scribe.on(DomainEvent, spy);

                scribe.record(event);

                expect(spy).to.have.been.calledWith(event);
            });

            it('will only notify the listeners interested in a specific type of an event', () => {

                class DomainEventA extends DomainEvent<string> {}
                class DomainEventB extends DomainEvent<string> {}

                let journal = new Journal(),
                    scribe  = new Scribe(journal),
                    A       = new DomainEventA('A'),
                    B       = new DomainEventB('B'),
                    spyA    = sinon.spy(),
                    spyB    = sinon.spy(),
                    spyDE   = sinon.spy();

                scribe.on(DomainEventA, spyA);
                scribe.on(DomainEventB, spyB);
                scribe.on(DomainEvent, spyDE);

                scribe.record(A);
                scribe.record(B);

                expect(spyA).to.have.been.calledWith(A);
                expect(spyA).to.not.have.been.calledWith(B);

                expect(spyB).to.have.been.calledWith(B);
                expect(spyB).to.not.have.been.calledWith(A);

                expect(spyDE).to.not.have.been.called;
            });

            it('does not allow the listener to alter the event it received', () => {
                let journal = new Journal(),
                    scribe  = new Scribe(journal),
                    event   = new DomainEvent('original');

                scribe.on(DomainEvent, (e) => {
                    e.value = 'modified';
                });

                scribe.record(event);

                expect(scribe.readJournal().pop().value).to.deep.equal('original');
            });
        });
    });
});