/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import sinon = require('sinon');
import { ConfigurationError } from '../src';
import { ActivityFinished, ActivityStarts, DomainEvent, TestRunnerDetected } from '../src/events';
import { OutputStream } from '../src/io';
import { CorrelationId, Name } from '../src/model';
import { Actor, Interaction } from '../src/screenplay';
import { Serenity } from '../src/Serenity';
import { Cast, Clock, ListensToDomainEvents, Stage, StageCrewMember, StageCrewMemberBuilder } from '../src/stage';
import { StageCrewMemberBuilderDependencies } from '../src/stage/StageCrewMemberBuilderDependencies';
import { expect } from './expect';

/** @test {Serenity} */
describe('Serenity', () => {

    describe('when constructing a Stage', () => {
        it('connects it with a provided Cast', () => {

            const prepareSpy = sinon.spy();

            // no-op actors with no special Abilities
            class Extras implements Cast {
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

            expect(prepareSpy).to.have.been.calledOnce;
            expect(prepareSpy.getCall(0).args[0]).to.equal(Joe);
        });

        it('connects it with provided StageCrewMembers', () => {

            const stageCrewMember: StageCrewMember = {
                assignedTo: sinon.spy(),
                notifyOf(event: DomainEvent) { /* no-op */ }
            }

            const serenity = new Serenity(new Clock());

            serenity.configure({
                crew: [
                    stageCrewMember
                ]
            });

            expect(stageCrewMember.assignedTo).to.have.been.calledOnceWith(sinon.match.instanceOf(Stage));
        });

        it('injects dependencies into StageCrewMemberBuilders', () => {

            const stageCrewMemberBuilder: StageCrewMemberBuilder = {
                build: sinon.spy(),
            };

            const outputStream: OutputStream = {
                write(content: string) {
                    // no-op
                }
            }

            const serenity = new Serenity(new Clock());

            serenity.configure({
                outputStream,
                crew: [
                    stageCrewMemberBuilder
                ]
            });

            expect(stageCrewMemberBuilder.build).to.have.been.calledOnceWith(
                sinon.match.has('stage', sinon.match.instanceOf(Stage))
                    .and(
                        sinon.match.has('outputStream', outputStream)
                    )
            );
        });

        it(`complains when a provided crew member doesn't implement StageCrewMember or StageCrewMemberBuilder interfaces`, () => {

            const stageCrewMemberBuilder: StageCrewMemberBuilder = {
                build(dependencies: StageCrewMemberBuilderDependencies): ListensToDomainEvents {
                    return {
                        notifyOf(event: DomainEvent): void {
                            // no-op
                        }
                    };
                }
            };

            const serenity = new Serenity(new Clock());

            expect(() => {
                serenity.configure({
                    crew: [
                        stageCrewMemberBuilder,
                        undefined,
                    ]
                });
            }).to.throw(ConfigurationError,
                'Entries under `crew` should implement either StageCrewMember or StageCrewMemberBuilder interfaces, `undefined` found at index 1'
            )
        });
    });

    it(`enables propagation of DomainEvents triggered by Actors' Activities and StageCrewMembers`, () => {

        class Extras implements Cast {
            prepare(actor: Actor): Actor {
                return actor;
            }
        }

        const PerformSomeInteraction = () =>
            Interaction.where(`#actor performs some interaction`, actor => {
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
            expect(listener.events[0].details.name.value).to.equal(`Joe performs some interaction`);

            expect(listener.events[1]).to.be.instanceOf(ActivityFinished);
            expect(listener.events[1].details.name.value).to.equal(`Joe performs some interaction`);
        });
    });

    it('allows for external parties, such as test runner adapters, to announce DomainEvents', () => {

        const frozenClock = new Clock(() => new Date('1983-07-03'));
        const serenity = new Serenity(frozenClock);
        const listener = new Listener<TestRunnerDetected>();

        const testRunnerName = new Name('mocha');

        serenity.configure({ crew: [ listener ] });

        serenity.announce(new TestRunnerDetected(CorrelationId.create(), testRunnerName, serenity.currentTime()));

        return serenity.waitForNextCue().
            then(() => {
                expect(listener.events).to.have.lengthOf(1);

                expect(listener.events[0]).to.be.instanceOf(TestRunnerDetected);
                expect(listener.events[0].name).to.equal(testRunnerName);
            });
    });

    class Listener<Event_Type extends DomainEvent> implements StageCrewMember {
        public readonly events: Event_Type[] = [];

        constructor(private stage?: Stage) {
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
