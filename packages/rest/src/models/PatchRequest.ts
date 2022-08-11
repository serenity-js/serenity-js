import { Answerable, Question, WithAnswerableProperties } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';

import { HTTPRequest } from './HTTPRequest';

/**
 * The PATCH method requests that a set of changes described in the
 * request entity be applied to the resource identified by the `resourceUri`.
 *
 * ## Add new resource to a collection
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, LastResponse, PatchRequest, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(CallAnApi.at('https://api.example.org/'))
 *   .attemptsTo(
 *     Send.a(PatchRequest.to('/books/0-688-00230-7').with({
 *       lastReadOn: '2016-06-16',
 *     })),
 *     Ensure.that(LastResponse.status(), equals(204)),
 *   )
 * ```
 *
 * ## Learn more
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
 * - https://tools.ietf.org/html/rfc5789
 *
 * @group Models
 */
export class PatchRequest extends HTTPRequest {

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
    static to(resourceUri: Answerable<string>): PatchRequest {
        return new PatchRequest(resourceUri);
    }

    /**
     * Configures the object with a request body.
     *
     * @param data
     *  Data to be sent to the `resourceUri`
     */
    with(data: Answerable<any>): PatchRequest {
        return new PatchRequest(this.resourceUri, data, this.config);
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
    using(config: Answerable<WithAnswerableProperties<AxiosRequestConfig>>): PatchRequest {
        return new PatchRequest(this.resourceUri, this.data, Question.fromObject(config));
    }
}
