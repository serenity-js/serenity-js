import { Answerable } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The DELETE method requests that the origin server remove the
 *  association between the target resource and its current
 *  functionality.
 *
 * @example <caption>Create and remove a resource</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, DeleteRequest, LastResponse, PostRequest, Send } from '@serenity-js/rest'
 *  import { Ensure, equals, startsWith } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      // create a new test user account
 *      Send.a(PostRequest.to('/users').with({
 *          login: 'tester',
 *          password: 'P@ssword1',
 *      }),
 *      Ensure.that(LastResponse.status(), equals(201)),
 *      Ensure.that(LastResponse.header('Location'), startsWith('/users')),
 *
 *      // delete the test user account
 *      Send.a(DeleteRequest.to(LastResponse.header('Location'))),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
 * @see https://tools.ietf.org/html/rfc7231#section-4.3.5
 *
 * @extends {HTTPRequest}
 */
export class DeleteRequest extends HTTPRequest {

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
     * @returns {DeleteRequest}
     */
    static to(resourceUri: Answerable<string>): DeleteRequest {
        return new DeleteRequest(resourceUri);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} was instantiated.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {DeleteRequest}
     */
    using(config: Answerable<AxiosRequestConfig>): DeleteRequest {
        return new DeleteRequest(this.resourceUri, undefined, config);
    }
}
