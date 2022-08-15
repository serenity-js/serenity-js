import { Answerable, Question, WithAnswerableProperties } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';

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
     * when the {@apilink Ability|ability} to {@apilink CallAnApi} was instantiated.
     *
     * @param resourceUri
     *  The URI where the {@apilink Actor}
     *  should send the {@apilink HTTPRequest}
     */
    static to(resourceUri: Answerable<string>): OptionsRequest {
        return new OptionsRequest(resourceUri);
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
    using(config: Answerable<WithAnswerableProperties<AxiosRequestConfig>>): OptionsRequest {
        return new OptionsRequest(this.resourceUri, undefined, Question.fromObject(config));
    }
}
