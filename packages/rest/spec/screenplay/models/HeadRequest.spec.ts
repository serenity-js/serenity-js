import { actorCalled, engage, q, Question } from '@serenity-js/core';
import { beforeEach, describe, it } from 'mocha';

import { HeadRequest } from '../../../src';
import { actors } from '../../actors';
import { expect } from '../../expect';

describe('HeadRequest', () => {

    beforeEach(() => {
        const context = actors();

        engage(context.actors);
    });

    it('represents an Axios request', async () => {

        const result = await actorCalled('Apisitt').answer(
            HeadRequest.to('/products/2')
        );

        expect(result).to.deep.equal({
            method: 'HEAD',
            url: '/products/2',
        });
    });

    it('allows for additional request properties to be specified', async () => {
        const result = await actorCalled('Apisitt').answer(
            HeadRequest.to('/products/2')
                .using({
                    headers: {
                        Authorization: 'token',
                    },
                })
        );

        expect(result).to.deep.equal({
            method: 'HEAD',
            url: '/products/2',
            headers: {
                Authorization: 'token',
            },
        })
    });

    it('accepts dynamic records', async () => {
        const result = await actorCalled('Apisitt').answer(
            HeadRequest.to('/products/2')
                .using({
                    headers: {
                        Authorization: q`Bearer ${Question.about('token', actor => 'some-token')}`,
                    },
                })
        );

        expect(result).to.deep.equal({
            method: 'HEAD',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
        })
    });

    it('provides a sensible description of the interaction being performed', () => {
        expect(HeadRequest.to('/products/2').toString())
            .to.equal(`a HEAD request to '/products/2'`);
    });
});
