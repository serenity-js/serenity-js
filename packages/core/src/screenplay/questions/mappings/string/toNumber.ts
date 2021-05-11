/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Converts a `string` to a `number`.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
 */
export function toNumber(): AnswerMappingFunction<string, number> {
    return (actor: AnswersQuestions) =>
        (value: string) =>
            Number(ensure('value', value, isDefined()));
}
