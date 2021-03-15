import { Question } from '@serenity-js/core';
import { CallAnApi } from '../abilities';

/**
 * @desc
 *  Provides access to the properties of the last {@link AxiosResponse} object,
 *  cached on the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}.
 *
 * @example <caption>Verify response to a GET request</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  interface Book {
 *      title: string;
 *      author: string
 *  }
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.header('Content-Type'), equals('application/json')),
 *      Ensure.that(LastResponse.body<Book>(), equals({
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
     * @returns {@serenity-js/core/lib/screenplay~Question<number>}
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
     * @example <caption>A type-safe approach using generics</caption>
     *  interface Book {
     *      title: string;
     *      author: string
     *  }
     *
     *  actor.attemptsTo(
     *      // ...
     *      Ensure.that(LastResponse.body<Book>(), equals({
     *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
     *          author: 'Robert M. Pirsig',
     *      })),
     *  );
     *
     * @example <caption>A non-type-safe approach using `any`</caption>
     *  actor.attemptsTo(
     *      // ...
     *      Ensure.that(LastResponse.body<any>(), equals({
     *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
     *          author: 'Robert M. Pirsig',
     *      })),
     *  );
     *
     * @example <caption>Retrieving an item at path using Property.of</caption>
     *  import { Property } from '@serenity-js/core';
     *
     *  actor.attemptsTo(
     *      Ensure.that(
     *          Property.of(LastResponse.body<Book>()).title,
     *          equals('Zen and the Art of Motorcycle Maintenance: An Inquiry into Values'),
     *      )
     *  )
     *
     * @example <caption>Filtering response body using List</caption>
     *  import { Property } from '@serenity-js/core';
     *  import { property, startsWith } from '@serenity-js/assertions';
     *
     *  actor.attemptsTo(
     *      Ensure.that(
     *          // imagine the API returns an array of books
     *          List.of(LastResponse.body<Book[]>())
     *              .where(Property.at<Book>().author, equals('Robert M. Pirsig'))
     *              .first(),
     *          property('title', startsWith('Zen and the Art of Motorcycle Maintenance')),
     *      )
     *  )
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<any>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~Property}
     * @see {@link @serenity-js/core/lib/screenplay/questions~List}
     */
    static body<T = any>(): Question<T> {
        return Question.about<T>(`the body of the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse<T>(response => response.data as T);
        });
    }

    /**
     * @desc
     *  Enables asserting on one of the {@link LastResponse}'s headers
     *
     * @param {string} name
     * @returns {@serenity-js/core/lib/screenplay~Question<string>}
     */
    static header(name: string): Question<string> {
        return Question.about<string>(`the '${ name }' header of the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.headers[name]);
        });
    }

    /**
     * @desc
     *  Enables asserting on all of the {@link LastResponse}'s headers,
     *  returned as an object where the keys represent header names.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<object>}
     */
    static headers() {
        return Question.about<{ [header: string ]: string }>(`the headers or the last response`, actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.headers);
        });
    }
}
