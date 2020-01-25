import sinon = require('sinon');
import { ActivityFinished, ActivityStarts, DomainEvent, TestRunnerDetected } from '../src/events';
import { Name } from '../src/model';
import { Actor, Interaction } from '../src/screenplay';
import { Serenity } from '../src/Serenity';
import { Clock, DressingRoom, Stage, StageCrewMember } from '../src/stage';
import { expect } from './expect';

describe('Serenity', () => {

    it('constructs a Stage and connects it with a provided DressingRoom', () => {

        const prepareSpy = sinon.spy();

        // no-op actors with no special Abilities
        class Extras implements DressingRoom {
            prepare(actor: Actor): Actor {
                prepareSpy(actor);
                return actor;
            }
        }

        const serenity = new Serenity(new Clock());

        serenity.configure({
            actors: new Extras(),
        });

        const Joe = serenity.theActorCalled('Joe');

        expect(prepareSpy).to.have.been.calledOnce;                      // tslint:disable-line:no-unused-expression
        expect(prepareSpy.getCall(0).args[0]).to.equal(Joe);
    });

    it('enables propagation of DomainEvents triggered by Actors\' Activities and StageCrewMembers', () => {

        class Extras implements DressingRoom {
            prepare(actor: Actor): Actor {
                return actor;
            }
        }

        const PerformSomeInteraction = () => Interaction.where(`#actor performs some interaction`, actor => {
            return void 0;
        });

        const frozenClock = new Clock(() => new Date('1983-07-03'));
        const serenity = new Serenity(frozenClock);
        const listener = new Listener<ActivityStarts | ActivityFinished>();

        serenity.configure({
            actors: new Extras(),
            crew: [ listener ],
        });

        return serenity.theActorCalled('Joe').attemptsTo(
            PerformSomeInteraction(),
        ).
        then(() => serenity.waitForNextCue()).
        then(() => {
            expect(listener.events).to.have.lengthOf(2);

            expect(listener.events[0]).to.be.instanceOf(ActivityStarts);
            expect(listener.events[0].value.name.value).to.equal(`Joe performs some interaction`);

            expect(listener.events[1]).to.be.instanceOf(ActivityFinished);
            expect(listener.events[1].value.name.value).to.equal(`Joe performs some interaction`);
        });
    });

    it('allows for external parties, such as test runner adapters, to announce DomainEvents', () => {

        const frozenClock = new Clock(() => new Date('1983-07-03'));
        const serenity = new Serenity(frozenClock);
        const listener = new Listener<TestRunnerDetected>();

        const testRunnerName = new Name('mocha');

        serenity.configure({ crew: [ listener ] });

        serenity.announce(new TestRunnerDetected(testRunnerName, serenity.currentTime()));

        return serenity.waitForNextCue().
            then(() => {
                expect(listener.events).to.have.lengthOf(1);

                expect(listener.events[0]).to.be.instanceOf(TestRunnerDetected);
                expect(listener.events[0].value).to.equal(testRunnerName);
            });
    });

    class Listener<Event_Type extends DomainEvent> implements StageCrewMember {
        public readonly events: Event_Type[] = [];

        constructor(private stage: Stage = null) {
        }

        assignedTo(stage: Stage): StageCrewMember {
            this.stage = stage;

            return this;
        }

        notifyOf(event: Event_Type): void {
            this.events.push(event);
        }
    }
});
