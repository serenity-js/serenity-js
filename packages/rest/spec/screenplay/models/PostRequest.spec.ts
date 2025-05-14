import { actorCalled, engage, q, Question } from '@serenity-js/core';
import { beforeEach, describe, it } from 'mocha';

import { PostRequest } from '../../../src';
import { actors } from '../../actors';
import { expect } from '../../expect';

describe('PostRequest', () => {

    beforeEach(() => {
        const context = actors();
        engage(context.actors);
    });

    it('represents an Axios request', async () => {
        const result = await actorCalled('Apisitt').answer(
            PostRequest.to('/products/2')
        );

        expect(result).to.deep.equal({
            method: 'POST',
            url: '/products/2',
        });
    });

    it('can have a request body', async () => {
        const result = await actorCalled('Apisitt').answer(
            PostRequest.to('/products/2').with({ name: 'apple' })
        );

        expect(result).to.deep.equal({
            method: 'POST',
            url: '/products/2',
            data: { name: 'apple' },
        });
    });

    it('allows for additional request properties to be specified', async () => {
        const result = await actorCalled('Apisitt').answer(
            PostRequest.to('/products/2')
                .with({ name: 'apple' })
                .using({
                    headers: {
                        Accept: 'application/json',
                    },
                })
        );

        expect(result).to.deep.equal({
            method: 'POST',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
            data: { name: 'apple' },
        });
    });

    it('accepts dynamic records', async () => {
        const result = await actorCalled('Apisitt').answer(
            PostRequest.to('/products/2')
                .with({ name: 'apple' })
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
        );

        expect(result).to.deep.equal({
            method: 'POST',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
            data: { name: 'apple' },
        });
    });

    it('provides a sensible description of the interaction being performed', () => {
        expect(PostRequest.to('/products/2').toString())
            .to.equal(`a POST request to '/products/2'`);
    });
});
