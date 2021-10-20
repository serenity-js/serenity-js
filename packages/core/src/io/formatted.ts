import { Answerable } from '../screenplay/Answerable';
import { inspected } from './inspected';

/**
 * @desc
 *  A tag function returning a human-readable description of a template containing one or more {@link Answerable}s.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 * @param {TemplateStringsArray} templates
 * @param {Array<Answerable<any>>} placeholders
 * @returns {string}
 */
export function formatted(templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>): string {
    const inline = true;
    return templates
        .map((template, i) => i < placeholders.length
            ? [ template, inspected(placeholders[i], { inline }) ]
            : [ template ])
        .reduce((acc, tuple) => acc.concat(tuple))
        .join('');
}
