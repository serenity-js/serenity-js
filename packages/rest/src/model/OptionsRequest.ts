import { KnowableUnknown } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The OPTIONS method requests information about the communication
 *  options available for the target resource, at either the origin
 *  server or an intervening intermediary.  This method allows a client
 *  to determine the options and/or requirements associated with a
 *  resource, or the capabilities of a server, without implying a
 *  resource action.
 *
 * @example <caption>File download test</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, OptionsRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(OptionsRequest.to('/downloads/my-test-document.pdf')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.header('Allow'), equals('OPTIONS, GET, HEAD')),
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
 * @see https://tools.ietf.org/html/rfc7231#section-4.3.7
 *
 * @extends {HTTPRequest}
 */
export class OptionsRequest extends HTTPRequest {

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
     * @returns {OptionsRequest}
     */
    static to(resourceUri: KnowableUnknown<string>): OptionsRequest {
        return new OptionsRequest(resourceUri);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link Ability} was instantiated.
     *
     * @param {KnowableUnknown<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {OptionsRequest}
     */
    using(config: KnowableUnknown<AxiosRequestConfig>): OptionsRequest {
        return new OptionsRequest(this.resourceUri, undefined, config);
    }
}
