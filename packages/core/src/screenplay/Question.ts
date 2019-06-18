import { AnswersQuestions, UsesAbilities } from './actor';

/**
 * @desc
 *  Enables the {@link Actor} to query the system under test.
 *
 * @example <caption>A basic Question</caption>
 * import { Actor, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * const LastItemOf = <T>(list: T[]): Question<T> =>
 *     Question.about('last item from the list', (actor: AnswersQuestions & UsesAbilities) => {
 *         return list[list.length - 1];
 *     });
 *
 * Actor.named('Quentin').attemptsTo(
 *     Ensure.that(LastItemFrom([1,2,3]), equals(3)),
 * );
 *
 * @example <caption>A question using the Actor's Ability to do something</caption>
 * import { AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 * import { CallAnApi } from '@serenity-js/rest'
 *
 * const TextOfLastResponseStatus = () =>
 *     Question.about<number>(`the text of the last response status`, actor => {
 *         return CallAnApi.as(actor).mapLastResponse(response => response.statusText);
 *     });
 *
 * @example <caption>Mapping answers to other questions</caption>
 * import { Actor, AnswersQuestions, UsesAbilities, Question } from '@serenity-js/core'
 * import { CallAnApi, LastResponse } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions';
 *
 * const RequestWasSuccessful = () =>
 *     Question.about<number>(`the text of the last response status`, actor => {
 *         return LastResponse.status().answeredBy(actor) === 200;
 *     });
 *
 * const actor = Actor.named('Quentin').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 * actor.attemptsTo(
 *     Send.a(GetRequest.to('/books/0-688-00230-7')),
 *     Ensure.that(RequestWasSuccessful(), equals(true)),
 * );
 */
export abstract class Question<T> {

    /**
     *  Factory method that simplifies the process of defining custom questions.
     */
    static about<R>(description: string, body: (actor: AnswersQuestions & UsesAbilities) => R): Question<R> {
        return new AnonymousQuestion<R>(description, body);
    }

    /**
     * Checks if the value is a {@link Question}
     * @returns {boolean}
     */
    static isAQuestion<T>(maybeQuestion: any): maybeQuestion is Question<T> {
        return !! (maybeQuestion as any).answeredBy;
    }

    /**
     * @abstract
     */
    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): T;
}

/**
 * @package
 */
class AnonymousQuestion<T> implements Question<T> {
    constructor(private description: string, private body: (actor: AnswersQuestions & UsesAbilities) => T) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities) {
        return this.body(actor);
    }

    toString() {
        return this.description;
    }
}
