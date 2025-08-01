import { URL } from 'node:url';

import {
    Ability,
    ConfigurationError,
    LogicError,
    type SerialisedAbility,
    TestCompromisedError
} from '@serenity-js/core';
import { Agent } from 'agent-base';
import {
    type AxiosDefaults,
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios';
import { type JSONObject } from 'tiny-types';
import { isObject } from 'tiny-types/lib/objects';

import type { AxiosRequestConfigDefaults, AxiosRequestConfigProxyDefaults } from '../../io';
import { createAxios } from '../../io';

/**
 * An [ability](https://serenity-js.org/api/core/class/Ability/) that wraps [axios client](https://axios-http.com/docs/api_intro) and enables
 * the [actor](https://serenity-js.org/api/core/class/Actor/) to [send](https://serenity-js.org/api/rest/class/Send/)
 * [HTTP requests](https://serenity-js.org/api/rest/class/HTTPRequest/) to HTTP APIs.
 *
 * ## Configuring the ability to call an API
 *
 * The easiest way to configure the ability to `CallAnApi` is to provide the `baseURL` of your HTTP API,
 * and rely on Serenity/JS to offer other sensible defaults:
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
 *     Send.a(GetRequest.to('/v1/users/2')),            // GET https://api.example.org/v1/users/2
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * Please note that the following Serenity/JS test runner adapters already provide the ability to `CallAnApi` as part of their default configuration,
 * so you don't need to configure it yourself:
 * - [Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/)
 * - [WebdriverIO](https://serenity-js.org/handbook/test-runners/webdriverio/)
 * - [Protractor](https://serenity-js.org/handbook/test-runners/protractor/)
 *
 * ### Resolving relative URLs
 *
 * Serenity/JS resolves request URLs using Node.js [WHATWG URL API](https://nodejs.org/api/url.html#new-urlinput-base).
 * This means that the request URL is determined using the resource path resolved in the context of base URL, i.e. `new URL(resourcePath, [baseURL])`.
 *
 * Consider the following example:
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.at(baseURL)
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to(resourcePath)),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * In the above example:
 * - when `resourcePath` is defined as a full URL, it overrides the base URL
 * - when `resourcePath` starts with a forward slash `/`, it replaces any path defined in the base URL
 * - when `resourcePath` is not a full URL and doesn't start with a forward slash, it gets appended to the base URL
 *
 * | baseURL                       | resourcePath               | result                               |
 * | ----------------------------- | -------------------------- | ------------------------------------ |
 * | `https://api.example.org/`    | `/v1/users/2`              | `https://api.example.org/v1/users/2` |
 * | `https://example.org/api/v1/` | `users/2`                  | `https://example.org/api/v1/users/2` |
 * | `https://example.org/api/v1/` | `/secure/oauth`            | `https://example.org/secure/oauth`   |
 * | `https://v1.example.org/api/` | `https://v2.example.org/`  | `https://v2.example.org/`            |
 *
 * ### Using Axios configuration object
 *
 * When you need more control over how your Axios instance is configured, provide
 * an [Axios configuration object](https://axios-http.com/docs/req_config). For example:
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.using({
 *       baseURL: 'https://api.example.org/',
 *       timeout: 30_000,
 *       // ... other configuration options
 *     })
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/users/2')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ## Working with proxy servers
 *
 * `CallAnApi` uses an approach described in ["Node.js Axios behind corporate proxies"](https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d)
 * to automatically detect proxy server configuration based on your environment variables.
 *
 * You can override this default proxy detection mechanism by providing your own proxy configuration object.
 *
 * ### Automatic proxy support
 *
 * When the URL you're sending the request to uses the HTTP protocol, Serenity/JS will automatically detect your proxy configuration based on the following environment variables:
 * - `npm_config_http_proxy`
 * - `http_proxy` and `HTTP_PROXY`
 * - `npm_config_proxy`
 * - `all_proxy`
 *
 * Similarly, when the request target URL uses the HTTPS protocol, the following environment variables are used instead:
 * - `npm_config_https_proxy`
 * - `https_proxy` and `HTTPS_PROXY`
 * - `npm_config_proxy`
 * - `all_proxy`
 *
 * Proxy configuration is ignored for both HTTP and HTTPS target URLs matching the proxy bypass rules defined in the following environment variables:
 * - `npm_config_no_proxy`
 * - `no_proxy` and `NO_PROXY`
 *
 * ### Custom proxy configuration
 *
 * To override the automatic proxy detection based on the environment variables, provide a proxy configuration object:
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.using({
 *       baseURL: 'https://api.example.org/',
 *       proxy: {
 *         protocol: 'http',
 *         host: 'proxy.example.org',
 *         port: 9000,
 *         auth: {                          // optional
 *           username: 'proxy-username',
 *           password: 'proxy-password',
 *         },
 *         bypass: 'status.example.org, internal.example.org'   // optional
 *       }
 *       // ... other configuration options
 *     })
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/users/2')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * Note that Serenity/JS uses [proxy-agents](https://github.com/TooTallNate/proxy-agents)
 * and the approach described in ["Node.js Axios behind corporate proxies"](https://janmolak.com/node-js-axios-behind-corporate-proxies-8b17a6f31f9d)
 * to work around [limited proxy support capabilities](https://github.com/axios/axios/issues?q=is%3Aissue+is%3Aopen+proxy) in Axios itself.
 *
 * ### Bypassing proxy configuration
 *
 * To bypass the proxy configuration for specific hostnames and IP addresses, you can either:
 * - provide the `bypass` property in the proxy configuration object, or
 * - use the `no_proxy` environment variable.
 *
 * The value of the `bypass` property or the `no_proxy` environment variable should be a comma-separated list of hostnames and IP addresses
 * that should not be routed through the proxy server, for example: `.com, .serenity-js.org, .domain.com`.
 *
 * Note that setting the `bypass` property to `example.org` makes the requests to following URLs bypass the proxy server:
 * - `api.example.org`
 * - `sub.sub.example.org`
 * - `example.org`
 * - `my-example.org`
 *
 * :::info
 * Serenity/JS doesn't currently support `bypass` rules expressed using CIDR notation, like `192.168.17.0/24`.
 * Instead, it uses a simple comma-separated list of hostnames and IP addresses.
 * If you need support for CIDR notation, please [raise an issue](https://github.com/serenity-js/serenity-js/issues).
 * :::
 *
 * ### Using Axios instance with proxy support
 *
 * To have full control over the Axios instance used by the ability to `CallAnApi`, you can create it yourself
 * and inject it into the ability.
 * This approach allows you to still benefit from automated proxy detection in configuration, while taking advantage
 * of the many [Axios plugins](https://www.npmjs.com/search?q=axios).
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { createAxios, CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * import axiosRetry from 'axios-retry'
 *
 * const instance = createAxios({ baseURL: 'https://api.example.org/' })
 * axiosRetry(instance, { retries: 3 })
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.using(instance)
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/users/2')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ### Using raw Axios instance
 *
 * If you don't want Serenity/JS to enhance your Axios instance with proxy support, instantiate the ability to
 * `CallAnApi` using its constructor directly.
 * Note, however, that by using this approach you're taking the responsibility for all the aspects of configuring Axios.
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * import { axiosCreate } from '@serenity-js/rest'
 * import axiosRetry from 'axios-retry'
 *
 * const instance = axiosCreate({ baseURL: 'https://api.example.org/' })
 * axiosRetry(instance, { retries: 3 })
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     new CallAnApi(instance)     // using the constructor ensures your axios instance is not modified in any way.
 *   )
 *   .attemptsTo(
 *     // ...
 *   )
 * ```
 *
 * ### Serenity/JS defaults
 *
 * When using [`CallAnApi.at`](https://serenity-js.org/api/rest/class/CallAnApi/#at) or [`CallAnApi.using`](https://serenity-js.org/api/rest/class/CallAnApi/#using) with a configuration object, Serenity/JS
 * merges your [Axios request configuration](https://axios-http.com/docs/req_config) with the following defaults:
 * - `timeout`: 10 seconds
 *
 *
 * You can override them by specifying the given property in your configuration object, for example:
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Apisitt')
 *   .whoCan(
 *     CallAnApi.using({
 *       baseURL: 'https://api.example.org/',
 *       timeout: 30_000
 *     })
 *   )
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/users/2')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *   )
 * ```
 *
 * ## Interacting with multiple APIs
 *
 * Some test scenarios might require you to interact with multiple HTTP APIs. With Serenity/JS you can do this
 * using either API-specific actors, or by specifying full URLs when performing the requests.
 *
 * The following examples will assume that the test scenarios needs to interact with the following APIs:
 * - `https://testdata.example.org/api/v1/`
 * - `https://shop.example.org/api/v1/`
 *
 * Let's also assume that the `testdata` API allows the automation to manage the test data used by the `shop` API.
 *
 * ### Using API-specific actors
 *
 * To create API-specific actors, configure your [test runner](https://serenity-js.org/handbook/test-runners/) with a [cast](https://serenity-js.org/api/core/class/Cast/)
 * that gives your actors appropriate abilities based, for example, on their name:
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { Actor, Cast, engage } from '@serenity-js/core'
 * import { CallAnApi } from '@serenity-js/rest'
 *
 * export class MyActors implements Cast {
 *   prepare(actor: Actor): Actor {
 *     switch(actor.name) {
 *       case 'Ted':
 *         return actor.whoCan(CallAnApi.at('https://testdata.example.org/api/v1/'))
 *       case 'Shelly':
 *         return actor.whoCan(CallAnApi.at('https://shop.example.org/api/v1/'))
 *       default:
 *         return actor;
 *     }
 *   }
 * }
 *
 * beforeEach(() => engage(new MyActors()))
 * ```
 *
 * Next, retrieve the appropriate actor in your test scenario using [`actorCalled`](https://serenity-js.org/api/core/function/actorCalled/), for example:
 *
 * ```ts
 * import { describe, it, beforeEach } from 'mocha'
 * import { actorCalled, engage } from '@serenity-js/core
 * import { Send, GetRequest, PostRequest, LastResponse } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * describe('Multi-actor API testing', () => {
 *   beforeEach(() => engage(new MyActors()))
 *
 *   it('allows each actor to interact with their API', async () => {
 *
 *     await actorCalled('Ted').attemptsTo(
 *       Send.a(PostRequest.to('products').with({ name: 'Apples', price: '£2.50' })),
 *       Ensure.that(LastResponse.status(), equals(201)),
 *     )
 *
 *     await actorCalled('Shelly').attemptsTo(
 *       Send.a(GetRequest.to('?product=Apples')),
 *       Ensure.that(LastResponse.status(), equals(200)),
 *       Ensure.that(LastResponse.body(), equals([
 *         { name: 'Apples', price: '£2.50' }
 *       ])),
 *     )
 *   })
 * })
 * ```
 *
 * ### Using full URLs
 *
 * If you prefer to have a single actor interacting with multiple APIs, you can specify the full URL for every request:
 *
 * ```ts
 * import { describe, it, beforeEach } from 'mocha'
 * import { actorCalled, Cast, engage } from '@serenity-js/core
 * import { CallAnApi, Send, GetRequest, PostRequest, LastResponse } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * describe('Multi-actor API testing', () => {
 *   beforeEach(() => engage(
 *     Cast.where(actor => actor.whoCan(CallAnApi.using({})))
 *   ))
 *
 *   it('allows each actor to interact with their API', async () => {
 *
 *     await actorCalled('Alice').attemptsTo(
 *       Send.a(PostRequest.to('https://testdata.example.org/api/v1/products')
 *         .with({ name: 'Apples', price: '£2.50' })),
 *       Ensure.that(LastResponse.status(), equals(201)),
 *
 *       Send.a(GetRequest.to('https://shop.example.org/api/v1/?product=Apples')),
 *       Ensure.that(LastResponse.status(), equals(200)),
 *       Ensure.that(LastResponse.body(), equals([
 *         { name: 'Apples', price: '£2.50' }
 *       ])),
 *     )
 *   })
 * })
 * ```
 *
 * ## Learn more
 * - [Axios: Configuring requests](https://axios-http.com/docs/req_config)
 * - [MDN: HTTP methods documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
 *
 * @group Abilities
 */
export class CallAnApi extends Ability {

    private lastResponse: AxiosResponse;

    /**
     * Produces an [ability](https://serenity-js.org/api/core/class/Ability/) to call a REST API at a specified `baseURL`;
     *
     * This is the same as invoking `CallAnApi.using({ baseURL: 'https://example.org' })`
     *
     * @param baseURL
     */
    static at(baseURL: URL | string): CallAnApi {
        return CallAnApi.using({
            baseURL: baseURL instanceof URL
                ? baseURL.toString()
                : baseURL
        });
    }

    /**
     * Produces an [ability](https://serenity-js.org/api/core/class/Ability/) to call an HTTP API using the given Axios instance,
     * or an Axios request configuration object.
     *
     * When you provide an [Axios configuration object](https://axios-http.com/docs/req_config),
     * it gets shallow-merged with the following defaults:
     * - request timeout of 10 seconds
     * - automatic proxy support based on
     *   your [environment variables](https://www.npmjs.com/package/proxy-from-env#environment-variables)
     *
     * When you provide an Axios instance, it's enhanced with proxy support and no other modifications are made.
     *
     * If you don't want Serenity/JS to augment or modify your Axios instance in any way,
     * please use the [`CallAnApi.constructor`](https://serenity-js.org/api/rest/class/CallAnApi/#constructor) directly.
     *
     * @param axiosInstanceOrConfig
     */
    static using(axiosInstanceOrConfig: AxiosInstance | AxiosRequestConfigDefaults): CallAnApi {
        return new CallAnApi(createAxios(axiosInstanceOrConfig));
    }

    /**
     * #### Learn more
     * - [AxiosInstance](https://axios-http.com/docs/instance)
     *
     * @param axiosInstance
     *  A pre-configured instance of the Axios HTTP client
     */
    constructor(private readonly axiosInstance: AxiosInstance) {
        super();
    }

    /**
     * Allows for the original Axios config to be changed after
     * the [ability](https://serenity-js.org/api/core/class/Ability/) to [`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi/)
     * has been instantiated and given to the [`Actor`](https://serenity-js.org/api/core/class/Actor/).
     *
     * #### Learn more
     * - [AxiosRequestConfig](https://axios-http.com/docs/req_config)
     *
     * @param fn
     */
    modifyConfig(fn: (original: AxiosDefaults<any>) => any): void {
        fn(this.axiosInstance.defaults);
    }

    /**
     * Sends an HTTP request to a specified url.
     * Response will be cached and available via [`CallAnApi.mapLastResponse`](https://serenity-js.org/api/rest/class/CallAnApi/#mapLastResponse).
     *
     * #### Learn more
     * - [AxiosRequestConfig](https://axios-http.com/docs/req_config)
     * - [AxiosResponse](https://axios-http.com/docs/res_schema)
     *
     * @param config
     *  Axios request configuration, which can be used to override the defaults
     *  provided when the [ability](https://serenity-js.org/api/core/class/Ability/)
     *  to [`CallAnApi`](https://serenity-js.org/api/rest/class/CallAnApi/) was instantiated.
     */
    async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
        let url: string;

        try {
            url = this.resolveUrl(config);
            this.lastResponse = await this.axiosInstance.request({
                ...config,
                url,
            });

            return this.lastResponse;
        } catch (error) {
            const description = `${config.method.toUpperCase()} ${url || config.url}`;

            switch (true) {
                case /timeout.*exceeded/.test(error.message):
                    throw new TestCompromisedError(`The request has timed out: ${description}`, error);
                case /Network Error/.test(error.message):
                    throw new TestCompromisedError(`A network error has occurred: ${description}`, error);
                case error instanceof TypeError:
                    throw new ConfigurationError(`Looks like there was an issue with Axios configuration`, error);
                case !(error as AxiosError).response:
                    throw new TestCompromisedError(`The API call has failed: ${description}`, error);
                default:
                    this.lastResponse = error.response;

                    return error.response;
            }
        }
    }

    /**
     * Resolves the final URL, based on the [`AxiosRequestConfig`](https://axios-http.com/docs/req_config) provided
     * and any defaults that the [`AxiosInstance`](https://axios-http.com/docs/instance) has been configured with.
     *
     * Note that unlike Axios, this method uses the Node.js [WHATWG URL API](https://nodejs.org/api/url.html#new-urlinput-base)
     * to ensure URLs are correctly resolved.
     *
     * @param config
     */
    resolveUrl(config: AxiosRequestConfig): string {
        const baseURL = this.axiosInstance.defaults.baseURL || config.baseURL;

        return baseURL
            ? new URL(config.url, baseURL).toString()
            : config.url;
    }

    /**
     * Maps the last cached response to another type.
     * Useful when you need to extract a portion of the [`AxiosResponse`](https://axios-http.com/docs/res_schema) object.
     *
     * #### Learn more
     * - [AxiosResponse](https://axios-http.com/docs/res_schema)
     *
     * @param mappingFunction
     */
    mapLastResponse<T>(mappingFunction: (response: AxiosResponse) => T): T {
        if (!this.lastResponse) {
            throw new LogicError(`Make sure to perform a HTTP API call before checking on the response`);
        }

        return mappingFunction(this.lastResponse);
    }

    toJSON(): SerialisedAbility {
        const simplifiedConfig: JSONObject = {
            baseURL: this.axiosInstance.defaults.baseURL,
            headers: this.axiosInstance.defaults.headers,
            timeout: this.axiosInstance.defaults.timeout,
            proxy:   proxyConfigFrom(this.axiosInstance.defaults),
        };

        return {
            ...super.toJSON(),
            options: {
                ...recursivelyRemove(
                    [isUndefined, isEmptyObject],
                    simplifiedConfig
                ),
            }
        }
    }
}

