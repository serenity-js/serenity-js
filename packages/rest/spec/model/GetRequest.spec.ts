import 'mocha';

import { Actor } from '@serenity-js/core';
import { GetRequest } from '../../src/model';
import { expect } from '../expect';

/** @test {GetRequest} */
describe('GetRequest', () => {

    const actor = Actor.named('Apisit');

    /** @test {GetRequest.to} */
    it('represents an Axios request', () =>
        expect(actor.answer(GetRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'GET',
                url: '/products/2',
            }));

    /**
     * @test {GetRequest.to}
     * @test {GetRequest#using}
     */
    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(GetRequest.to('/products/2').using({
                headers: {
                    Accept: 'application/json',
                },
            })))
            .to.eventually.deep.equal({
                method: 'GET',
                url: '/products/2',
                headers: {
                    Accept: 'application/json',
                },
            }));
});
