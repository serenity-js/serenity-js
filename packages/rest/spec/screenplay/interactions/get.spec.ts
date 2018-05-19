import sinon = require('sinon');
import 'mocha';
import { CallAnApi } from '../../../src/screenplay/abilities';
import { Get } from '../../../src/screenplay/interactions';

import { Actor } from '@serenity-js/core/lib/screenplay';

import { expect } from '../../expect';

describe('Interactions', () => {
    const baseUrl = 'https://dum.my';

    describe('Get resource', () => {
        let spyAs, spyGet;
        const callAnApi = CallAnApi.at(baseUrl);
        const actor = Actor.named('James').whoCan(callAnApi),
            resource = '/get';

        before(() => {
            spyAs = sinon.spy(CallAnApi, 'as');
            spyGet = sinon.spy(callAnApi, 'get');
        });

        beforeEach(() => expect(Get.resource(resource).performAs(actor)).to.eventually.be.fulfilled);

        it('should perform as the actor.', () => {
            expect(spyAs).to.have.been.calledOnce;
        });

        it('should perform a Get on the resource', () => {
            expect(spyGet).to.have.been.calledWith(resource);
        });

        after(() => {
            spyAs.restore();
            spyGet.restore();
        });

    });
});
