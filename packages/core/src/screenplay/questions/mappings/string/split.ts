/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isNotBlank, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Divides a string into an ordered list of substrings, puts these substrings into an array, and returns the array.
 *  The division is done by searching for a pattern; where the pattern is provided as the first parameter in the method's call.
 *
 * @param {Answerable<string | RegExp>} separator
 *  The pattern describing where each split should occur.  The separator can be a simple string or it can be a regular expression.
 *
 * @param {Answerable<number>} [limit]
 *  A non-negative integer specifying a limit on the number of substrings to be included in the array.
 *  If provided, splits the string at each occurrence of the specified separator, but stops when limit entries have been placed in the array.
 *  Any leftover text is not included in the array at all.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
 */
export function split(separator: string | RegExp, limit?: number): AnswerMappingFunction<string, string[]> {
    return (actor: AnswersQuestions) =>
        (value: string) => {
            ensure('The value to be mapped', value, isDefined(), isString())

            return Promise.all([
                actor.answer(separator),
                actor.answer(limit),
            ]).then(([ s, l ]) => {
                ensure('The separator', value, isDefined(), isString(), isNotBlank());

                return value.split(s, l);
            });
        };
}
