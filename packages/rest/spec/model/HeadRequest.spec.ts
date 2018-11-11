import 'mocha';

import { Actor } from '@serenity-js/core';
import { HeadRequest } from '../../src/model';
import { expect } from '../expect';

/** @test {HeadRequest} */
describe('HeadRequest', () => {

    const actor = Actor.named('Apisit');

    /** @test {HeadRequest.to} */
    it('represents an Axios request', () =>
        expect(actor.answer(HeadRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'HEAD',
                url: '/products/2',
            }));

    /**
     * @test {HeadRequest.to}
     * @test {HeadRequest#using}
     */
    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(HeadRequest.to('/products/2').using({
                headers: {
                    Accept: 'application/json',
                },
            })))
            .to.eventually.deep.equal({
                method: 'HEAD',
                url: '/products/2',
                headers: {
                    Accept: 'application/json',
                },
            }));
});
