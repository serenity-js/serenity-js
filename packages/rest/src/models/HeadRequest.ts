import { Answerable, Question, WithAnswerableProperties } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';

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
     * when the {@apilink Ability|ability} to {@apilink CallAnApi} was instantiated.
     *
     * @param resourceUri
     *  The URI where the {@apilink Actor}
     *  should send the {@apilink HTTPRequest}
     */
    static to(resourceUri: Answerable<string>): HeadRequest {
        return new HeadRequest(resourceUri);
    }

    /**
     * Overrides the default Axios request configuration provided
     * when the {@apilink Ability|ability} to {@apilink CallAnApi} was instantiated.
     *
     * #### Learn more
     * - {@apilink Answerable}
     * - {@apilink WithAnswerableProperties}
     * - [AxiosRequestConfig](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L75-L113)
     *
     * @param {Answerable<WithAnswerableProperties<AxiosRequestConfig>>} config
     *  Axios request configuration overrides
     */
    using(config: Answerable<WithAnswerableProperties<AxiosRequestConfig>>): HeadRequest {
        return new HeadRequest(this.resourceUri, undefined, Question.fromObject(config));
    }
}
