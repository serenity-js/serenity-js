import { Ability } from '../../src/serenity/screenplay/ability';
import { Actor, PerformsTasks, UsesAbilities } from '../../src/serenity/screenplay/actor';
import { Action, Task } from '../../src/serenity/screenplay/performables';
import expect = require('../expect');
import sinon = require('sinon');
import SinonSpyCall = Sinon.SinonSpyCall;

describe('Screenplay Pattern', () => {

    let acousticGuitar: AcousticGuitar;

    beforeEach(() => acousticGuitar = <any> sinon.createStubInstance(AcousticGuitar));

    describe('Actor', () => {

        it('can be identified by their name', () => {

            let actor = Actor.named('Chris');

            expect(actor.toString()).to.equal('Chris');
        });

        it('has Abilities allowing them to perform Actions and interact with a given Interface: a web browser, a REST API or a guitar', () => {

            let actor = Actor.named('Chris').whoCan(PlayAnInstrument.suchAs(acousticGuitar));

            actor.attemptsTo(
                PlayAChord.called(Chords.AMajor)
            );

            expect(acousticGuitar.play).to.have.been.calledWith(Chords.AMajor);
        });

        it('performs Tasks to accomplish their Business Goals', () => {

            let actor = Actor.named('Chris').whoCan(PlayAnInstrument.suchAs(acousticGuitar));

            actor.attemptsTo(
                PerformASong.from(MusicSheets.Wild_Thing)
            );

            expect(invocation(0, acousticGuitar.play)).to.have.been.calledWith(Chords.AMajor);
            expect(invocation(1, acousticGuitar.play)).to.have.been.calledWith(Chords.DMajor);
            expect(invocation(2, acousticGuitar.play)).to.have.been.calledWith(Chords.EMajor);
        });

        it('admits if it does not have the Abilities necessary to accomplish the given Action', () => {
            let actor = Actor.named('Ben');

            expect(() => actor.attemptsTo(PlayAChord.called(Chords.AMajor)))
                .to.throw('I don\'t have the ability to PlayAnInstrument, said Ben sadly.');
        });

        function invocation(n: number, spy: any): SinonSpyCall {
            return spy.getCall(n);
        }
    });

    describe('Task', () => {

        it('describes high-level, business domain-focused activities, composed of either other Tasks or Actions', () => {

            let actor   = <any> sinon.createStubInstance(Actor);

            PerformASong.from(MusicSheets.Wild_Thing).performAs(actor);

            expect(actor.attemptsTo).to.have.been.calledWith(
                PlayAChord.called(Chords.AMajor),
                PlayAChord.called(Chords.DMajor),
                PlayAChord.called(Chords.EMajor)
            );
        });
    });

    describe('Action', () => {
        it('describes low-level, Interface-focused activity, directly exercising the Actor\'s Ability to interact with said Interface', () => {
            let ability = PlayAnInstrument.suchAs(acousticGuitar),
                play    = sinon.stub(ability, 'play'),
                actor   = Actor.named('Chris').whoCan(ability),
                action  = PlayAChord.called(Chords.AMajor);

            action.performAs(actor);

            expect(play).to.have.been.calledWith(Chords.AMajor);
        });
    });

    describe('Ability', () => {
        it('allows the Actor to interact with some external Interface, such as a web browser, an API, etc.', () => {
            let actor   = Actor.named('Chris').whoCan(PlayAnInstrument.suchAs(acousticGuitar));

            expect(PlayAnInstrument.as(actor)).to.be.instanceOf(PlayAnInstrument);
            expect(PlayAnInstrument.as(actor)).to.have.property('play');
        });
    });

    class Chord {
        constructor(public name: string,
                    private E_6TH: number,
                    private A_5TH: number,
                    private D_4TH: number,
                    private G_3RD: number,
                    private B_2ND: number,
                    private E_1ST: number) {
        }
    }

    class Chords {
        public static AMajor    = new Chord('CSharpMinor7', 0, 0, 2, 2, 2, 0);
        public static DMajor    = new Chord('DMajor',       0, 0, 0, 2, 3, 2);
        public static EMajor    = new Chord('EMajor',       0, 2, 2, 1, 0, 0);
    }

    class MusicSheet {
        constructor(public chords: Chord[]) {};
    }

    class MusicSheets {
        public static Wild_Thing = new MusicSheet([ Chords.AMajor, Chords.DMajor, Chords.EMajor ]);
    }

    class PerformASong implements Task {
        static from(musicSheet: MusicSheet) {
            return new PerformASong(musicSheet);
        }
        performAs(actor: PerformsTasks) {
            actor.attemptsTo.apply(actor, this.playThe(this.musicSheet.chords));
        }

        constructor(private musicSheet: MusicSheet) { }

        private playThe(chords: Chord[]): PlayAChord[] {
            return chords.map(chord => PlayAChord.called(chord));
        }
    }

    class PlayAChord implements Action {
        static called(chord: Chord) {
            return new PlayAChord(chord);
        }

        performAs(actor: PerformsTasks & UsesAbilities) {
            PlayAnInstrument.as(actor).play(this.chord);
        }

        constructor(private chord: Chord) {
        }
    }

    interface Instrument {
        play(chord: Chord);
    }

    class AcousticGuitar implements Instrument {
        play(chord: Chord) {
            // use some "guitar driver" to play the chord on the "real guitar"
        }
    }

    class PlayAnInstrument implements Ability {

        private actor: UsesAbilities;

        /**
         * Instantiates the Ability to PlayAnInstrument, allowing the Actor to PerformASong
         *
         * @param instrument
         * @return {PlayAnInstrument}
         */
        static suchAs(instrument: Instrument) {
            return new PlayAnInstrument(instrument);
        }

        /**
         * Used to access the Actor's ability to Drive from within the Action classes
         *
         * @param actor
         * @return {PlayAnInstrument}
         */
        static as(actor: UsesAbilities & PerformsTasks): PlayAnInstrument {
            return actor.abilityTo(PlayAnInstrument);
        }

        /**
         * Instrument-specific interface, allowing the actor to interact with it.
         * If it the Ability was to BrowseTheWeb, instead of "play" method it'd have had methods
         * such as "findElementById"
         *
         * @param chord
         */
        play(chord: Chord) {
            this.instrument.play(chord);
        }

        // todo: is this association needed?
        usedBy<U extends UsesAbilities>(actor: U): PlayAnInstrument {
            this.actor = actor;

            return this;
        }

        /**
         * The Ability to PlayAnInstrument allows the Actor to interact with an Instrument,
         * in the same way as the Ability to BrowseTheWeb allows to interact with a WebDriver Browser
         *
         * @param instrument
         */
        constructor(private instrument: Instrument) { }
    }
});
