import 'mocha';

import { ConfigurationError, LogicError, TestCompromisedError } from '@serenity-js/core';
import axios, { Method } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { given } from 'mocha-testdata';

import { CallAnApi } from '../../../src';
import { expect } from '../../expect';

/** @test {CallAnApi} */
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

    /**
     * @test {CallAnApi}
     * @test {CallAnApi.at}
     */
    it('provides a convenient factory method to be used when no custom configuration is required', () => {
        const
            baseURL = 'https://mycompany.com/api',
            callAnApi = CallAnApi.at(baseURL);

        expect(callAnApi).to.be.instanceOf(CallAnApi);
        expect((callAnApi as any).axiosInstance.defaults.baseURL).to.equal(baseURL);
    });

    /**
     * @test {CallAnApi}
     * @test {CallAnApi.using}
     */
    it('provides a factory method to be used when custom configuration is required', () => {
        const
            baseURL = 'https://mycompany.com/api',
            callAnApi = CallAnApi.using(axios.create({ baseURL }));

        expect(callAnApi).to.be.instanceOf(CallAnApi);
        expect((callAnApi as any).axiosInstance.defaults.baseURL).to.equal(baseURL);
    });

    /**
     * @test {CallAnApi}
     * @test {CallAnApi.mapLastResponse}
     */
    it('caches the last response so that it can be easily asserted on', () => {
        const
            { callAnApi, mock } = mockedAxiosInstance(),
            url = '/products/2';

        mock.onGet(url).reply(200, { id: 2 });

        return expect(callAnApi.request({ method: 'get', url })).to.be.fulfilled.then(() => {
            callAnApi.mapLastResponse(response => expect(response.status).to.equal(200));
        });
    });

    /**
     * @test {CallAnApi}
     * @test {CallAnApi.request}
     * @test {CallAnApi.mapLastResponse}
     */
    it('caches the last response even when the server responds with an error. As long is it responds.', () => {
        const
            { callAnApi, mock } = mockedAxiosInstance(),
            url = '/products/2';

        mock.onGet(url).reply(500);

        return expect(callAnApi.request({ method: 'get', url })).to.be.fulfilled.then(() => {
            callAnApi.mapLastResponse(response => expect(response.status).to.equal(500));
        });
    });

    /**
     * @test {CallAnApi}
     * @test {CallAnApi.resolveUrl}
     */
    it('provides a way to determine the actual target URL the request will be sent to', () => {
        const callaAnApi = CallAnApi.at('https://example.org/api/v4');

        const actualUrl = callaAnApi.resolveUrl({ url: 'products/3' });

        expect(actualUrl).to.equal('https://example.org/api/v4/products/3')
    });

    describe('when dealing with errors', () => {
        /**
         * @test {CallAnApi}
         * @test {CallAnApi.mapLastResponse}
         */
        it('complains if you try to retrieve the last response before making an API call', () => {
            const { callAnApi } = mockedAxiosInstance();

            expect(() => callAnApi.mapLastResponse(_ => _))
                .to.throw(LogicError, 'Make sure to perform a HTTP API call before checking on the response');
        });

        /**
         * @test {CallAnApi}
         * @test {CallAnApi.request}
         */
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

        /**
         * @test {CallAnApi}
         * @test {CallAnApi.request}
         */
        it('complains when the API call times out', () => {
            const { callAnApi, mock } = mockedAxiosInstance();

            mock.onAny().timeout();

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('The request has timed out')
                .then((error: TestCompromisedError) => {
                    expect(error).to.be.instanceOf(TestCompromisedError);
                    expect(error.stack).to.contain('Caused by: Error: timeout of 0ms exceeded');
                });
        });

        /**
         * @test {CallAnApi}
         * @test {CallAnApi.request}
         */
        it('complains when the a network error occurs', () => {
            const { callAnApi, mock } = mockedAxiosInstance();

            mock.onAny().networkError();

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('A network error has occurred')
                .then((error: TestCompromisedError) => {
                    expect(error).to.be.instanceOf(TestCompromisedError);
                    expect(error.stack).to.contain('Caused by: Error: Network Error');
                });
        });

        /**
         * @test {CallAnApi}
         * @test {CallAnApi.request}
         */
        it('complains when the Axios client rejects its promise', () => {
            const { callAnApi, mock } = mockedAxiosInstance();

            mock.onAny().reply(() => Promise.reject(new Error('something unpredictable')));

            return expect(callAnApi.request({ method: 'get', url: '/some/api' })).to.be.rejectedWith('The API call has failed')
                .then((error: TestCompromisedError) => {
                    expect(error).to.be.instanceOf(TestCompromisedError);
                    expect(error.stack).to.contain('Caused by: Error: something unpredictable');
                });
        });
    });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    function mockedAxiosInstance() {
        const
            axiosInstance = axios.create(),
            mock = new MockAdapter(axiosInstance),
            callAnApi = CallAnApi.using(axiosInstance);

        return { mock, callAnApi };
    }
});
