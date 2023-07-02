import type { UsesAbilities } from '../../../../../core/src/screenplay';
import { Interaction } from '../../../../../core/src/screenplay';
import { PlayAGuitar } from '../abilities';
import type { Chord } from '../Chord';

export class PlayAChord extends Interaction {
    static of(chord: Chord): PlayAChord {
        return new PlayAChord(chord);
    }

    constructor(private chord: Chord) {
        super(`#actor plays the chord of ${ chord.name }`);
    }

    performAs(actor: UsesAbilities): Promise<void> {
        return PlayAGuitar.as(actor).play(this.chord);
    }
}
