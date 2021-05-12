/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Returns a string where all alphabetic characters have been converted to uppercase,
 *  taking into account the host environment's current locale.
 *
 * @param {Answerable<string | string[]>} [locales]
 *  The `locale` parameter indicates the locale to be used to convert to lower case according to any
 *  locale-specific case mappings. If multiple locales are given in an `Array`,
 *  the [best available locale](https://tc39.es/ecma402/#sec-bestavailablelocale) is used.
 *  The default locale is the host environment’s current locale.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase
 */
export function toLocaleUpperCase(locales?: string | string[]): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (value: string) => {
            ensure('The value to be mapped', value, isDefined(), isString());

            return actor.answer(locales)
                .then(l => value.toLocaleUpperCase(l));
        }
}
