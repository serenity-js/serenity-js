import 'sinon-chai';

import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { FetchRemoteResources } from '../../../src';

describe('FetchRemoteResources', () => {

    describe('when fetching remote resources', () => {

        it('returns parsed JSON from URL', async () => {
            const mockAxios = {
                get: sinon.stub().resolves({
                    data: { name: 'test', version: '1.0.0' },
                }),
            };

            const ability = FetchRemoteResources.using(mockAxios as any);
            const result = await ability.fetch<{ name: string; version: string }>('https://example.org/data.json');

            expect(result).to.deep.equal({ name: 'test', version: '1.0.0' });
            expect(mockAxios.get).to.have.been.calledWith('https://example.org/data.json');
        });

        it('throws NetworkError on failure', async () => {
            const mockAxios = {
                get: sinon.stub().rejects(new Error('Network Error')),
            };

            const ability = FetchRemoteResources.using(mockAxios as any);

            await expect(ability.fetch('https://example.org/data.json'))
                .to.be.rejectedWith(/Failed to fetch.*Network Error/);
        });

        it('throws NetworkError on timeout', async () => {
            const mockAxios = {
                get: sinon.stub().rejects(new Error('timeout of 10000ms exceeded')),
            };

            const ability = FetchRemoteResources.using(mockAxios as any);

            await expect(ability.fetch('https://example.org/data.json'))
                .to.be.rejectedWith(/Failed to fetch/);
        });

        it('throws NetworkError on HTTP error status', async () => {
            const mockAxios = {
                get: sinon.stub().rejects({
                    response: { status: 404, statusText: 'Not Found' },
                    message: 'Request failed with status code 404',
                }),
            };

            const ability = FetchRemoteResources.using(mockAxios as any);

            await expect(ability.fetch('https://example.org/data.json'))
                .to.be.rejectedWith(/Failed to fetch/);
        });
    });
});
