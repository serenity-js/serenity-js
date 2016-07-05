import * as sinon from "sinon";
import * as chai from "chai";
import {Chronicle, Chronicler} from "../../../src/serenity/recording/chronicles";
import {DomainEvent} from "../../../src/serenity/domain/events";

const expect = chai.expect;

chai.use(require("sinon-chai"));

describe('Recording what happened during the test', () => {

    describe('The Chronicler', () => {
        const now = 1467395872000;

        let chronicle: Chronicle;

        beforeEach(() => { chronicle = new Chronicle(); });

        describe('Reading the Chronicle', () => {
            it('provides a record of what happened', () => {

                let event   = new DomainEvent<string>("You wouldn't believe what just happened!");

                chronicle.record(event);

                expect(chronicle.read()).to.deep.equal([event]);
            });

            it('always provides the full record of what happened, no matter how many times it is called', () => {
                let A   = new DomainEvent("A", now-3),
                    B   = new DomainEvent("B", now-2),
                    C   = new DomainEvent("C", now-1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.read()).to.deep.equal([A, B, C]);
                expect(chronicle.read()).to.deep.equal([A, B, C]);
            });

            it('provides a chronological record of what happened', () => {
                let A   = new DomainEvent("A", now - 3),
                    B   = new DomainEvent("B", now - 2),
                    C   = new DomainEvent("C", now - 1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.read()).to.deep.equal([
                    A, B, C
                ]);
            });

            it('guarantees the chronological read order, even when the write order was not chronological', () => {
                let A   = new DomainEvent("A", now - 3),
                    B   = new DomainEvent("B", now - 2),
                    C   = new DomainEvent("C", now - 1);

                chronicle.record(C);
                chronicle.record(B);
                chronicle.record(A);

                expect(chronicle.read()).to.deep.equal([
                    A, B, C
                ])
            });

            it('maintains the write order of the events, if they occurred at the exact same time', () => {
                let A   = new DomainEvent("A", now),
                    B   = new DomainEvent("B", now),
                    C   = new DomainEvent("C", now);

                chronicle.record(A);
                chronicle.record(C);
                chronicle.record(B);

                expect(chronicle.read()).to.deep.equal([
                    A, C, B
                ])
            });

            it('maintains the write order of the events, if some of them arrived to the party', () => {
                let A   = new DomainEvent("A", now-3),
                    B   = new DomainEvent("B", now-2),
                    C   = new DomainEvent("C", now-1),

                    B1  = new DomainEvent("C", now-2),
                    A1  = new DomainEvent("C", now-3);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);
                chronicle.record(B1);
                chronicle.record(A1);

                expect(chronicle.read()).to.deep.equal([
                    A, A1, B, B1, C
                ])
            });

        });

        describe('Buffered reading', () => {
            it('provides a full record of past events', () => {
                let A   = new DomainEvent("A", now-3),
                    B   = new DomainEvent("B", now-2),
                    C   = new DomainEvent("C", now-1);

                chronicle.record(A);
                chronicle.record(B);
                chronicle.record(C);

                expect(chronicle.read()).to.deep.equal(chronicle.readAs('some reader'));
            });

            it('allows the reader to read from where they have left', () => {

                let id  = 'unique identifier of the reader',
                    A   = new DomainEvent("A", now-5),
                    B   = new DomainEvent("B", now-4),
                    C   = new DomainEvent("C", now-3),
                    D   = new DomainEvent("D", now-2),
                    E   = new DomainEvent("E", now-1);

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
                    A   = new DomainEvent("A", now-5),
                    B   = new DomainEvent("B", now-4),
                    C   = new DomainEvent("C", now-3),
                    D   = new DomainEvent("D", now-2),
                    E   = new DomainEvent("E", now-1);

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
                chronicle.record(new DomainEvent("You wouldn't believe what just happened!"));

                chronicle.read()[0].value = "Oh yes I would!";

                expect(chronicle.read()[0].value).to.equal("You wouldn't believe what just happened!");
            });

            it('contents cannot be deleted', () => {
                chronicle.record(new DomainEvent("You wouldn't believe what just happened!"));

                delete chronicle.read()[0];

                expect(chronicle.read()).to.have.length(1)
            });
        });
    });

    describe('The Chronicler', () => {

        describe('Chronicle Maintenance', () => {
            it('maintains a Chronicle of what happened during the test', () => {

                let chronicle = <any> sinon.createStubInstance(Chronicle),
                    scribe  = new Chronicler(chronicle),
                    event   = new DomainEvent('A');

                scribe.record(event)

                expect(chronicle.record).to.have.been.calledWith(event);
            });

            it('provides means to access the contents of the chronicle', () => {

                let chronicle = <any> sinon.createStubInstance(Chronicle),
                    scribe  = new Chronicler(chronicle);

                scribe.readTheChronicle();
                expect(chronicle.read).to.have.been.called;

                scribe.readNewEntriesAs('some reader');
                expect(chronicle.readAs).to.have.been.calledWith('some reader');
            });
        });

        describe('Notifications', () => {
            it('will notify you when something of interest happens', () => {
                let chronicle = <any> sinon.createStubInstance(Chronicle),
                    scribe  = new Chronicler(chronicle),
                    event   = new DomainEvent('A'),
                    spy     = sinon.spy();

                scribe.on(DomainEvent, spy);

                scribe.record(event);

                expect(spy).to.have.been.calledWith(event);
            });

            it('will only notify the listeners interested in a specific type of an event', () => {

                class DomainEventA extends DomainEvent<string> {}
                class DomainEventB extends DomainEvent<string> {}

                let chronicle = new Chronicle(),
                    scribe  = new Chronicler(chronicle),
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
                let chronicle = new Chronicle(),
                    scribe  = new Chronicler(chronicle),
                    event   = new DomainEvent('original');

                scribe.on(DomainEvent, (e) => {
                    e.value = 'modified';
                });

                scribe.record(event);

                expect(scribe.readTheChronicle().pop().value).to.deep.equal('original');
            });
        });
    });
});