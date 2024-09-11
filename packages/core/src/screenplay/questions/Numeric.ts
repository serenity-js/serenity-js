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
        // eslint-disable-next-line unicorn/consistent-function-scoping
        function sum(numbers: number[] | number): number {
            return (Array.isArray(numbers) ? numbers : [ numbers ])
                .reduce((acc, current) => {

                    const description = current === undefined
                        ? 'undefined'
                        : Question.formattedValue().of(current).toString();

                    return acc + ensure(description, current, isNumber())
                }, 0);
        }

        return Question.about<number>(the`the sum of ${ values }`, async actor => {
            return values.reduce<Promise<number>>(
                (acc, current) => acc.then(async total => {
                    const valueOrValues = await actor.answer(current);
                    return total + sum(valueOrValues)
                }),
                Promise.resolve(0)
            );
        });
    }
}
