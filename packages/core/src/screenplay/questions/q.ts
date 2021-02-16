import { Answerable } from '../Answerable';
import { Question } from '../Question';

/**
 * @desc
 *  A Screenplay-flavour of a [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates),
 *  `q` is a tag function capable of resolving any `Answerable<string | number>` you parametrise it with (i.e. a {@link Question}).
 *
 * @example <caption>Interpolating `Questions`</caption>
 *  import { q, actorCalled } from '@serenity-js/core';
 *  import { Send, DeleteRequest } from '@serenity-js/rest';
 *
 *  actorCalled('Alice').attemptsTo(
 *      Send.a(DeleteRequest.to(
 *          q `/articles/${ Text.of(Article.id()) }`
 *      ))
 *  )
 *
 * @example <caption>Using a custom description</caption>
 *  import { q, actorCalled } from '@serenity-js/core';
 *  import { Send, DeleteRequest } from '@serenity-js/rest';
 *
 *  actorCalled('Alice').attemptsTo(
 *      Send.a(DeleteRequest.to(
 *          q `/articles/${ Text.of(Article.id()) }`.describedAs('/articles/:id')
 *      ))
 *  )
 *
 * @param {TemplateStringsArray} templates
 * @param {Array<Answerable<string | number>>} parameters
 *
 * @returns {Question<Promise<string>>}
 *
 * @see {@link Question}
 */
export function q(templates: TemplateStringsArray, ...parameters: Array<Answerable<string | number>>): Question<Promise<string>> {
    return Question.about(templates.join('{}'), actor =>
        Promise.all(parameters.map(parameter => actor.answer(parameter)))
            .then(answers =>
                templates
                    .map((template, i) =>
                        i < answers.length
                            ? [ template, answers[i] ]
                            : [ template ])
                    .reduce((acc, tuple) =>
                        acc.concat(tuple)
                    )
                    .join('')
            )
    );
}
