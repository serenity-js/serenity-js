import { Ability } from '../../../../src/screenplay';
import type { Chord } from '../Chord';
import type { Guitar } from '../Guitar';

export class PlayAGuitar extends Ability {

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
     * The Ability to PlayAnInstrument allows the Actor to interact with an Instrument,
     * in the same way as the Ability to BrowseTheWeb allows to interact with a WebDriver Browser
     *
     * @param guitar
     */
    constructor(private readonly guitar: Guitar) {
        super();
    }

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
