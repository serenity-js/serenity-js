import 'mocha';

import { HeadRequest } from '../../src/model';
import { actorUsingAMockedAxiosInstance } from '../actors';
import { expect } from '../expect';

/** @test {HeadRequest} */
describe('HeadRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

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
        }))).
        to.eventually.deep.equal({
            method: 'HEAD',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
        }));

    /** @test {HeadRequest#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(HeadRequest.to('/products/2').toString())
            .to.equal(`a HEAD request to '/products/2'`);
    });
});
