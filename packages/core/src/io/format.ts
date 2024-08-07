import type { Answerable } from '../screenplay';
import { stringified } from './stringified';

/**
 * `format` is a factory function returning
 * a [tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals)
 * that produces a human-readable `string` description of a template containing
 * one or more [answerables](https://serenity-js.org/api/core/#Answerable).
 *
 * Typically, you'll want to use `d` and `f` shorthands instead, or the modern alternative - `the`:
 * - the [`d`](https://serenity-js.org/api/core/function/d/) function works best for generating a **static description** of a parameterised [`Activity`](https://serenity-js.org/api/core/class/Activity/)
 * - the [`f`](https://serenity-js.org/api/core/function/f/) function is better suited for debugging
 * - the [`the`](https://serenity-js.org/api/core/function/f/) function works best for generating a **dynamic description** of a parameterised [`Activity`](https://serenity-js.org/api/core/class/Activity/)
 *
 * :::tip Use `the` instead of `format`
 * `format`, `d` and `f` are the original Serenity/JS string formatting functions,
 * still present in the framework for backwards compatibility purposes.
 *
 * To generate a dynamic description of a `Question` or `Interaction`,
 * use [`the`](https://serenity-js.org/api/core/function/the/) function instead.
 * :::
 *
 * ## Using `format`
 *
 * ```ts
 * import { format, Question } from '@serenity-js/core'
 *
 * const someQuestion = () =>
 *   Question.about('some question', actor => 'some value')
 *
 * format({ markQuestions: true }) `actor answers ${ question() }`
 *  // returns: actor answers <<some question>>
 *
 * format({ markQuestions: false }) `actor answers ${ question() }`
 *  // returns: actor answers some question
 * ```
 *
 * ## Using `d`
 *
 * ```ts
 * import { d, Question } from '@serenity-js/core'
 *
 * const someQuestion = () =>
 *   Question.about('some question', actor => 'some value')
 *
 * d`actor answers ${ question() }`
 *  // returns: actor answers <<some question>>
 * ```
 *
 * ## Using `f`
 *
 * ```ts
 * import { f, Question } from '@serenity-js/core'
 *
 * const someQuestion = () =>
 *   Question.about('some question', actor => 'some value')
 *
 * f`actor answers ${ question() }`
 *  // returns: actor answers <<some question>>
 *
 * format({ markQuestions: false }) `actor answers ${ question() }`
 *  // returns: actor answers <<some question>>
 * ```
 *
 * @param config
 *  `markQuestions`: boolean - if set to true, descriptions of questions passed in as arguments will be surrounded with double angled brackets, i.e. `<<description>>`
 *
 * @group Questions
 */
export function format(config: { markQuestions: boolean }): (templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>) => string {
    return (templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>): string => {
        return templates
            .map((template, i) => i < placeholders.length
                ? [ template, stringified(placeholders[i], { inline: true, markQuestions: config.markQuestions }) ]
                : [ template ])
            .reduce((acc, tuple) => acc.concat(tuple), [])
            .join('');
    }
}

/** @group Questions */
export const f = format({ markQuestions: true });

/** @group Questions */
export const d = format({ markQuestions: false });
