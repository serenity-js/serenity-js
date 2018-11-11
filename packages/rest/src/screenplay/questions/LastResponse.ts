import { Question } from '@serenity-js/core';
import { CallAnApi } from '../abilities';

/**
 * @desc
 *  Provides access to the properties of the last {@link AxiosResponse} object,
 *  cached on the {@link CallAnApi} {@link Ability}.
 *
 * @example <caption>Verify response to a GET request</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.header('Content-Type'), equals('application/json')),
 *      Ensure.that(LastResponse.body(), equals({
 *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
 *          author: 'Robert M. Pirsig',
 *      })),
 *  );
 */
export class LastResponse {

    /**
     * @desc
     *  Enables asserting on the {@link LastResponse} status
     *
     * @returns {Question<number>}
     */
    static status(): Question<number> {
        return Question.about<number>(`the status of the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.status);
        });
    }

    /**
     * @desc
     *  Enables asserting on the {@link LastResponse} body
     *
     * @returns {Question<any>}
     */
    static body(): Question<any> {
        return Question.about<any>(`the body of the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.data);
        });
    }

    /**
     * @desc
     *  Enables asserting on one of the {@link LastResponse}'s headers
     *
     * @returns {Question<string>}
     */
    static header(name: string): Question<string> {
        return Question.about<string>(`the '${ name }' header of the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.headers[name]);
        });
    }

    /**
     * @desc
     *  Enables asserting on all of the {@link LastResponse}'s headers
     *
     * @returns {Question<{ [header: string ]: string }>}
     */
    static headers() {
        return Question.about<{ [header: string ]: string }>(`the headers or the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.headers);
        });
    }
}
