import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, engage, List, LogicError } from '@serenity-js/core';
import type MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, it } from 'mocha';

import { GetRequest, LastResponse, Send } from '../../../src';
import { actors } from '../../actors';
import { expect } from '../../expect';

interface Product {
    id: number;
    name: string;
}

describe('LastResponse', () => {

    let mock: MockAdapter;

    beforeEach(() => {
        const context = actors();

        engage(context.actors);

        mock = context.mock;
    });

    afterEach(() =>  mock.reset());

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

        it('enables access to the response status', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.status(), equals(200)),
            )
        });

        it('enables access to the response body', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.body<Product>(), equals(apple)),
            );
        });

        it('enables access to a specific response header', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.header('Content-Type'), equals(headers['Content-Type'])),
            );
        });

        it('enables access to all response headers', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.headers(), equals(headers)),
            );
        });
    });

    describe('when working with adapters', () => {

        beforeEach(() => {
            mock.onGet(productList).reply(200, {
                products: [
                    orange,
                    apple,
                ]
            }, headers);

            mock.onGet(`/products/${ orange.id }` ).reply(200, orange, headers);
            mock.onGet(`/products/${ apple.id }` ).reply(200, apple, headers);
        });

        it('provides an adapter around response status', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.status().toFixed(2), equals('200.00')),
            );
        });

        it('provides an adapter around response body',async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.body<Product>().name.toLocaleUpperCase(), equals('APPLE')),
            );
        });

        it('enables easy access to elements of an array', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productList)),
                Ensure.that(LastResponse.body<{ products: Product[] }>().products.length, equals(2)),
                Ensure.that(LastResponse.body<{ products: Product[] }>().products, equals([
                    orange, apple
                ])),
            );
        });

        it('provides an adapter around individual response headers', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(
                    LastResponse.header('Content-Type').slice(0, LastResponse.header('Content-Type').indexOf(';')),
                    equals('application/json')
                ),
            );
        });

        it('provides an adapter around all response headers', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(productDetails)),
                Ensure.that(LastResponse.headers()['Content-Type'], equals('application/json;charset=utf-8')),
            );
        });

        it('allows for an Adapter<Array> to be wrapped in a List', async () => {
            await actorCalled('Apisitt').attemptsTo(
                Send.a(GetRequest.to(`/products`)),
                List.of<Product>(LastResponse.body<{ products: Product[] }>().products)
                    .forEach(({ item, actor }) =>
                        actor.attemptsTo(
                            Send.a(GetRequest.to(`/products/${item.id}`)),
                            Ensure.that(LastResponse.body<Product>().id, equals(item.id)),
                        )
                    ),
            )
        });
    });

    describe('when handling errors', () => {

        it('complains if the last response is attempted to be retrieved without making a request first', async () => {
            const result = actorCalled('Apisitt').attemptsTo(
                Ensure.that(LastResponse.status(), equals(200)),
            );

            await expect(result).to.be.rejectedWith(LogicError, 'Make sure to perform a HTTP API call before checking on the response');
        });
    });
});
