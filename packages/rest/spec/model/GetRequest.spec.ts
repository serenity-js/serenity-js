import 'mocha';

import { Actor } from '@serenity-js/core';
import { DeleteRequest, GetRequest } from '../../src/model';
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

    /** @test {GetRequest#toString} */
    it(`provides a sensible description of the interaction being performed`, () => {
        expect(GetRequest.to('/products/2').toString())
            .to.equal(`a GET request to '/products/2'`);
    });
});
