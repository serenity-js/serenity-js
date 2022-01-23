import { Answerable } from '../screenplay';
import { inspected } from './inspected';

/**
 * @desc
 *  A factory function returning a tag function that produces a human-readable description of a template containing one or more {@link Answerable}s.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 * @example
 *  import { format, Question } from '@serenity-js/core';
 *
 *  const someQuestion = () =>
 *      Question.about('some question', actor => 'some value');
 *
 *  format({ markQuestions: true }) `actor answers ${ question() }`;
 *  // returns: actor answers <<some question>>
 *
 *  format({ markQuestions: false }) `actor answers ${ question() }`;
 *  // returns: actor answers <<some question>>
 *
 * @example <caption>Aliasing</caption>
 *  import { format, Question } from '@serenity-js/core';
 *
 *  const f = format({ markQuestions: true });
 *
 *  const someQuestion = () =>
 *      Question.about('some question', actor => 'some value');
 *
 *  f `actor answers ${ question() }`;
 *  // produces: actor answers <<some question>>
 *
 * @param {object} config
 *  - `markQuestions`: boolean - if set to true, descriptions of questions passed in as arguments will be surrounded with double angled brackets, i.e. `<<description>>`
 * @returns {function(templates: TemplateStringsArray, placeholders: ...Array<Answerable<any>>): string}
 */
export function format(config: { markQuestions: boolean }): (templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>) => string {
    return (templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>): string => {
        return templates
            .map((template, i) => i < placeholders.length
                ? [ template, inspected(placeholders[i], { inline: true, markQuestions: config.markQuestions }) ]
                : [ template ])
            .reduce((acc, tuple) => acc.concat(tuple))
            .join('');
    }
}

export const f = format({ markQuestions: true });
export const d = format({ markQuestions: false });
