import 'mocha';

import { DeleteRequest } from '../../src/model';
import { actorUsingAMockedAxiosInstance } from '../actors';
import { expect } from '../expect';

/** @test {DeleteRequest} */
describe('DeleteRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    /** @test {DeleteRequest.to} */
    it('represents an Axios request', () =>
        expect(actor.answer(DeleteRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'DELETE',
                url: '/products/2',
            }));

    /**
     * @test {DeleteRequest.to}
     * @test {DeleteRequest#using}
     */
    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(DeleteRequest.to('/products/2').using({
            headers: {
                Authorization: 'token',
            },
        }))).
        to.eventually.deep.equal({
            method: 'DELETE',
            url: '/products/2',
            headers: {
                Authorization: 'token',
            },
        }));

    /** @test {DeleteRequest#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(DeleteRequest.to('/products/2').toString())
            .to.equal(`a DELETE request to '/products/2'`);
    });
});
