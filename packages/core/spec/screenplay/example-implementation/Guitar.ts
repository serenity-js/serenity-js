import { Chord } from './Chord';

export interface Guitar {
    play(chord: Chord): Promise<any>;
    availableStrings(): Promise<string[]>;
}
