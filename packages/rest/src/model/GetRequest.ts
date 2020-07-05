import { Answerable } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The HTTP GET method requests a representation of the specified resource.
 *  It is the most frequent type of request made by consumers of a typical HTTP API.
 *  For this reason it's important to test every known endpoint that responds to GET requests and ensure that it
 *  behaves correctly.
 *
 *  Since the GET method is used to _retrieve_ data from a server, it should be implemented
 *  as [safe](https://developer.mozilla.org/en-US/docs/Glossary/Safe)
 *  and [idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent).
 *  This means that an identical request can be made once or several times in a row with the same effect while leaving
 *  the server in the same state.
 *
 * @example <caption>Verify response to a GET request</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  interface Book {
 *      title: string;
 *      author: string;
 *  }
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.body<Book>(), equals({
 *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
 *          author: 'Robert M. Pirsig',
 *      })),
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
 * @see https://tools.ietf.org/html/rfc7231#section-4.3.1
 *
 * @extends {HTTPRequest}
 */
export class GetRequest extends HTTPRequest {

    /**
     * @desc
     *  Configures the object with a destination URI.
     *
     *  When the `resourceUri` is not a fully qualified URL but a path, such as `/products/2`,
     *  it gets concatenated with the URL provided to the Axios instance
     *  when the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} was instantiated.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<string>} resourceUri
     *  The URI where the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  should send the {@link HTTPRequest}.
     *
     * @returns {GetRequest}
     */
    static to(resourceUri: Answerable<string>): GetRequest {
        return new GetRequest(resourceUri);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} was instantiated.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {GetRequest}
     */
    using(config: Answerable<AxiosRequestConfig>): GetRequest {
        return new GetRequest(this.resourceUri, undefined, config);
    }
}
