import { Answerable } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The PUT method requests that the state of the target resource be
 *  created or replaced with the state defined by the representation
 *  enclosed in the request message payload.
 *
 *  PUT request should be used when you want to create
 *  a new resource at a known `resourceUri` (e.g. `/books/0-688-00230-7`)
 *  or replace an existing resource at such `resourceUri`.
 *
 *  PUT request is [idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent):
 *  calling it once or several times successively has the same effect (that is no _side effect_).
 *
 * @example <caption>Create a new resource at a known location</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, LastResponse, PutRequest, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(PutRequest.to('/books/0-688-00230-7').with({
 *          isbn: '0-688-00230-7',
 *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
 *          author: 'Robert M. Pirsig',
 *      })),
 *      Ensure.that(LastResponse.status(), equals(201)),
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
 * @see https://tools.ietf.org/html/rfc7231#section-4.3.4
 *
 * @extends {HTTPRequest}
 */
export class PutRequest extends HTTPRequest {

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
     * @returns {PutRequest}
     */
    static to(resourceUri: Answerable<string>): PutRequest {
        return new PutRequest(resourceUri);
    }

    /**
     * @desc
     *  Configures the object with a request body.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<any>} data
     *  Data to be sent to the `resourceUri`
     *
     * @returns {PutRequest}
     */
    with(data: Answerable<any>): PutRequest {
        return new PutRequest(this.resourceUri, data, this.config);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} was instantiated.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {PutRequest}
     */
    using(config: Answerable<AxiosRequestConfig>): PutRequest {
        return new PutRequest(this.resourceUri, this.data, config);
    }
}