function proxyConfigFrom(defaults: AxiosDefaults): AxiosRequestConfigProxyDefaults | undefined {
    if (defaults.proxy === undefined) {
        return undefined;
    }

    if (! (defaults.proxy === false && defaults.httpAgent instanceof Agent)) {
        return undefined;
    }

    const proxyUrl = (defaults.httpAgent as any).getProxyForUrl(defaults.baseURL);

    try {
        const url = new URL(proxyUrl);
        return {
            protocol: url.protocol?.replace(/:$/, ''),
            host:     url.hostname,
            port:     url.port ? Number(url.port) : undefined,
            auth:     url.username
                ? {
                    username: url.username || undefined,
                    password: url.password || undefined,
                }
                : undefined,
        };
    }
    catch {
        return undefined;
    }
}

function isUndefined(value: any): value is undefined {
    return value === undefined;
}

function isEmptyObject(value: any): value is object {
    return isObject(value) && Object.keys(value).length === 0;
}

function recursivelyRemove(matchers: Array<(value: any) => boolean>, value: any): any {
    if (Array.isArray(value)) {
        return value.map(item => recursivelyRemove(matchers, item));
    }

    if (typeof value === 'object' && value !== null) {
        return Object.keys(value).reduce((acc, key) => {
            if (matchers.some(matcher => matcher(value[key]))) {
                return acc;
            }

            return {
                ...acc,
                [key]: recursivelyRemove(matchers, value[key]),
            };
        }, {});
    }

    return value;
}
