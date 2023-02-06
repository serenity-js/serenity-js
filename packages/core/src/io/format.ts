import { Answerable } from '../screenplay';
import { stringified } from './stringified';

/**
 * {@apilink format} is a factory function returning
 * a [tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals)
 * that produces a human-readable description of a template containing
 * one or more {@apilink Answerable|Answerables}.
 *
 * Typically, you'll want to use {@apilink d} and {@apilink f} shorthands instead:
 * - the {@apilink d} function works best for generating a **description** of a parameterised {@apilink Activity}
 * - the {@apilink f} function is better suited for debugging.
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
