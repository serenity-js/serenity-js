import { Predicate } from 'tiny-types';
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

            const numbers = await actor.answer(this.flatten(values, isNumber()));

            return numbers.sort()
                .reduce((acc, current) => acc + current, 0);
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
            const minuendValue      = await actor.answer(minuend);
            const subtrahendValue   = await actor.answer(subtrahend);

            return ensure(this.descriptionOf(minuendValue), minuendValue, isNumber())
                - ensure(this.descriptionOf(subtrahendValue), subtrahendValue, isNumber());
        });
    }

    /**
     * Returns a Question that calculates the ceiling of a number and throws if the value is not a `number`.
     *
     * @param value
     */
    static ceiling(value: Answerable<number>): QuestionAdapter<number> {
        return Question.about<number>(the`the ceiling of ${ value }`, async actor => {
            const answer = await actor.answer(value);

            return Math.ceil(ensure(this.descriptionOf(answer), answer, isNumber()));
        });
    }

    /**
     * Returns a Question that calculates the floor of a number and throws if the value is not a `number`.
     *
     * @param value
     */
    static floor(value: Answerable<number>): QuestionAdapter<number> {
        return Question.about<number>(the`the floor of ${ value }`, async actor => {
            const answer = await actor.answer(value);

            return Math.floor(ensure(this.descriptionOf(answer), answer, isNumber()));
        });
    }

    /**
     * Returns a Question that calculates the maximum value in the lists of numbers provided and throws if any of the values is not a `number`.
     *
     * @param values
     */
    static max(...values: Array<Answerable<number | number[]>>): QuestionAdapter<number> {
        return Question.about<number>(the`the max of ${ values }`, async actor => {
            const numbers = await actor.answer(this.flatten(values, isNumber()));

            return numbers.sort().pop();
        });
    }

    /**
     * Returns a Question that calculates the minimum value in the lists of numbers provided and throws if any of the values is not a `number`.
     *
     * @param values
     */
    static min(...values: Array<Answerable<number | number[]>>): QuestionAdapter<number> {
        return Question.about<number>(the`the min of ${ values }`, async actor => {
            const numbers = await actor.answer(this.flatten(values, isNumber()));

            return numbers.sort().shift();
        });
    }

    private static flatten<T>(items: Array<Answerable<T | T[]>>, ...predicates: Array<Predicate<T>>): QuestionAdapter<T[]> {
        return Question.about('flatten', async actor => {
            const result: T[] = [];

            for (const item of items) {
                const valueOrValues = await actor.answer(item);
                const values = Array.isArray(valueOrValues)
                    ? valueOrValues
                    : [ valueOrValues ];

                const valuesOfCorrectType = values.map(value => ensure(this.descriptionOf(value), value, ...predicates));

                result.push(...valuesOfCorrectType);
            }

            return result;
        });
    }

    private static descriptionOf(value: unknown): string {
        if (value === undefined) {
            return 'undefined';
        }

        return Question.formattedValue().of(value).toString();
    }
}
