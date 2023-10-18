import { q, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { OptionsRequest } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

describe('OptionsRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    it('represents an Axios request', () =>
        expect(actor.answer(OptionsRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'OPTIONS',
                url: '/products/2',
            }));

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

    it('accepts dynamic records', () =>
        expect(
            actor.answer(OptionsRequest.to('/products/2')
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
            )
        ).
        to.eventually.deep.equal({
            method: 'OPTIONS',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
        })
    );

    it('provides a sensible description of the interaction being performed', () => {
        expect(OptionsRequest.to('/products/2').toString())
            .to.equal(`an OPTIONS request to '/products/2'`);
    });
});
