import sinon = require('sinon');
import expect = require('../../../expect');
import { AssertionError } from 'chai';

import { Actor, Question, See, UsesAbilities } from '../../../../src/serenity/screenplay';

describe('Tasks', () => {

    describe('See', () => {

        class SomeResult implements Question<string> {
            answeredBy(actor: UsesAbilities): PromiseLike<string>|string {
                return Promise.resolve('some value');
            }
        }

        it ('allows actor to verify a condition', () => {
            const actor   = Actor.named('James');

            const promise = See.
                if(new SomeResult(), r => expect(r).to.eventually.equal('some value')).
                performAs(actor);

            return expect(promise).to.be.eventually.fulfilled;
        });

        it ('rejects the promise if the condition is not met', () => {
            const actor   = Actor.named('James');

            const promise = See.
                if(new SomeResult(), r => expect(r).to.eventually.equal('other value')).
                performAs(actor);

            return expect(promise).to.be.eventually.rejectedWith(AssertionError, 'expected \'some value\' to equal \'other value\'');
        });
    });
});
