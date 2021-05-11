import 'mocha';

import { OptionsRequest } from '../../src/model';
import { actorUsingAMockedAxiosInstance } from '../actors';
import { expect } from '../expect';

/** @test {OptionsRequest} */
describe('OptionsRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    /** @test {OptionsRequest.to} */
    it('represents an Axios request', () =>
        expect(actor.answer(OptionsRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'OPTIONS',
                url: '/products/2',
            }));

    /**
     * @test {OptionsRequest.to}
     * @test {OptionsRequest#using}
     */
    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(OptionsRequest.to('/products/2').using({
            headers: {
                Accept: 'application/json',
            },
        }))).
        to.eventually.deep.equal({
            method: 'OPTIONS',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
        }));

    /** @test {Options#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(OptionsRequest.to('/products/2').toString())
            .to.equal(`an OPTIONS request to '/products/2'`);
    });
});
