/* eslint-disable unicorn/consistent-function-scoping */
import { ensure, isDefined, isString } from 'tiny-types';

import { AnswersQuestions } from '../../../actor';
import { Answerable } from '../../../Answerable';
import { AnswerMappingFunction } from '../AnswerMappingFunction';

/**
 * @desc
 *  Returns the String value result of normalizing the string into the normalization form
 *  named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
 *
 * @param {Answerable<string>} [form]
 *  One of "NFC", "NFD", "NFKC", or "NFKD", specifying the Unicode Normalization Form. If omitted or undefined, "NFC" is used.
 *  These values have the following meanings:
 *   "NFC" - Canonical Decomposition, followed by Canonical Composition.
 *   "NFD" - Canonical Decomposition.
 *   "NFKC" - Compatibility Decomposition, followed by Canonical Composition.
 *   "NFKD" - Compatibility Decomposition.
 *
 * @returns {AnswerMappingFunction<string, string>}
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */
export function normalize(form?: Answerable<string>): AnswerMappingFunction<string, string> {
    return (actor: AnswersQuestions) =>
        (value: string) => {

            ensure('The value to be mapped', value, isDefined(), isString())

            return actor.answer(form).then(answer => value.normalize(answer));
        }
}
