import { Chord } from './Chord';
import { Guitar } from './Guitar';

export class AcousticGuitar implements Guitar {
    availableStrings(): PromiseLike<string[]> {
        return Promise.resolve(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
    }

    play(chord: Chord): PromiseLike<any> {
        // use some "guitar driver" to play the chord on the "real guitar"
        return Promise.resolve();
    }
}
