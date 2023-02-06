import { Ability, ConfigurationError, LogicError, TestCompromisedError } from '@serenity-js/core';
import axios, { AxiosDefaults, AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * An {@apilink Ability} that enables the {@apilink Actor} to call an HTTP API.
 *
 * If you need to connect via a proxy, check out ["Using Axios behind corporate proxies"](https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d).
 *
 * ## Using the default Axios HTTP client
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.at('https://api.example.org/')
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/users/2')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ## Using Axios client with custom configuration
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * import * as axios from 'axios'
 *
 * const axiosInstance = axios.create({
 *   timeout: 5 * 1000,
 *   headers: {
 *     'X-Custom-Api-Key': 'secret-key',
 *   },
 * });
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.using(axiosInstance),
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/users/2')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ## Learn more
 * - https://github.com/axios/axios
 * - https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 *
 * @group Abilities
 */
export class CallAnApi extends Ability {

    /** @private */
    private lastResponse: AxiosResponse;

    /**
     * Produces an {@apilink Ability|ability} to call a REST api at a specified baseUrl
     *
     * Default timeout is set to 2s.
     *
     * Default request headers:
     * - `Accept`: `application/json,application/xml`
     *
     * @param baseURL
     */
    static at(baseURL: string): CallAnApi {
        return new CallAnApi(axios.create({
            baseURL,
            timeout: 2000,
            headers: { Accept: 'application/json,application/xml' },
        }));
    }

    /**
     * Produces an {@apilink Ability|ability} to call a REST API using a given axios instance.
     *
     * Useful when you need to customise Axios to
     * [make it aware of proxies](https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d),
     * for example.
     *
     * #### Learn more
     * - [AxiosInstance](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L235-L238)
     *
     * @param axiosInstance
     */
    static using(axiosInstance: AxiosInstance): CallAnApi {
        return new CallAnApi(axiosInstance);
    }

    /**
     * #### Learn more
     * - [AxiosInstance](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L235-L238)
     *
     * @param axiosInstance
     *  A pre-configured instance of the Axios HTTP client
     */
    constructor(private readonly axiosInstance: AxiosInstance) {
        super();
    }

    /**
     * Allows for the original Axios config to be changed after
     * the {@apilink Ability|ability} to {@apilink CallAnApi}
     * has been instantiated and given to the {@apilink Actor}.
     *
     * #### Learn more
     * - [AxiosRequestConfig](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L75-L113)
     *
     * @param fn
     */
    modifyConfig(fn: (original: AxiosDefaults<any>) => any): void {
        fn(this.axiosInstance.defaults);
    }

    /**
     * Sends an HTTP request to a specified url.
     * Response will be cached and available via {@apilink mapLastResponse}
     *
     * #### Learn more
     * - [AxiosRequestConfig](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L75-L113)
     * - [AxiosResponse](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L133-L140)
     *
     * @param config
     *  Axios request configuration, which can be used to override the defaults
     *  provided when the {@apilink Ability|ability} to {@apilink CallAnApi} was instantiated.
     */
    request(config: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.captureResponseOf(this.axiosInstance.request(config));
    }

    /**
     * Resolves the final URL, based on the {@apilink AxiosRequestConfig} provided
     * and any defaults that the {@apilink AxiosInstance} has been configured with.
     *
     * #### Learn more
     * - [AxiosRequestConfig](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L75-L113)
     * - [AxiosInstance](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L235-L238)
     *
     * @param config
     */
    resolveUrl(config: AxiosRequestConfig): string {
        return this.axiosInstance.getUri(config);
    }

    /**
     * Maps the last cached response to another type.
     * Useful when you need to extract a portion of the {@apilink AxiosResponse} object.
     *
     * #### Learn more
     * - [AxiosResponse](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L133-L140)
     *
     * @param mappingFunction
     */
    mapLastResponse<T>(mappingFunction: (response: AxiosResponse) => T): T {
        if (!this.lastResponse) {
            throw new LogicError(`Make sure to perform a HTTP API call before checking on the response`);
        }

        return mappingFunction(this.lastResponse);
    }

    private captureResponseOf(promisedResponse: AxiosPromise): AxiosPromise {
        return promisedResponse
            .then(
                lastResponse => {
                    this.lastResponse = lastResponse;

                    return lastResponse;
                },
                error => {
                    switch (true) {
                        case /timeout.*exceeded/.test(error.message):
                            throw new TestCompromisedError(`The request has timed out`, error);
                        case /Network Error/.test(error.message):
                            throw new TestCompromisedError(`A network error has occurred`, error);
                        case error instanceof TypeError:
                            throw new ConfigurationError(`Looks like there was an issue with Axios configuration`, error);
                        case ! (error as AxiosError).response:
                            throw new TestCompromisedError(`The API call has failed`, error);   // todo: include request url
                        default:
                            this.lastResponse = error.response;

                            return error.response;
                    }
                },
            );
    }
}
