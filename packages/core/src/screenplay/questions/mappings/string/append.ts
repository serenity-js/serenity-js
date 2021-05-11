/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { Answerable } from '../../../Answerable';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Appends the values to the end of the original string and returns a new string.
 *
 * @param {...Array<Answerable<string>>} values
 *  The values to append to the end of the string.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/concat
 */
export function append(...values: Array<Answerable<string>>): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (originalAnswer: string) => {

            ensure('The value to be mapped', originalAnswer, isDefined(), isString());

            return Promise.all(values.map(value => actor.answer(value)))
                .then(answers => originalAnswer.concat(...answers))
        }
}
