import { Answerable } from '@serenity-js/core';
import { AxiosRequestConfig } from 'axios';
import { HTTPRequest } from './HTTPRequest';

/**
 * @desc
 *  The HTTP HEAD method requests the headers that are returned if the specified resource
 *  would be requested with an HTTP GET method.
 *  Such a request can be done before deciding to download a large resource to save bandwidth, for example.
 *
 * @example <caption>File download test</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, HeadRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(HeadRequest.to('/downloads/my-test-document.pdf')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *      Ensure.that(LastResponse.header('Content-Length'), equals(256)),    // assuming we know the size of the document
 *  );
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
 * @see https://tools.ietf.org/html/rfc7231#section-4.3.2
 *
 * @extends {HTTPRequest}
 */
export class HeadRequest extends HTTPRequest {

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
     * @returns {HeadRequest}
     */
    static to(resourceUri: Answerable<string>): HeadRequest {
        return new HeadRequest(resourceUri);
    }

    /**
     * @desc
     *  Overrides the default Axios request configuration provided
     *  when {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} was instantiated.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} config
     *  Axios request configuration overrides
     *
     * @returns {HeadRequest}
     */
    using(config: Answerable<AxiosRequestConfig>): HeadRequest {
        return new HeadRequest(this.resourceUri, undefined, config);
    }
}
