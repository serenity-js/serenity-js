import { Answerable } from '../screenplay';
import { format } from './format';

/**
 * A tag function returning a human-readable description of a template containing one or more {@apilink Answerable}s.
 * This function is deprecated, please use {@apilink format} instead.
 *
 * @apilink https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 *
 * @deprecated
 *
 * @param templates
 * @param placeholders
 */
export function formatted(templates: TemplateStringsArray, ...placeholders: Array<Answerable<any>>): string {
    return format({ markQuestions: false })(templates, ...placeholders);
}
