import { actorCalled, engage, q, Question } from '@serenity-js/core';
import { beforeEach, describe, it } from 'mocha';

import { OptionsRequest } from '../../../src';
import { actors } from '../../actors';
import { expect } from '../../expect';

describe('OptionsRequest', () => {

    beforeEach(() => {
        const context = actors();
        engage(context.actors);
    });

    it('represents an Axios request', async () => {
        const result = await actorCalled('Apisitt').answer(
            OptionsRequest.to('/products/2')
        );

        expect(result).to.deep.equal({
            method: 'OPTIONS',
            url: '/products/2',
        });
    });

    it('allows for additional request properties to be specified', async () => {
        const result = await actorCalled('Apisitt').answer(
            OptionsRequest.to('/products/2').using({
                headers: {
                    Accept: 'application/json',
                },
            })
        );

        expect(result).to.deep.equal({
            method: 'OPTIONS',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
        });
    });

    it('accepts dynamic records', async () => {
        const result = await actorCalled('Apisitt').answer(
            OptionsRequest.to('/products/2').using({
                headers: {
                    Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                },
            })
        );

        expect(result).to.deep.equal({
            method: 'OPTIONS',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
        });
    });

    it('provides a sensible description of the interaction being performed', () => {
        expect(OptionsRequest.to('/products/2').toString())
            .to.equal(`an OPTIONS request to '/products/2'`);
    });
});
