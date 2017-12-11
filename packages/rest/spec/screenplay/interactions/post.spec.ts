import sinon = require('sinon');
import 'mocha';
import {CallAnApi} from '../../../src/screenplay/abilities';
import {Post} from '../../../src/screenplay/interactions';

import {Actor} from '@serenity-js/core/lib/screenplay';

import {expect} from '../../expect';

describe('Interactions', () => {
    const baseUrl = 'https://dum.my';

    describe('Post resource', () => {
        let spyAs, spyPost;
        const callAnApi = CallAnApi.at(baseUrl);
        const actor = Actor.named('James').whoCan(callAnApi),
            resource = '/get';
        const item = { username: '1337'};

        before(() => {
            spyAs = sinon.spy(CallAnApi, 'as');
            spyPost = sinon.spy(callAnApi, 'post');
        });

        beforeEach(() => expect(Post.itemOnResource(item, resource).performAs(actor)).to.be.eventually.be.fulfilled);
        it('should perform as the actor.', () => expect(spyAs).to.have.been.calledOnce);
        it('should perform a Get on the resource', () => expect(spyPost).to.have.been.calledWith(resource, item));

});

})
;
