import { q, Question } from '@serenity-js/core';
import { describe, it } from 'mocha';

import { GetRequest } from '../../../src';
import { actorUsingAMockedAxiosInstance } from '../../actors';
import { expect } from '../../expect';

describe('GetRequest', () => {

    const { actor } = actorUsingAMockedAxiosInstance();

    it('represents an Axios request', () =>
        expect(actor.answer(GetRequest.to('/products/2')))
            .to.eventually.deep.equal({
                method: 'GET',
                url: '/products/2',
            }));

    it('allows for additional request properties to be specified', () =>
        expect(actor.answer(GetRequest.to('/products/2').using({
            headers: {
                Accept: 'application/json',
            },
            maxRedirects: 0,
        }))).
        to.eventually.deep.equal({
            method: 'GET',
            url: '/products/2',
            headers: {
                Accept: 'application/json',
            },
            maxRedirects: 0,
        }));

    it('accepts dynamic records', () =>
        expect(
            actor.answer(GetRequest.to('/products/2')
                .using({
                    headers: {
                        Authorization: q`Bearer ${ Question.about('token', actor => 'some-token') }`,
                    },
                })
            )
        ).
        to.eventually.deep.equal({
            method: 'GET',
            url: '/products/2',
            headers: {
                Authorization: 'Bearer some-token',
            },
        })
    );

    it('provides a sensible description of the interaction being performed', () => {
        expect(GetRequest.to('/products/2').toString())
            .to.equal(`a GET request to '/products/2'`);
    });
});
