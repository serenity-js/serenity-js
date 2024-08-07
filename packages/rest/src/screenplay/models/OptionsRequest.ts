import type { Answerable, WithAnswerableProperties } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { AxiosRequestConfig } from 'axios';

import { HTTPRequest } from './HTTPRequest';

/**
 * The OPTIONS method requests information about the communication
 * options available for the target resource, at either the origin
 * server or an intervening intermediary.  This method allows a client
 * to determine the options and/or requirements associated with a
 * resource, or the capabilities of a server, without implying a
 * resource action.
 *
 * ## File download test
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, OptionsRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(CallAnApi.at('https://api.example.org/'))
 *   .attemptsTo(
 *     Send.a(OptionsRequest.to('/downloads/my-test-document.pdf')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.header('Allow'), equals('OPTIONS, GET, HEAD')),
 *   )
 * ```
 *
 * ## Learn more
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
 * - https://tools.ietf.org/html/rfc7231#section-4.3.7
 *
 * @group Models
 */
export class OptionsRequest extends HTTPRequest {

    /**
     * Configures the object with a destination URI.
     *
     * When the `resourceUri` is not a fully qualified URL but a path, such as `/products/2`,
     * it gets concatenated with the URL provided to the Axios instance
     * when the [ability](https://serenity-js.org/api/core/class/Ability/) to [`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi/) was instantiated.
     *
     * @param resourceUri
     *  The URI where the [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     *  should send the [`HTTPRequest`](https://serenity-js.org/api/rest/class/HTTPRequest/)
     */
    static to(resourceUri: Answerable<string>): OptionsRequest {
        return new OptionsRequest(resourceUri);
    }

    /**
     * Overrides the default Axios request configuration provided
     * when the [ability](https://serenity-js.org/api/core/class/Ability/) to [`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi/) was instantiated.
     *
     * #### Learn more
     * - [`Answerable`](https://serenity-js.org/api/core/#Answerable)
     * - [`WithAnswerableProperties`](https://serenity-js.org/api/core/#WithAnswerableProperties)
     * - [AxiosRequestConfig](https://axios-http.com/docs/req_config)
     *
     * @param {Answerable<WithAnswerableProperties<AxiosRequestConfig>>} config
     *  Axios request configuration overrides
     */
    using(config: Answerable<WithAnswerableProperties<AxiosRequestConfig>>): OptionsRequest {
        return new OptionsRequest(this.resourceUri, undefined, Question.fromObject(config));
    }
}
