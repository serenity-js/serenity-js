/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Removes whitespace from both ends of a string.
 *  Whitespace in this context is all the whitespace characters (space, tab, no-break space, etc.)
 *  and all the line terminator characters (LF, CR, etc.).
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
 */
export function trim(): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (value: string) =>
            ensure('The value to be mapped', value, isDefined(), isString())
                .trim();
}
