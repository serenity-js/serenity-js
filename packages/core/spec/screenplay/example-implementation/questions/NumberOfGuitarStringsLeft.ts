import { Question } from '../../../../src/screenplay';
import { PlayAGuitar } from '../abilities';

export const NumberOfGuitarStringsLeft = () => Question.about<PromiseLike<number>>('number of guitar strings left',
        actor => PlayAGuitar.as(actor).availableStrings().then(strings => strings.length),
);
