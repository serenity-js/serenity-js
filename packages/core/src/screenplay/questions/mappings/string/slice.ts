/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isInteger, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { Answerable } from '../../../Answerable';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Extracts the part of the string between the `startIndex` and `endIndex` indexes, or to the end of the string if `endIndex` is `undefined`.
 *
 * @param {Answerable<number>} startIndex
 *  The zero-based index at which to begin extraction.
 *
 *  If negative, it is treated as `str.length + startIndex`. For example, if `startIndex` is `-3`, it is treated as `str.length - 3`
 *
 *  If `startIndex` is greater than or equal to `str.length`, an empty string is returned.
 *
 * @param {Answerable<number>} [endIndex]
 *  The zero-based index _before_ which to endIndex extraction.
 *  The character at this index will not be included.
 *
 *  If `endIndex` is omitted or undefined, or greater than `str.length`,
 *  `slice()` extracts to the endIndex of the string.
 *
 *  If negative, it is treated as `str.length + endIndex`.
 *  For example, if `endIndex` is `-3`, it is treated as `str.length - 3`.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring
 */
export function slice(startIndex: Answerable<number>, endIndex?: Answerable<number>): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (value: string) => {

            ensure('The value to be mapped', value, isDefined(), isString())

            return Promise.all([
                actor.answer(startIndex),
                actor.answer(endIndex),
            ]).then(([ start, end ]) => {

                ensure('startIndex', start, isDefined(), isInteger())

                if (end !== undefined) {
                    ensure('endIndex', end, isInteger());
                }

                return value.slice(start, end);
            });
        };
}
