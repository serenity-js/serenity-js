import { Ability, UsesAbilities } from '../../../../src/screenplay';
import { Chord } from '../Chord';
import { Guitar } from '../Guitar';

export class PlayAGuitar implements Ability {

    /**
     * Instantiates the Ability to PlayAnInstrument, allowing the Actor to PerformASong
     *
     * @param instrument
     * @return {PlayAGuitar}
     */
    static suchAs(instrument: Guitar): PlayAGuitar {
        return new PlayAGuitar(instrument);
    }

    /**
     * Used to access the Actor's ability to Drive from within the Action classes
     *
     * @param actor
     * @return {PlayAGuitar}
     */
    static as(actor: UsesAbilities): PlayAGuitar {
        return actor.abilityTo(PlayAGuitar);
    }

    /**
     * The Ability to PlayAnInstrument allows the Actor to interact with an Instrument,
     * in the same way as the Ability to BrowseTheWeb allows to interact with a WebDriver Browser
     *
     * @param guitar
     */
    constructor(private readonly guitar: Guitar) { }

    /**
     * Instrument-specific interface, allowing the actor to interact with it.
     * If it the Ability was to BrowseTheWeb, instead of "play" method it'd have had methods
     * such as "findElementById"
     *
     * @param chord
     */
    play(chord: Chord): Promise<void> {
        return this.guitar.play(chord);
    }

    availableStrings(): Promise<string[]> {
        return this.guitar.availableStrings();
    }
}
