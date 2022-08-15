import { Answerable, Question, WithAnswerableProperties } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';

import { HTTPRequest } from './HTTPRequest';

/**
 * The HTTP GET method requests a representation of the specified resource.
 * It is the most frequent type of request made by consumers of a typical HTTP API.
 * For this reason it's important to test every known endpoint that responds to GET requests and ensure that it
 * behaves correctly.
 *
 * Since the GET method is used to _retrieve_ data from a server, it should be implemented
 * as [safe](https://developer.mozilla.org/en-US/docs/Glossary/Safe)
 * and [idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent).
 * This means that an identical request can be made once or several times in a row with the same effect while leaving
 * the server in the same state.
 *
 * ## Verify response to a GET request
 *
 * ```ts
 *  import { actorCalled } from '@serenity-js/core'
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions'
 *
 *  interface Book {
 *      title: string;
 *      author: string;
 *  }
 *
 *  await actorCalled('Apisitt')
 *    .whoCan(CallAnApi.at('https://api.example.org/'))
 *    .attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.body<Book>(), equals({
 *          title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
 *          author: 'Robert M. Pirsig',
 *      })),
 *    )
 * ```
 *
 * ## Learn more
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
 * - https://tools.ietf.org/html/rfc7231#section-4.3.1
 *
 * @group Models
 */
export class GetRequest extends HTTPRequest {

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
    static to(resourceUri: Answerable<string>): GetRequest {
        return new GetRequest(resourceUri);
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
    using(config: Answerable<WithAnswerableProperties<AxiosRequestConfig>>): GetRequest {
        return new GetRequest(this.resourceUri, undefined, Question.fromObject(config));
    }
}
