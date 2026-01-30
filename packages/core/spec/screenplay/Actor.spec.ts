import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { ConfigurationError, TestCompromisedError } from '../../src/errors';
import { InteractionFinished, InteractionStarts } from '../../src/events';
import { CorrelationId, ExecutionSuccessful, Name } from '../../src/model';
import type {
    AnswersQuestions,
    Initialisable,
    Question} from '../../src/screenplay';
import {
    Ability,
    Actor,
    Interaction,
    Timestamp
} from '../../src/screenplay';
import { Stage } from '../../src/stage';
import { expect } from '../expect';
import type {
    Guitar} from './example-implementation';
import {
    AcousticGuitar,
    Chords,
    MusicSheets,
    NumberOfGuitarStringsLeft,
    PlayAChord,
    PlayAGuitar,
    PlayASong
} from './example-implementation';

const equals = (expected: number) => (actual: Promise<number>) => expect(actual).to.equal(expected);

describe('Actor', () => {

    const
        sceneId = new CorrelationId('some-scene-id'),
        activityId = new CorrelationId('some-activity-id');

    let
        guitar: sinon.SinonStubbedInstance<Guitar>,
        stage: sinon.SinonStubbedInstance<Stage>;

    beforeEach(() => {
        guitar = sinon.createStubInstance(AcousticGuitar);
        stage = sinon.createStubInstance(Stage);

        stage.assignNewActivityId.returns(activityId);
        stage.currentSceneId.returns(sceneId);
        stage.currentActivityId.returns(activityId);
    });

    function actor(name: string) {
        return new Actor(name, stage as unknown as Stage);
    }

    it('can be identified by their name', () => {

        expect(actor('Chris').name).to.equal('Chris');
    });

    it('provides a developer-friendly toString', () => {
        class DoCoolThings extends Ability {
        }

        expect(actor('Chris').toString()).to.equal('Actor(name=Chris, abilities=[PerformActivities, AnswerQuestions])');

        expect(actor('Chris').whoCan(new DoCoolThings()).toString()).to.equal('Actor(name=Chris, abilities=[PerformActivities, AnswerQuestions, DoCoolThings])');
    });

    it('provides a developer-friendly toJSON, describing the actor with its associated abilities', () => {
        class DoCoolThings extends Ability {
        }

        class DoSpecialisedCoolThings extends DoCoolThings {
        }

        expect(actor('Chris').toJSON()).to.deep.equal({
            name: 'Chris',
            abilities: [
                { type: 'PerformActivities' },
                { type: 'AnswerQuestions' }
            ],
        });

        expect(actor('Chris').whoCan(new DoSpecialisedCoolThings()).toJSON()).to.deep.equal({
            name: 'Chris',
            abilities: [
                { type: 'PerformActivities' },
                { type: 'AnswerQuestions' },
                { class: 'DoSpecialisedCoolThings', type: 'DoCoolThings' }
            ],
        });
    });

    it('has Abilities allowing them to perform Activities and interact with a given interface of the system under test', () =>

        actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
            PlayAChord.of(Chords.AMajor),
        ).
        then(() => {
            expect(guitar.play).to.have.been.calledWith(Chords.AMajor);
        }));

    it('performs composite Tasks recursively to accomplish their Business Goals', () =>

        actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
            PlayASong.from(MusicSheets.Wild_Thing),
        ).
        then(() => {
            expect(guitar.play.getCall(0)).to.have.been.calledWith(Chords.AMajor);
            expect(guitar.play.getCall(1)).to.have.been.calledWith(Chords.DMajor);
            expect(guitar.play.getCall(2)).to.have.been.calledWith(Chords.EMajor);
        }));

    describe('answers Questions about the state of the system', () => {

        it('fulfills the promise should the question be answered as expected', () => {
            guitar.availableStrings.returns(Promise.resolve(['E2', 'A2', 'D3', 'G3', 'B3', 'E4' ]));

            return expect(actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
                PlayASong.from(MusicSheets.Wild_Thing),
                See.if(NumberOfGuitarStringsLeft(), equals(6)),
            )).to.be.fulfilled;
        });

        it('rejects the promise should it fail to complete an Activity', () => {
            const oneStringMissing = ['E2', 'A2', 'D3', 'G3', 'B3' ];
            guitar.availableStrings.returns(Promise.resolve(oneStringMissing));

            return expect(actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
                PlayASong.from(MusicSheets.Wild_Thing),
                See.if(NumberOfGuitarStringsLeft(), equals(6)),
            )).to.be.rejectedWith('expected 5 to equal 6');
        });
    });

    describe('when using abilities', () => {

        it('admits if it does not have the Ability necessary to accomplish a given Interaction', () =>

            expect(actor('Ben').attemptsTo(
                PlayAChord.of(Chords.AMajor),
            )).to.be.eventually.rejectedWith(ConfigurationError, `Ben can PerformActivities, AnswerQuestions. They can't, however, PlayAGuitar yet. Did you give them the ability to do so?`));

        it('admits if it does not have the Ability necessary to accomplish a given Interaction, but mentions any other abilities they might have', () => {

            expect(() => actor('Ben').whoCan(new DoSomethingElse()).abilityTo(PlayAGuitar))
                .to.throw(ConfigurationError, `Ben can PerformActivities, AnswerQuestions, DoSomethingElse. They can't, however, PlayAGuitar yet. Did you give them the ability to do so?`);
        });

        describe('that are abstract', () => {

            class NotAnAbility {}

            abstract class MakePhoneCalls extends Ability {}
            class UseMobilePhone extends MakePhoneCalls {}
            class UseLandline extends MakePhoneCalls {
                constructor(public phoneNumber: string) {
                    super();
                }
            }

            given([
                { description: 'undefined',     ability: undefined,             received: 'undefined'       },
                { description: 'null',          ability: null,                  received: 'null'            },
                { description: 'object',        ability: { },                   received: 'object'          },
                { description: 'instance',      ability: new NotAnAbility(),    received: 'NotAnAbility'    },
            ]).
            it(`complains if requested to use an ability object that doesn't extend Ability`, ({ ability, received }) => {
                expect(() =>
                    actor('Ben').whoCan(ability)
                ).to.throw(ConfigurationError, `Custom abilities must extend Ability from '@serenity-js/core'. Received ${ received }`);
            });

            it('retrieves the more specific ability when the more generic ability type is requested', () => {
                const ben = actor('Ben').whoCan(new UseMobilePhone());

                const ability = MakePhoneCalls.as(ben);

                expect(ability).to.be.instanceOf(UseMobilePhone);
            });

            it('allows for an ability of a given type to be overridden', () => {
                const ben = actor('Ben')
                    .whoCan(new UseLandline('555-123-123'))
                    .whoCan(new UseLandline('555-456-456'));

                const ability = UseLandline.as(ben);

                expect(ability.phoneNumber).to.equal('555-456-456');
            });

            it('allows for a specific ability of a given type to be overridden by another specific ability when they share the same generic type', () => {
                const ben = actor('Ben')
                    .whoCan(new UseLandline('555-123-123'))
                    .whoCan(new UseMobilePhone());

                const ability = MakePhoneCalls.as(ben);

                expect(ability).to.be.instanceOf(UseMobilePhone);
                expect(ben.toString()).to.equal(`Actor(name=Ben, abilities=[PerformActivities, AnswerQuestions, UseMobilePhone])`)
            })
        });

        describe('that have to be initialised', () => {

            class UseDatabase extends Ability implements Initialisable {
                public callsToInitialise = 0;
                private connection;

                initialise(): Promise<void> | void {
                    this.connection = 'some connection';

                    this.callsToInitialise++;
                }

                isInitialised(): boolean {
                    return !! this.connection;
                }
            }

            class UseBrokenDatabase extends Ability implements Initialisable {
                initialise(): Promise<void> | void {
                    throw new Error('DB server is down, please cheer it up');
                }

                isInitialised(): boolean {
                    return false;
                }
            }

            it('initialises them upon the first call to attemptsTo', async () => {

                const useDatabase = new UseDatabase();

                await actor('Dibillo').whoCan(useDatabase).attemptsTo(/* */);

                expect(useDatabase.isInitialised()).to.equal(true);
            });

            it(`initialises them only if they haven't been initialised before`, async () => {

                const useDatabase = new UseDatabase();

                await actor('Dibillo').whoCan(useDatabase).attemptsTo(/* */);
                await actor('Dibillo').whoCan(useDatabase).attemptsTo(/* */);
                await actor('Dibillo').whoCan(useDatabase).attemptsTo(/* */);

                expect(useDatabase.callsToInitialise).to.equal(1);
            });

            it(`complains if the ability could not be initialised`, () => {

                return expect(actor('Dibillo').whoCan(new UseBrokenDatabase()).attemptsTo(/* */))
                    .to.be.rejectedWith(TestCompromisedError, `Dibillo couldn't initialise the ability to UseBrokenDatabase`)
                    .then(error => {
                        expect(error.cause.message).to.equal('DB server is down, please cheer it up')
                    });
            });
        });
    });

    describe('DomainEvent handling', () => {

        let Bob: Actor;
        const now = new Timestamp(new Date('2018-06-10T22:57:07.112Z'));
        const activityName = new Name('Bob plays the chord of A');

        beforeEach(() => {
            stage = sinon.createStubInstance(Stage);
            stage.currentTime.returns(now);

            stage.currentSceneId.returns(sceneId);
            stage.assignNewActivityId.returns(activityId);
            stage.currentActivityId.returns(activityId);

            Bob = new Actor('Bob', stage as unknown as Stage);
        });

        it('tells the time', () => {
            expect(Bob.currentTime()).to.equal(now);
        })

        describe('announces events about the activities it performs', () => {

            it('notifies when an activity begins and ends', () => Bob.whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
                PlayAChord.of(Chords.AMajor),
            ).then(() => {
                expect(stage.announce).to.have.callCount(2);

                const
                    firstEvent = stage.announce.getCall(0).args[0],
                    secondEvent = stage.announce.getCall(1).args[0];

                expect(firstEvent).to.be.instanceOf(InteractionStarts);
                expect(firstEvent).to.have.property('details').property('name').equal(activityName);
                expect(firstEvent).to.have.property('timestamp').equal(now);

                expect(secondEvent).to.be.instanceOf(InteractionFinished);
                expect(secondEvent).to.have.property('details').property('name').equal(activityName);
                expect(secondEvent).to.have.property('outcome').equal(new ExecutionSuccessful());
                expect(secondEvent).to.have.property('timestamp').equal(now);
            }));
        });
    });
});

type Assertion<A> = (actual: A) => void;

class See<S> extends Interaction {
    static if<T>(question: Question<T>, assertion: Assertion<T>): Interaction {
        return new See<T>(question, assertion);
    }

    constructor(
        private question: Question<S>,
        private assert: Assertion<S>,
    ) {
        super(`#actor checks ${ question }`);
    }

    performAs(actor: AnswersQuestions): Promise<void> {
        return actor.answer(this.question).then(this.assert);
    }
}

class DoSomethingElse extends Ability {
}
