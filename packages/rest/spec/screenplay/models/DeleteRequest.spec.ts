import { q, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { DeleteRequest } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

describe('DeleteRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    it('represents an Axios request', () =>
        expect(actor.answer(DeleteRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'DELETE',
                url: '/products/2',
            }));

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

    it('accepts dynamic records', () =>
        expect(
            actor.answer(DeleteRequest.to('/products/2')
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
            )
        ).
        to.eventually.deep.equal({
            method: 'DELETE',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
        })
    );

    it('provides a sensible description of the interaction being performed', () => {
        expect(DeleteRequest.to('/products/2').toString())
            .to.equal(`a DELETE request to '/products/2'`);
    });
});
