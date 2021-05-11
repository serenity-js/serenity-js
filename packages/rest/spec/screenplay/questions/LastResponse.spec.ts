import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { LogicError } from '@serenity-js/core';

import { GetRequest, LastResponse, Send } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

/** @test {LastResponse} */
describe('LastResponse', () => {

    const { actor, mock } = actorUsingAMockedAxiosInstance();

    afterEach(() =>  mock.reset());

    describe('when asserting on the response to the last HTTP request', () => {

        interface Product {
            id: number;
            name: string;
        }

        const
            url     = '/products/2',
            body    = { id: 2, name: 'apple' },
            headers = { 'Content-Type': 'application/json;charset=utf-8' };

        beforeEach(() =>  mock.onGet(url).reply(200, body, headers));

        /**
         * @test {LastResponse}
         * @test {LastResponse.status}
         */
        it('enables access to the response status', () => actor.attemptsTo(
            Send.a(GetRequest.to(url)),
            Ensure.that(LastResponse.status(), equals(200)),
        ));

        /**
         * @test {LastResponse}
         * @test {LastResponse.body}
         */
        it('enables access to the response body', () => actor.attemptsTo(
            Send.a(GetRequest.to(url)),
            Ensure.that(LastResponse.body<Product>(), equals(body)),
        ));

        /**
         * @test {LastResponse}
         * @test {LastResponse.header}
         */
        it('enables access to a specific response header', () => actor.attemptsTo(
            Send.a(GetRequest.to(url)),
            Ensure.that(LastResponse.header('Content-Type'), equals(headers['Content-Type'])),
        ));

        /**
         * @test {LastResponse}
         * @test {LastResponse.headers}
         */
        it('enables access to all response headers', () => actor.attemptsTo(
            Send.a(GetRequest.to(url)),
            Ensure.that(LastResponse.headers(), equals(headers)),
        ));
    });

    /**
     * @test {CallAnApi.mapLastResponse}
     */
    it('complains if the last response is attempted to be retrieved without making a request first', () =>
        expect(actor.attemptsTo(
            Ensure.that(LastResponse.status(), equals(200)),
        )).to.be.rejectedWith(LogicError, 'Make sure to perform a HTTP API call before checking on the response'),
    );
});
