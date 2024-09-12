import { ensure, isNumber } from 'tiny-types';

import type { Answerable } from '../Answerable';
import type { QuestionAdapter } from '../Question';
import { Question } from '../Question';
import { the } from './tag-functions';

export class Numeric {

    /**
     * Returns a Question that sums up the values provided and throws if any of the values is not a `number`.
     *
     * @param values
     */
    static sum(...values: Array<Answerable<number | number[]>>): QuestionAdapter<number> {
        return Question.about<number>(the`the sum of ${ values }`, async actor => {

            const numbers = [];

            for (const value of values) {
                const numberOrNumbersToAdd = await actor.answer(value);
                const numbersToAdd = Array.isArray(numberOrNumbersToAdd)
                    ? numberOrNumbersToAdd
                    : [ numberOrNumbersToAdd ];

                numbers.push(...numbersToAdd);
            }

            return numbers.sort().reduce((acc, current) => {

                const description = current === undefined
                    ? 'undefined'
                    : Question.formattedValue().of(current).toString();

                return acc + ensure(description, current, isNumber())
            }, 0);
        });
    }
}
