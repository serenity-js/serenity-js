import { ConfigurationError, LogicError, TestCompromisedError } from '@serenity-js/core';
import type { Method } from 'axios';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it } from 'mocha';
import { given } from 'mocha-testdata';

import { CallAnApi } from '../../../src';
import { expect } from '../../expect';

describe('CallAnApi', () => {

    given([
        { description: 'GET',       verification: 'onGet'      },
        { description: 'POST',      verification: 'onPost'     },
        { description: 'PUT',       verification: 'onPut'      },
        { description: 'HEAD',      verification: 'onHead'     },
        { description: 'DELETE',    verification: 'onDelete'   },
        { description: 'PATCH',     verification: 'onPatch'    },
        { description: 'OPTIONS',   verification: 'onAny'      },
    ]).
    it('allows the Actor to interact with HTTP endpoints via', ({description, verification}) => {
        const
            { callAnApi, mock } = mockedAxiosInstance(),
            method = description as Method,
            url = '/products/2';

        mock[verification](url).reply(200);

        return expect(callAnApi.request({ method, url })).to.be.fulfilled;
    });

    it('provides a convenient factory method to be used when no custom configuration is required', () => {
        const
            baseURL = 'https://mycompany.com/api',
            callAnApi = CallAnApi.at(new URL(baseURL));

        expect(callAnApi).to.be.instanceOf(CallAnApi);
        expect((callAnApi as any).axiosInstance.defaults.baseURL).to.equal(baseURL);
    });

    it('allows for the ability to be instantiated using a URL object instead of a string', () => {
        const
            baseURL = 'https://mycompany.com/api',
            callAnApi = CallAnApi.at(baseURL);

        expect(callAnApi).to.be.instanceOf(CallAnApi);
        expect((callAnApi as any).axiosInstance.defaults.baseURL).to.equal(baseURL);
    });

    it('provides a factory method to be used when custom configuration is required', () => {
        const
            baseURL = 'https://mycompany.com/api',
            callAnApi = CallAnApi.using(axios.create({ baseURL }));

        expect(callAnApi).to.be.instanceOf(CallAnApi);
        expect((callAnApi as any).axiosInstance.defaults.baseURL).to.equal(baseURL);
    });

    it('caches the last response so that it can be easily asserted on', () => {
        const
            { callAnApi, mock } = mockedAxiosInstance(),
            url = '/products/2';

        mock.onGet(url).reply(200, { id: 2 });

        return expect(callAnApi.request({ method: 'get', url })).to.be.fulfilled.then(() => {
            callAnApi.mapLastResponse(response => expect(response.status).to.equal(200));
        });
    });

    it('caches the last response even when the server responds with an error. As long is it responds.', () => {
        const
            { callAnApi, mock } = mockedAxiosInstance(),
            url = '/products/2';

        mock.onGet(url).reply(500);

        return expect(callAnApi.request({ method: 'get', url })).to.be.fulfilled.then(() => {
            callAnApi.mapLastResponse(response => expect(response.status).to.equal(500));
        });
    });

    it('provides a way to determine the actual target URL the request will be sent to', () => {
        const callAnApi = CallAnApi.at('https://example.org/api/v4/');

        const actualUrl = callAnApi.resolveUrl({ url: 'products/3' });

        expect(actualUrl).to.equal('https://example.org/api/v4/products/3')
    });

    it('correctly resolves absolute URL paths', () => {
        const callAnApi = CallAnApi.at('https://example.org/api/v4/');

        const actualUrl = callAnApi.resolveUrl({ url: '/api/v5/products/3' });

        expect(actualUrl).to.equal('https://example.org/api/v5/products/3')
    });

    describe('when serialising', () => {

        const baseURL = 'https://example.org/api/v4/';

        it('returns only non-empty values', () => {
            const callAnApi = CallAnApi.at(baseURL);

            const result = callAnApi.toJSON();

            expect(result).to.deep.equal({
                options: {
                    baseURL,
                    headers: {
                        common: {
                            Accept: 'application/json, text/plain, */*'
                        },
                    },
                    timeout: 10_000,
                },
                type: 'CallAnApi',
            });
        });

        it('includes custom headers', () => {
            const callAnApi = CallAnApi.using(axios.create({
                baseURL,
                headers: {
                    post: {
                        'X-Custom-Header': 'custom value',
                    }
                }
            }));

            const result = callAnApi.toJSON();

            expect(result).to.deep.equal({
                options: {
                    baseURL,
                    headers: {
                        common: {
                            Accept: 'application/json, text/plain, */*'
                        },
                        post: {
                            'X-Custom-Header': 'custom value',
                        },
                    },
                    timeout: 0,     // we don't override the timeout when axios instance is injected by the user
                },
                type: 'CallAnApi',
            });
        });

        it('includes custom proxy settings', () => {
            const callAnApi = CallAnApi.using({
                baseURL,
                proxy: {
                    host: 'proxy.example.org',
                    port: 8080,
                }
            });

            const result = callAnApi.toJSON();

            expect(result).to.deep.equal({
                options: {
                    baseURL,
                    headers: {
                        common: {
                            Accept: 'application/json, text/plain, */*'
                        },
                    },
                    proxy: {
                        protocol: 'http',
                        host: 'proxy.example.org',
                        port: 8080,
                    },
                    timeout: 10_000,
                },
                type: 'CallAnApi',
            });
        });
    });

    describe('when dealing with errors', () => {

        it('complains if you try to retrieve the last response before making an API call', () => {
            const { callAnApi } = mockedAxiosInstance();

            expect(() => callAnApi.mapLastResponse(_ => _))
                .to.throw(LogicError, 'Make sure to perform a HTTP API call before checking on the response');
        });

        it('complains when provided with invalid Axios configuration', () => {
            const
                axiosInstance = axios.create({
                    baseURL: ['bah', 'humbug', '!'] as any,
                }),
                callAnApi = CallAnApi.using(axiosInstance);

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('Looks like there was an issue with Axios configuration')
                .then((error: ConfigurationError) => {
                    expect(error).to.be.instanceOf(ConfigurationError);
                    expect(error.stack).to.contain('Caused by: TypeError');
                });
        });

        it('complains when the API call times out', () => {
            const { callAnApi, mock } = mockedAxiosInstance();

            mock.onAny().timeout();

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('The request has timed out: GET /some/api')
                .then((error: TestCompromisedError) => {
                    expect(error).to.be.instanceOf(TestCompromisedError);
                    expect(error.stack).to.contain('Caused by: Error: timeout of 0ms exceeded');
                });
        });

        it('complains when the a network error occurs', () => {
            const { callAnApi, mock } = mockedAxiosInstance();

            mock.onAny().networkError();

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('A network error has occurred: GET /some/api')
                .then((error: TestCompromisedError) => {
                    expect(error).to.be.instanceOf(TestCompromisedError);
                    expect(error.stack).to.contain('Caused by: Error: Network Error');
                });
        });

        it('complains when the Axios client rejects its promise', () => {
            const { callAnApi, mock } = mockedAxiosInstance();

            mock.onAny().reply(() => Promise.reject(new Error('something unpredictable')));

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('The API call has failed: GET /some/api')
                .then((error: TestCompromisedError) => {
                    expect(error).to.be.instanceOf(TestCompromisedError);
                    expect(error.stack).to.contain('Caused by: Error: something unpredictable');
                });
        });
    });

    function mockedAxiosInstance() {
        const
            axiosInstance = axios.create(),
            mock = new MockAdapter(axiosInstance),
            callAnApi = CallAnApi.using(axiosInstance);

        return { mock, callAnApi };
    }
});
