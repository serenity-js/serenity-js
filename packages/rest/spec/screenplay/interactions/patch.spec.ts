import sinon = require('sinon');
import 'mocha';
import { CallAnApi } from '../../../src/screenplay/abilities';
import { Patch } from '../../../src/screenplay/interactions';

import { Actor } from '@serenity-js/core/lib/screenplay';

import { expect } from '../../expect';

describe('Interactions', () => {
    const baseUrl = 'https://dum.my';

    describe('Patch resource', () => {
        let spyAs, spyPatch;
        const callAnApi = CallAnApi.at(baseUrl);
        const actor = Actor.named('James').whoCan(callAnApi),
            resource = '/patch';
        const item = {username: '1337'};

        before(() => {
            spyAs = sinon.spy(CallAnApi, 'as');
            spyPatch = sinon.spy(callAnApi, 'patch');
        });

        beforeEach(() => expect(Patch.resource(resource).with(item).performAs(actor)).to.be.eventually.fulfilled);
        it('should perform as the actor.', () => expect(spyAs).to.have.been.calledOnce);
        it('should perform a Patch on the resource', () => expect(spyPatch).to.have.been.calledWith(resource, item));

        after(() => {
            spyAs.restore();
            spyPatch.restore();
        });
    });
});
