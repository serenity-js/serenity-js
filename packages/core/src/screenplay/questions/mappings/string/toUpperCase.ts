/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Converts all the alphabetic characters in a string to uppercase.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase
 */
export function toUpperCase(): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (value: string) =>
            ensure('The value to be mapped', value, isDefined(), isString())
                .toUpperCase();
}
