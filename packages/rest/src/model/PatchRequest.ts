import { KnowableUnknown } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The PATCH method requests that a set of changes described in the
 *  request entity be applied to the resource identified by the `resourceUri`.
 *
 * @example <caption>Add new resource to a collection</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, LastResponse, PatchRequest, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(PatchRequest.to('/books/0-688-00230-7').with({
 *          lastReadOn: '2016-06-16',
 *      })),
 *      Ensure.that(LastResponse.status(), equals(204)),
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
 * @see https://tools.ietf.org/html/rfc5789
 */
export class PatchRequest extends HTTPRequest {

    /**
     * @desc
     *  Configures the object with a destination URI.
     *
     *  When the `resourceUri` is not a fully qualified URL but a path, such as `/products/2`,
     *  it gets concatenated with the URL provided to the Axios instance
     *  when the {@link CallAnApi} {@link Ability} was instantiated.
     *
     * @param {KnowableUnknown<string>} resourceUri
     *  The URI where the {@link Actor} should send the {@link HTTPRequest}.
     *
     * @returns {PatchRequest}
     */
    static to(resourceUri: KnowableUnknown<string>): PatchRequest {
        return new PatchRequest(resourceUri);
    }

    /**
     * @desc
     *  Configures the object with a request body.
     *
     * @param {KnowableUnknown<any>} data
     *  Data to be sent to the `resourceUri`
     *
     * @returns {PatchRequest}
     */
    with(data: KnowableUnknown<any>): PatchRequest {
        return new PatchRequest(this.resourceUri, data, this.config);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link Ability} was instantiated.
     *
     * @param {KnowableUnknown<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {PatchRequest}
     */
    using(config: AxiosRequestConfig): PatchRequest {
        return new PatchRequest(this.resourceUri, this.data, config);
    }
}
