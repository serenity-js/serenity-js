import { ensure, isNumber, isString, type Predicate } from 'tiny-types';

import type { UsesAbilities } from '../abilities';
import type { Answerable } from '../Answerable';
import type { QuestionAdapter } from '../Question';
import { Question } from '../Question';
import type { AnswersQuestions } from './AnswersQuestions';
import type { MetaQuestion } from './MetaQuestion';
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
     */
    static ceiling(): MetaQuestion<number, QuestionAdapter<number>> {
        return {
            of: (value: Answerable<number>) =>
                Question.about(the`the ceiling of ${ value }`, async (actor: AnswersQuestions & UsesAbilities) => {
                    const answer = await actor.answer(value);

                    return Math.ceil(ensure(this.descriptionOf(answer), answer, isNumber()));
                }),
        };
    }

    /**
     * Returns a Question that calculates the floor of a number and throws if the value is not a `number`.
     */
    static floor(): MetaQuestion<number, QuestionAdapter<number>> {
        return {
            of: (value: Answerable<number>) =>
                Question.about(the`the floor of ${ value }`, async (actor: AnswersQuestions & UsesAbilities) => {
                    const answer = await actor.answer(value);

                    return Math.floor(ensure(this.descriptionOf(answer), answer, isNumber()));
                }),
        }
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

    /**
     * Returns a MetaQuestionAdapter that parses a string `value` and returns an integer of the specified `base`.
     * Leading whitespace in the value to parse argument is ignored.
     *
     * @param base
     *  An integer between 2 and 36 that represents the base in mathematical numeral systems of the string.
     *  If base is undefined or 0, it is assumed to be 10 except when the number begins with the code unit pairs 0x or 0X, in which case a radix of 16 is assumed.
     */
    static intValue(base?: Answerable<number>): MetaQuestion<string, QuestionAdapter<number>> {
        return {
            /**
             * @param value
             *  The value to parse, coerced to a string. Leading whitespace in this argument is ignored.
             */
            of: (value: Answerable<string>) =>
                Question.about<Promise<number>>(the`the integer value of ${ value }`,
                    async actor => {
                        const description = this.descriptionOf(value);
                        const stringValue = ensure(description, await actor.answer(value), isString());
                        const maybeBase = await actor.answer(base)

                        const radix = maybeBase !== undefined && maybeBase !== null
                            ? ensure(`base ${ this.descriptionOf(base) }`, maybeBase, isNumber())
                            : undefined;

                        const parsed = Number.parseInt(stringValue, radix);

                        if (Number.isNaN(parsed)) {
                            throw new TypeError(`Parsing ${ description } as an integer value returned a NaN`);
                        }

                        return parsed;
                    }),
        }
    }

    /**
     * Returns a MetaQuestion that parses a string `value` and returns a BigInt.
     * Leading whitespace in the value to parse argument is ignored.
     */
    static bigIntValue(): MetaQuestion<string, QuestionAdapter<bigint>> {
        return {
            /**
             * @param value
             *  The value to parse, coerced to a string. Leading whitespace in this argument is ignored.
             */
            of: (value: Answerable<string>) =>
                Question.about<Promise<bigint>>(the`the bigint value of ${ value }`, async actor => {
                    const description = this.descriptionOf(value);
                    const stringValue = ensure(description, await actor.answer(value), isString());

                    try {
                        return BigInt(stringValue);
                    }
                    catch(error) {
                        throw new TypeError(`Parsing ${ description } as a bigint value returned an error: ${ error.message || error }`);
                    }
                }),
        }
    }

    /**
     * Returns a MetaQuestion that parses a string `value` and returns a floating-point number.
     * /Users/jan/Projects/serenity-js/serenity-js/packages/core/src/screenplay/questions/Numeric.ts
     */
    static floatValue(): MetaQuestion<string, QuestionAdapter<number>> {
        return {
            /**
             * @param value
             *  The value to parse, coerced to a string. Leading whitespace in this argument is ignored.
             */
            of: (value: Answerable<string>) =>
                Question.about<Promise<number>>(the`the float value of ${ value }`, async actor => {
                    const description = this.descriptionOf(value);
                    const maybeNumber = ensure(description, await actor.answer(value), isString());

                    const parsed = Number.parseFloat(maybeNumber);

                    if (Number.isNaN(parsed)) {
                        throw new TypeError(`Parsing ${ description } as a float value returned a NaN`);
                    }

                    return parsed;
                }),
        }
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
