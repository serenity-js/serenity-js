import { AssertionError } from 'chai';

import { Actor, Question, See, UsesAbilities } from '../../../src/screenplay';
import { expect } from '../../expect';

describe('Interactions', () => {

    describe('See', () => {

        describe('when used with async questions', () => {
            const SomeAsyncResult = () => Question.about<Promise<string>>('some async result', actor => Promise.resolve('some value'));

            it('allows the actor to verify a condition', () => {
                const actor = Actor.named('James');

                const promise = See.if(SomeAsyncResult(), r => expect(r).to.eventually.equal('some value')).performAs(actor);

                return expect(promise).to.be.eventually.fulfilled;
            });

            it('rejects the promise if the condition is not met', () => {
                const actor = Actor.named('James');

                const promise = See.if(SomeAsyncResult(), r => expect(r).to.eventually.equal('other value')).performAs(actor);

                return expect(promise).to.be.eventually.rejectedWith(AssertionError, `expected 'some value' to equal 'other value'`);
            });
        });

        describe('when used with sync questions', () => {
            const SomeSyncResult = () => Question.about<string>('some async result', actor => 'some value');

            it('allows the actor to verify a condition', () => {
                const actor = Actor.named('James');

                const promise = See.if(SomeSyncResult(), r => expect(r).to.equal('some value')).performAs(actor);

                return expect(promise).to.be.eventually.fulfilled;
            });

            it('rejects the promise if the condition is not met', () => {
                const actor = Actor.named('James');

                const promise = See.if(SomeSyncResult(), r => expect(r).to.equal('other value')).performAs(actor);

                return expect(promise).to.be.eventually.rejectedWith(AssertionError, `expected 'some value' to equal 'other value'`);
            });
        });
    });
});
