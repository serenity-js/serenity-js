import sinon = require('sinon');
import 'mocha';
import { CallAnApi } from '../../../src/screenplay/abilities';
import { Delete } from '../../../src/screenplay/interactions';

import { Actor } from '@serenity-js/core/lib/screenplay';

import { expect } from '../../expect';

describe('Interactions', () => {
    const baseUrl = 'https://dum.my';

    describe('delete resource', () => {
        let spyAs, spyDelete;
        const callAnApi = CallAnApi.at(baseUrl);
        const actor = Actor.named('James').whoCan(callAnApi),
            resource = '/delete';

        before(() => {
            spyAs = sinon.spy(CallAnApi, 'as');
            spyDelete = sinon.spy(callAnApi, 'delete');
        });

        beforeEach(() => expect(Delete.resource(resource).performAs(actor)).to.eventually.be.fulfilled);

        it('should perform as the actor.', () => {
            expect(spyAs).to.have.been.calledOnce;
        });

        it('should perform a Delete on the resource', () => {
            expect(spyDelete).to.have.been.calledWith(resource);
        });

        after(() => {
            spyAs.restore();
            spyDelete.restore();
        });
    });
});
