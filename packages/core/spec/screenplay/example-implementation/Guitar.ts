import { Chord } from './Chord';

export interface Guitar {
    play(chord: Chord): PromiseLike<any>;
    availableStrings(): PromiseLike<string[]>;
}
