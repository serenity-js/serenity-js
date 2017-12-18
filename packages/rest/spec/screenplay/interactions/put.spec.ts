import sinon = require('sinon');
import 'mocha';
import {CallAnApi} from '../../../src/screenplay/abilities';
import {Put} from '../../../src/screenplay/interactions';

import {Actor} from '@serenity-js/core/lib/screenplay';

import {expect} from '../../expect';

describe('Interactions', () => {
    const baseUrl = 'https://dum.my';

    describe('put resource', () => {
        let spyAs, spyPut;
        const callAnApi = CallAnApi.at(baseUrl);
        const actor = Actor.named('James').whoCan(callAnApi),
            resource = '/put';
        const item = { username: '1337'};

        before(() => {
            spyAs = sinon.spy(CallAnApi, 'as');
            spyPut = sinon.spy(callAnApi, 'put');
        });

        beforeEach(() => expect(Put.itemOnResource(item, resource).performAs(actor)).to.be.eventually.be.fulfilled);
        it('should perform as the actor.', () => expect(spyAs).to.have.been.calledOnce);
        it('should perform a Put on the resource', () => expect(spyPut).to.have.been.calledWith(resource, item));

        after(() => {
            spyAs.restore();
            spyPut.restore();
        });

});

})
;
