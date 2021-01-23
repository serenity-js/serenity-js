import { Answerable, AnswersQuestions, CollectsArtifacts, Interaction, UsesAbilities } from '@serenity-js/core';
import { Artifact, HTTPRequestResponse, Name, RequestAndResponse } from '@serenity-js/core/lib/model';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CallAnApi } from '../abilities';

/**
 * @desc
 *  Sends a {@link HTTPRequest} to a specified url.
 *  The response to the request is made available via the {@link LastResponse}
 *  {@link @serenity-js/core/lib/screenplay~Question}s.
 *
 * @example <caption>Send a GET request</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(CallAnApi.at('https://myapp.com/api'));
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/books/0-688-00230-7')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *  );
 *
 * @extends {Interaction}
 */
export class Send extends Interaction {

    /**
     * @desc
     *  Instantiates a new {@link Send} {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {@serenity-js/lib/core/screenplay~Answerable<AxiosRequestConfig>} request
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link AxiosRequestConfig}
     */
    static a(request: Answerable<AxiosRequestConfig>): Interaction {
        return new Send(request);
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Answerable<AxiosRequestConfig>} request
     *
     * @see {@link AxiosRequestConfig}
     */
    constructor(private readonly request: Answerable<AxiosRequestConfig>) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & CollectsArtifacts & AnswersQuestions): Promise<void> {
        const callAnApi = CallAnApi.as(actor);

        return actor.answer(this.request)
            .then(config =>
                callAnApi.request(config).then((response: AxiosResponse) => {
                    const resolvedUrl = callAnApi.resolveUrl(config);

                    actor.collect(
                        this.responseToArtifact(resolvedUrl, response),
                        this.requestToArtifactName(response.config.method, resolvedUrl),
                    );
            }));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString() {
        return `#actor sends ${ this.request.toString() }`;
    }

    private responseToArtifact(targetUrl: string, response: AxiosResponse): Artifact {
        const
            request: AxiosRequestConfig = response.config,
            requestAndResponse: RequestAndResponse = {
                request: {
                    method:     request.method,
                    url:        targetUrl,
                    headers:    request.headers,
                    data:       request.data,
                },
                response: {
                    status:     response.status,
                    headers:    response.headers,
                    data:       response.data,
                },
            };

        return HTTPRequestResponse.fromJSON(requestAndResponse);
    }

    private requestToArtifactName(method: string, url: string) {
        return new Name(`${ method.toUpperCase() } ${ url }`);
    }
}
