import 'mocha';

import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';

import { GetRequest, LastResponse, Send } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

/** @test {LastResponse} */
describe('LastResponse', () => {

    const { actor, mock } = actorUsingAMockedAxiosInstance();

    afterEach(() =>  mock.reset());

    interface Product {
        id: number;
        name: string;
    }

    const
        productList     = '/products',
        productDetails  = '/products/2',
        orange          = { id: 1, name: 'orange' },
        apple           = { id: 2, name: 'apple' },
        headers         = { 'Content-Type': 'application/json;charset=utf-8' };

    describe('when asserting on the response to the last HTTP request', () => {

        beforeEach(() => {
            mock.onGet(productList).reply(200, {
                products: [
                    orange,
                    apple,
                ]
            }, headers);

            mock.onGet(productDetails).reply(200, apple, headers);
        });

        /**
         * @test {LastResponse}
         * @test {LastResponse.status}
         */
        it('enables access to the response status', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.status(), equals(200)),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.body}
         */
        it('enables access to the response body', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.body<Product>(), equals(apple)),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.header}
         */
        it('enables access to a specific response header', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.header('Content-Type'), equals(headers['Content-Type'])),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.headers}
         */
        it('enables access to all response headers', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.headers(), equals(headers)),
            )
        );
    });

    describe('when working with adapters', () => {

        beforeEach(() => {
            mock.onGet(productList).reply(200, {
                products: [
                    orange,
                    apple,
                ]
            }, headers);

            mock.onGet(productDetails).reply(200, apple, headers);
        });

        /**
         * @test {LastResponse}
         * @test {LastResponse.status}
         */
        it('provides an adapter around response status', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.status().toFixed(2), equals('200.00')),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.body}
         */
        it('provides an adapter around response body', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.body<Product>().name.toLocaleUpperCase(), equals('APPLE')),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.body}
         */
        it('enables easy access to elements of an array', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productList)),
                Ensure.that(LastResponse.body<{ products: Product[] }>().products.length, equals(2)),
                Ensure.that(LastResponse.body<{ products: Product[] }>().products, equals([
                    orange, apple
                ])),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.header}
         */
        it('provides an adapter around individual response headers', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(
                    LastResponse.header('Content-Type').slice(0, LastResponse.header('Content-Type').indexOf(';')),
                    equals('application/json')
                ),
            )
        );

        /**
         * @test {LastResponse}
         * @test {LastResponse.headers}
         */
        it('provides an adapter around all response headers', () =>
            actor.attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.headers()['Content-Type'], equals('application/json;charset=utf-8')),
            )
        );
    });

    describe('when handling errors', () => {

        const Babs = actorCalled('Babs');

        /**
         * @test {LastResponse.status}
         */
        it('complains if the last response is attempted to be retrieved without making a request first', () =>
            expect(Babs.attemptsTo(
                Ensure.that(LastResponse.status(), equals(200)),
            )).to.be.rejectedWith(LogicError, 'Make sure to perform a HTTP API call before checking on the response'),
        );
    });
});
