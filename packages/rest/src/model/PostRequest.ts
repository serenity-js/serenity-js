import { Answerable } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The HTTP POST method requests that the origin server accepts
 *  the entity enclosed in the request as a new subordinate of the resource
 *  identified by the `resourceUri`.
 *
 *  This means that the POST should be used when you want to create a child resource under
 *  a collection of resources.
 *
 *  POST request is neither [safe](https://developer.mozilla.org/en-US/docs/Glossary/Safe),
 *  nor [idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent).
 *  This means that if you retry a POST request N times,
 *  a correctly implemented HTTP REST API will create N resources with N different URIs.
 *
 * @example <caption>Add new resource to a collection</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, LastResponse, PostRequest, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(PostRequest.to('/books').with({
 *          isbn: '0-688-00230-7',
 *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
 *          author: 'Robert M. Pirsig',
 *      })),
 *      Ensure.that(LastResponse.status(), equals(201)),
 *      Ensure.that(LastResponse.header('Location'), equals('/books/0-688-00230-7')),
 *  );
 *
 * @example <caption>Submit a HTML form</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, LastResponse, PostRequest, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { stringify } from 'querystring';
 *
 *  const
 *      actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com')),
 *      formData = stringify({
 *          name: actor.name,
 *          email: `${ actor.name }@example.com`,
 *          text: 'Your website is great! Learnt a lot :-)'
 *      });
 *
 *  actor.attemptsTo(
 *      Send.a(PostRequest.to('/feedback').with(postData).using({
 *          headers: {
 *              'Content-Type': 'application/x-www-form-urlencoded',
 *              'Content-Length': formData.length
 *          }
 *      })),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.header('Location'), equals('/feedback/thank-you.html')),
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
 * @see https://tools.ietf.org/html/rfc7231#section-4.3.3
 *
 * @extends {HTTPRequest}
 */
export class PostRequest extends HTTPRequest {

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
     * @returns {PostRequest}
     */
    static to(resourceUri: Answerable<string>): PostRequest {
        return new PostRequest(resourceUri);
    }

    /**
     * @desc
     *  Configures the object with a request body.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<any>} data
     *  Data to be sent to the `resourceUri`
     *
     * @returns {PostRequest}
     */
    with(data: Answerable<any>): PostRequest {
        return new PostRequest(this.resourceUri, data, this.config);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} was instantiated.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {PostRequest}
     */
    using(config: Answerable<AxiosRequestConfig>): PostRequest {
        return new PostRequest(this.resourceUri, this.data, config);
    }
}
