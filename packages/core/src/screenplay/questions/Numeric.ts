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
                return acc + ensure(this.descriptionOf(current), current, isNumber());
            }, 0);
        });
    }

    /**
     * Returns a Question that calculates the difference between two numbers and throws if any of the values is not a `number`.
     *
     * @param minuend
     * @param subtrahend
     */
    static difference(minuend: Answerable<number>, subtrahend: Answerable<number>): QuestionAdapter<number> {
        return Question.about<number>(the`the difference between ${ minuend } and ${ subtrahend }`, async actor => {
            const minuendValue = await actor.answer(minuend);
            const subtrahendValue = await actor.answer(subtrahend);

            return ensure(this.descriptionOf(minuendValue), minuendValue, isNumber())
                - ensure(this.descriptionOf(subtrahendValue), subtrahendValue, isNumber());
        });
    }

    private static descriptionOf(value: unknown): string {
        if (value === undefined) {
            return 'undefined';
        }

        return Question.formattedValue().of(value).toString();
    }
}
