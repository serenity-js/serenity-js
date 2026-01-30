
import { describe, it } from 'mocha';

import { ConfigurationError } from '../src';
import type { OutputStream } from '../src/adapter';
import type { DomainEvent} from '../src/events';
import { ActivityFinished, ActivityStarts, ActorEntersStage, TestRunnerDetected } from '../src/events';
import { CorrelationId, Name } from '../src/model';
import type { Actor } from '../src/screenplay';
import { Clock, Interaction } from '../src/screenplay';
import { Serenity } from '../src/Serenity';
import type { Cast, ListensToDomainEvents, StageCrewMember, StageCrewMemberBuilder } from '../src/stage';
import { Stage } from '../src/stage';
import type { StageCrewMemberBuilderDependencies } from '../src/stage/StageCrewMemberBuilderDependencies';
import { expect } from './expect';
import sinon = require('sinon');

describe('Serenity', () => {

    describe('when constructing a Stage', () => {
        it('connects it with a provided Cast', async () => {

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

            await Joe.dismiss();
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

    it(`enables propagation of DomainEvents triggered by Actors' Activities and StageCrewMembers`, async () => {

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
        const listener = new Listener<ActorEntersStage | ActivityStarts | ActivityFinished>();

        serenity.configure({
            actors: new Extras(),
            crew: [ listener ],
        });

        const actor = serenity.theActorCalled('Joe');

        await actor.attemptsTo(
            PerformSomeInteraction(),
        );

        await actor.dismiss();

        await serenity.waitForNextCue();

        expect(listener.events).to.have.lengthOf(4);

        const actorInitiliased = listener.events[0] as ActorEntersStage;

        // backstage actor gets initialised
        expect(actorInitiliased).to.be.instanceOf(ActorEntersStage);
        expect(actorInitiliased.sceneId).to.equal(new CorrelationId('unknown'));  // Since no scene was started, the sceneId is unknown
        expect(actorInitiliased.actor).to.deep.equal({
            name: 'Joe',
            abilities: [
                { type: 'PerformActivities' },
                { type: 'AnswerQuestions' },
                { type: 'RaiseErrors' },
                { type: 'ScheduleWork', options: { scheduler: { clock: { timeAdjustment: { milliseconds: 0 } }, interactionTimeout: { milliseconds: 5000 } } } }
            ],
        });

        // backstage actor is retrieved within the scenario scope
        expect(listener.events[1]).to.be.instanceOf(ActorEntersStage);

        const activityStarts = listener.events[2] as ActivityStarts;

        expect(activityStarts).to.be.instanceOf(ActivityStarts);
        expect(activityStarts.details.name.value).to.equal(`Joe performs some interaction`);

        const activityFinished = listener.events[3] as ActivityFinished;

        expect(activityFinished).to.be.instanceOf(ActivityFinished);
        expect(activityFinished.details.name.value).to.equal(`Joe performs some interaction`);
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
