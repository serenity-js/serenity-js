import { q, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { PatchRequest } from '../../src/models';
import { actorUsingAMockedAxiosInstance } from '../actors';
import { expect } from '../expect';

/** @test {PatchRequest} */
describe('PatchRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    /** @test {PatchRequest.to} */
    it('represents an Axios request', () =>
        expect(actor.answer(PatchRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'PATCH',
                url: '/products/2',
            }));

    /**
     * @test {PatchRequest.to}
     * @test {PatchRequest#with}
     */
    it('can have a request body', () =>
        expect(actor.answer(PatchRequest.to('/products/2').with({ name: 'apple' })))
            .to.eventually.deep.equal({
                method: 'PATCH',
                url: '/products/2',
                data: { name: 'apple' },
            })
    );

    /**
     * @test {PatchRequest.to}
     * @test {PatchRequest#with}
     * @test {PatchRequest#using}
     */
    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(PatchRequest.to('/products/2').with({ name: 'apple' }).using({
            headers: {
                Accept: 'application/json',
            },
        }))).
        to.eventually.deep.equal({
            method: 'PATCH',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
            data: { name: 'apple' },
        })
    );

    it('accepts dynamic records', () =>
        expect(
            actor.answer(PatchRequest.to('/products/2').with({ name: 'apple' })
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
            )
        ).
        to.eventually.deep.equal({
            method: 'PATCH',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
            data: { name: 'apple' },
        })
    );

    /** @test {PatchRequest#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(PatchRequest.to('/products/2').toString())
            .to.equal(`a PATCH request to '/products/2'`);
    });
});
