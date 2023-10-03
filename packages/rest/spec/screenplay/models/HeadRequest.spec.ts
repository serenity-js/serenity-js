import { q, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { HeadRequest } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

describe('HeadRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    it('represents an Axios request', () =>
        expect(actor.answer(HeadRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'HEAD',
                url: '/products/2',
            }));

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

    it('accepts dynamic records', () =>
        expect(
            actor.answer(HeadRequest.to('/products/2')
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
            )
        ).
        to.eventually.deep.equal({
            method: 'HEAD',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
        })
    );

    it('provides a sensible description of the interaction being performed', () => {
        expect(HeadRequest.to('/products/2').toString())
            .to.equal(`a HEAD request to '/products/2'`);
    });
});
