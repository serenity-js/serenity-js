import { Ability, ConfigurationError, LogicError, TestCompromisedError, UsesAbilities } from '@serenity-js/core';
import axios, { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
const mergeConfig = require('axios/lib/core/mergeConfig');       // tslint:disable-line:no-var-requires no-submodule-imports
const buildFullPath = require('axios/lib/core/buildFullPath');   // tslint:disable-line:no-var-requires no-submodule-imports

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link Actor} to call a HTTP API.
 *  If you need to connect via a proxy, check out [this article](https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d).
 *
 * @example <caption>Using a default Axios HTTP client</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Apisit').whoCan(
 *      CallAnApi.at('https://myapp.com/api'),
 *  );
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/users/2')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *  );
 *
 * @example <caption>Using Axios client with custom configuration</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  import axios from 'axios';
 *
 *  const axiosInstance = axios.create({
 *      timeout: 5 * 1000,
 *      headers: {
 *          'X-Custom-Api-Key': 'secret-key',
 *      },
 *  });
 *
 *  const actor = Actor.named('Apisit').whoCan(
 *      CallAnApi.using(axiosInstance),
 *  );
 *
 *  actor.attemptsTo(
 *      Send.a(GetRequest.to('/users/2')),
 *      Ensure.that(LastResponse.status(), equals(200)),
 *  );
 *
 * @see https://github.com/axios/axios
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 *
 * @public
 * @implements {@link @serenity-js/core/lib/screenplay~Ability}
 */
export class CallAnApi implements Ability {

    /** @private */
    private lastResponse: AxiosResponse;

    /**
     * @desc
     *  Ability to Call and api at a specified baseUrl
     *
     *  Default timeout is set to 2s.
     *
     *  Default request headers:
     *  - Accept: application/json,application/xml
     *
     * @param {string} baseURL
     * @returns {CallAnApi}
     */
    static at(baseURL: string) {
        return new CallAnApi(axios.create({
            baseURL,
            timeout: 2000,
            headers: { Accept: 'application/json,application/xml' },
        }));
    }

    /**
     * @desc
     *  Ability to Call a REST API using a given axios instance.
     *
     *  Useful when you need to customise Axios to
     *  [make it aware of proxies](https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d),
     *  for example.
     *
     * @param {AxiosInstance} axiosInstance
     * @returns {CallAnApi}
     *
     * @see {@link AxiosInstance}
     */
    static using(axiosInstance: AxiosInstance) {
        return new CallAnApi(axiosInstance);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link CallAnApi}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link Send}.
     *
     * @param {UsesAbilities} actor
     * @return {CallAnApi}
     */
    static as(actor: UsesAbilities): CallAnApi {
        return actor.abilityTo(CallAnApi);
    }

    /**
     * @param {AxiosInstance} axiosInstance
     *  A pre-configured instance of the Axios HTTP client
     *
     * @see {@link AxiosInstance}
     */
    constructor(private readonly axiosInstance: AxiosInstance) {
    }

    /**
     * @desc
     *  Allows for the original Axios config to be changed after
     *  the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability}
     *  has been instantiated and given to the {@link Actor}.
     *
     * @param {function (original: AxiosRequestConfig): any} fn
     * @returns {void}
     *
     * @see {@link AxiosRequestConfig}
     */
    modifyConfig(fn: (original: AxiosRequestConfig) => any): void {
        fn(this.axiosInstance.defaults);
    }

    /**
     * @desc
     *  Sends a HTTP request to a specified url.
     *  Response will be cached and available via {@link CallAnApi#mapLastResponse}
     *
     * @param {AxiosRequestConfig} config
     *  Axios request configuration, which can be used to override the defaults
     *  provided when the {@link CallAnApi} {@link @serenity-js/core/lib/screenplay~Ability} is instantiated
     *
     * @returns {Promise<AxiosResponse>}
     *  A promise of an AxiosResponse
     *
     * @see {@link AxiosRequestConfig}
     * @see {@link AxiosResponse}
     */
    request(config: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.captureResponseOf(this.axiosInstance.request(config));
    }

    /**
     * @desc
     *  Resolves the final URL, based on the {@link AxiosRequestConfig} provided
     *  any any defaults {@link AxiosInstance} has been configured with.
     *
     * @param {AxiosRequestConfig} config
     * @returns {string}
     *
     * @see {@link AxiosRequestConfig}
     * @see {@link AxiosInstance}
     */
    resolveUrl(config: AxiosRequestConfig): string {
        const merged = mergeConfig(this.axiosInstance.defaults, config);

        return buildFullPath(merged.baseURL, merged.url);
    }

    /**
     * @desc
     *  Maps the last cached response to another type.
     *  Useful when you need to extract a portion of the {@link AxiosResponse} object.
     *
     * @param {function<T>(AxiosResponse): T} fn - mapper function
     * @returns {T}
     *
     * @see {@link AxiosResponse}
     */
    mapLastResponse<T>(fn: (response: AxiosResponse) => T): T {
        if (!this.lastResponse) {
            throw new LogicError(`Make sure to perform a HTTP API call before checking on the response`);
        }

        return fn(this.lastResponse);
    }

    private captureResponseOf(promisedResponse: AxiosPromise): AxiosPromise {
        return promisedResponse
            .then(
                fulfilled => {
                    this.lastResponse = fulfilled;

                    return fulfilled;
                },
                rejected => {
                    switch (true) {
                        case /timeout.*exceeded/.test(rejected.message):
                            throw new TestCompromisedError(`The request has timed out`, rejected);
                        case /Network Error/.test(rejected.message):
                            throw new TestCompromisedError(`A network error has occurred`, rejected);
                        case rejected instanceof TypeError:
                            throw new ConfigurationError(`Looks like there was an issue with Axios configuration`, rejected);
                        case ! (rejected as AxiosError).response:
                            throw new TestCompromisedError(`The API call has failed`, rejected);
                        default:
                            this.lastResponse = rejected.response;

                            return rejected.response;
                    }
                },
            );
    }
}
