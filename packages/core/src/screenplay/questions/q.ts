import { Answerable } from '../Answerable';
import { Question, QuestionAdapter } from '../Question';

/**
 * A Serenity/JS Screenplay Pattern-flavour
 * of a [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates),
 * `q` is a tag function capable of resolving any `Answerable<string>` or `Answerable<number>`
 * you parametrise it with, and returning a `QuestionAdapter<string>`.
 *
 * Use `q` to concatenate `string` and `number` values returned from synchronous an asynchronous sources.
 *
 * ## Interpolating questions
 *
 * ```ts
 * import { q, actorCalled } from '@serenity-js/core'
 * import { Send, DeleteRequest } from '@serenity-js/rest'
 * import { Text } from '@serenity-js/web'
 *
 * await actorCalled('Alice').attemptsTo(
 *   Send.a(DeleteRequest.to(
 *     q `/articles/${ Text.of(Article.id()) }`
 *   ))
 * )
 * ```
 *
 * ## Using a custom description
 *
 * ```ts
 * import { q, actorCalled } from '@serenity-js/core'
 * import { Send, DeleteRequest } from '@serenity-js/rest'
 *
 * await actorCalled('Alice').attemptsTo(
 *   Send.a(DeleteRequest.to(
 *     q `/articles/${ Text.of(Article.id()) }`.describedAs('/articles/:id')
 *   ))
 * )
 * ```
 *
 * ## Transforming the interpolated string
 *
 * The mechanism presented below relies on {@apilink QuestionAdapter}.
 *
 * ```ts
 * import { q, actorCalled } from '@serenity-js/core'
 * import { Send, DeleteRequest } from '@serenity-js/rest'
 *
 * await actorCalled('Alice').attemptsTo(
 *   Send.a(DeleteRequest.to(
 *     q `/articles/${ Text.of(Article.id()) }`.toLocaleLowerCase()
 *   ))
 * )
 * ```
 *
 * ## Learn more
 *
 * - {@apilink Answerable}
 * - {@apilink Question}
 * - {@apilink Question.describedAs}
 * - {@apilink QuestionAdapter}
 *
 * @group Questions
 *
 * @param templates
 * @param parameters
 */
export function q(templates: TemplateStringsArray, ...parameters: Array<Answerable<string | number>>): QuestionAdapter<string> {
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
