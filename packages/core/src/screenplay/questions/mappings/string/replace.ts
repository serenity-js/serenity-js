/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { Answerable } from '../../../Answerable';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Returns a new string with some or all matches of a pattern replaced by a replacement.
 *  The pattern can be a string or a RegExp, and the replacement can be a string or a function to be called for each match.
 *  If pattern is a string, only the first occurrence will be replaced.
 *
 * @param {Answerable<string | RegExp>} pattern
 *
 * @param {Answerable<string|function>} replacement
 *
 * @returns {MappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 */
export function replace(pattern: Answerable<RegExp | string>, replacement: Answerable<string | ((substring: string, ...args: any[]) => string)>): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (value: string) => {
            ensure('The value to be mapped', value, isDefined(), isString())

            return Promise.all([
                actor.answer(pattern),
                actor.answer(replacement),
            ]).then(([p, r]) =>
                value.replace(p, r as any),
            );
        }
}
