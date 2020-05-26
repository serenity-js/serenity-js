import 'mocha';

import * as sinon from 'sinon';
import { ConfigurationError } from '../../src/errors';

import { InteractionFinished, InteractionStarts } from '../../src/events';
import { ActivityDetails, ExecutionSuccessful, Name, Timestamp } from '../../src/model';
import { Ability, Activity, Actor, See } from '../../src/screenplay';
import { Stage } from '../../src/stage';
import { expect } from '../expect';
import {
    AcousticGuitar,
    Chords,
    Guitar,
    MusicSheets,
    NumberOfGuitarStringsLeft,
    PlayAChord,
    PlayAGuitar,
    PlayASong,
} from './example-implementation';

const equals = (expected: number) => (actual: PromiseLike<number>) => expect(actual).to.equal(expected);

describe('Actor', () => {

    let
        guitar: sinon.SinonStubbedInstance<Guitar>,
        stage: sinon.SinonStubbedInstance<Stage>;

    beforeEach(() => {
        guitar = sinon.createStubInstance(AcousticGuitar);
        stage = sinon.createStubInstance(Stage);

        // activityDetailsFor is a bit more involved than that, but this is a good approximation
        stage.activityDetailsFor.callsFake((activity: Activity) => new ActivityDetails(new Name(activity.toString())));
    });

    function actor(name: string) {
        return new Actor(name, stage as unknown as Stage);
    }

    /** @test {Actor} */
    it('can be identified by their name', () => {

        expect(actor('Chris').name).to.equal('Chris');
    });

    /** @test {Actor} */
    it('provides a developer-friendly toString', () => {
        class DoCoolThings implements Ability {
        }

        expect(actor('Chris').toString()).to.equal('Actor(name=Chris, abilities=[])');

        expect(actor('Chris').whoCan(new DoCoolThings()).toString()).to.equal('Actor(name=Chris, abilities=[DoCoolThings])');
    });

    /** @test {Actor} */
    it('has Abilities allowing them to perform Activities and interact with a given Interface of the system under test', () =>

        actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
            PlayAChord.of(Chords.AMajor),
        ).
        then(() => {
            expect(guitar.play).to.have.been.calledWith(Chords.AMajor);
        }));

    /** @test {Actor} */
    it('performs composite Tasks recursively to accomplish their Business Goals', () =>

        actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
            PlayASong.from(MusicSheets.Wild_Thing),
        ).
        then(() => {
            expect(guitar.play.getCall(0)).to.have.been.calledWith(Chords.AMajor);
            expect(guitar.play.getCall(1)).to.have.been.calledWith(Chords.DMajor);
            expect(guitar.play.getCall(2)).to.have.been.calledWith(Chords.EMajor);
        }));

    describe('asks Questions about the state of the system', () => {
        /** @test {Actor} */
        it('fulfills the promise should the question be answered as expected', () => {
            guitar.availableStrings.returns(Promise.resolve(['E2', 'A2', 'D3', 'G3', 'B3', 'E4' ]));

            return expect(actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
                PlayASong.from(MusicSheets.Wild_Thing),
                See.if(NumberOfGuitarStringsLeft(), equals(6)),
            )).to.be.fulfilled;
        });

        /** @test {Actor} */
        it('rejects the promise should the answer differ from what was expected', () => {
            const oneStringMissing = ['E2', 'A2', 'D3', 'G3', 'B3' ];
            guitar.availableStrings.returns(Promise.resolve(oneStringMissing));

            return expect(actor('Chris').whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
                PlayASong.from(MusicSheets.Wild_Thing),
                See.if(NumberOfGuitarStringsLeft(), equals(6)),
            )).to.be.rejectedWith('expected 5 to equal 6');
        });
    });

    /** @test {Actor} */
    it('admits if it does not have the Ability necessary to accomplish a given Interaction', () =>

        expect(actor('Ben').attemptsTo(
            PlayAChord.of(Chords.AMajor),
        )).to.be.eventually.rejectedWith(ConfigurationError, `Ben can't PlayAGuitar yet. Did you give them the ability to do so?`));

    /** @test {Actor} */
    it('complains if given the same ability twice', () => {

        expect(() =>
            actor('Ben').whoCan(PlayAGuitar.suchAs(guitar), PlayAGuitar.suchAs(guitar))
        ).to.throw(ConfigurationError, `Ben already has an ability to PlayAGuitar, so you don't need to give it to them again.`);
    });

    /** @test {Actor} */
    it('can be instantiated without explicitly specifying the Stage', () => {

        const anActor: Actor = Actor.named('Bob').whoCan(PlayAGuitar.suchAs(guitar));

        expect(anActor.name).to.equal('Bob');
    });

    describe('DomainEvent handling', () => {

        let Bob: Actor;
        const now = new Timestamp(new Date('2018-06-10T22:57:07.112Z'));
        const activityName = new Name('Bob plays the chord of A');

        beforeEach(() => {
            stage = sinon.createStubInstance(Stage);
            stage.currentTime.returns(now);
            stage.activityDetailsFor.returns(new ActivityDetails(activityName));

            Bob = new Actor('Bob', stage as unknown as Stage);
        });

        describe('announces the events that activities it performs', () => {

            /** @test {Actor} */
            it('notifies when an activity begins and ends', () => Bob.whoCan(PlayAGuitar.suchAs(guitar)).attemptsTo(
                PlayAChord.of(Chords.AMajor),
            ).then(() => {
                expect(stage.announce).to.have.callCount(2);

                const
                    firstEvent = stage.announce.getCall(0).args[0],
                    secondEvent = stage.announce.getCall(1).args[0];

                expect(firstEvent).to.be.instanceOf(InteractionStarts);
                expect(firstEvent).to.have.property('value').property('name').equal(activityName);
                expect(firstEvent).to.have.property('timestamp').equal(now);

                expect(secondEvent).to.be.instanceOf(InteractionFinished);
                expect(secondEvent).to.have.property('value').property('name').equal(activityName);
                expect(secondEvent).to.have.property('outcome').equal(new ExecutionSuccessful());
                expect(secondEvent).to.have.property('timestamp').equal(now);
            }));
        });
    });
});
