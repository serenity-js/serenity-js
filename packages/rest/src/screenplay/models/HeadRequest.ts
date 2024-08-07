import type { Answerable, WithAnswerableProperties } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { AxiosRequestConfig } from 'axios';

import { HTTPRequest } from './HTTPRequest';

/**
 * The HTTP HEAD method requests the headers that are returned if the specified resource
 * would be requested with an HTTP GET method.
 * Such a request can be done before deciding to download a large resource to save bandwidth, for example.
 *
 * ## File download test
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, HeadRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(CallAnApi.at('https://api.example.org/'))
 *   .attemptsTo(
 *     Send.a(HeadRequest.to('/downloads/my-test-document.pdf')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.header('Content-Length'), equals(256)), // assuming we know the size of the document
 *   )
 * ```
 *
 * ## Learn more
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
 * - https://tools.ietf.org/html/rfc7231#section-4.3.2
 *
 * @group Models
 */
export class HeadRequest extends HTTPRequest {

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
    static to(resourceUri: Answerable<string>): HeadRequest {
        return new HeadRequest(resourceUri);
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
    using(config: Answerable<WithAnswerableProperties<AxiosRequestConfig>>): HeadRequest {
        return new HeadRequest(this.resourceUri, undefined, Question.fromObject(config));
    }
}
