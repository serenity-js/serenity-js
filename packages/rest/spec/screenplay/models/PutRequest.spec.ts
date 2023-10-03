import { q, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { PutRequest } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

describe('PutRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    it('represents an Axios request', () =>
        expect(actor.answer(PutRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'PUT',
                url: '/products/2',
            }));

    it('can have a request body', () =>
        expect(actor.answer(PutRequest.to('/products/2').with({ name: 'apple' })))
            .to.eventually.deep.equal({
                method: 'PUT',
                url: '/products/2',
                data: { name: 'apple' },
            })
    );

    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(PutRequest.to('/products/2').with({ name: 'apple' }).using({
            headers: {
                Accept: 'application/json',
            },
        }))).
        to.eventually.deep.equal({
            method: 'PUT',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
            data: { name: 'apple' },
        })
    );

    it('accepts dynamic records', () =>
        expect(
            actor.answer(PutRequest.to('/products/2').with({ name: 'apple' })
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
            )
        ).
        to.eventually.deep.equal({
            method: 'PUT',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
            data: { name: 'apple' },
        })
    );

    it('provides a sensible description of the interaction being performed', () => {
        expect(PutRequest.to('/products/2').toString())
            .to.equal(`a PUT request to '/products/2'`);
    });
});
