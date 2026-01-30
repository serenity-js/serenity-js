import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import type { Actor} from '../../../src';
import { Debug, Question, Serenity } from '../../../src';
import { Name } from '../../../src/model';
import { expect } from '../../expect';

describe('Debug', () => {

    const sandbox = sinon.createSandbox();

    let serenity: Serenity;
    let actor: Actor;

    beforeEach(() => {
        serenity = new Serenity();
        actor = serenity.theActorCalled('Debbie');
    });

    afterEach(async () => {
        sandbox.restore();
        await actor.dismiss();
    })

    it('invokes the debugger function with provided values when the interaction is performed', async () => {
        const primitiveValues = [
            1,
            'two'
        ];
        const debuggerSpy = sandbox.spy();

        const debug = Debug.values(debuggerSpy, ...primitiveValues);

        await serenity.theActorCalled('Debbie').attemptsTo(
            debug,
        );

        expect(debuggerSpy).to.have.been.calledWith(
            [
                { description: '1',     value: 1,       error: undefined },
                { description: `'two'`, value: 'two',   error: undefined },
            ],
            1,
            'two'
        );
    });

    it(`resolves any Answerable values before they're passed on to the debugger function`, async () => {
        const answerables = [
            Promise.resolve(1),
            Question.about('question adapter', actor => 'two')
        ];
        const debuggerSpy = sandbox.spy();

        const debug = Debug.values(debuggerSpy, ...answerables);

        await serenity.theActorCalled('Debbie').attemptsTo(
            debug,
        );

        expect(debuggerSpy).to.have.been.calledWith(
            [
                { description: 'Promise',           value: 1,       error: undefined },
                { description: `question adapter`,  value: 'two',   error: undefined },
            ],
            1,
            'two'
        );
    });

    it(`passes any error to the debugger function`, async () => {
        const answerables = [
            promiseRejectedWith(new Error('first error')),
            Question.about('question adapter', actor => { throw new Error('second error') })
        ];
        const debuggerSpy = sandbox.spy();

        const debug = Debug.values(debuggerSpy, ...answerables);

        await serenity.theActorCalled('Debbie').attemptsTo(
            debug,
        );

        const results       = debuggerSpy.firstCall.args[0];
        const firstAnswer   = debuggerSpy.firstCall.args[1];
        const secondAnswer  = debuggerSpy.firstCall.args[2];

        expect(results).to.have.lengthOf(2);
        expect(results[0].description).to.equal('Promise');
        expect(results[0].value).to.be.undefined;
        expect(results[0].error.message).to.equal('first error');
        expect(results[1].description).to.equal('question adapter');
        expect(results[1].value).to.be.undefined;
        expect(results[1].error.message).to.equal('second error');

        expect(firstAnswer).to.be.undefined;
        expect(secondAnswer).to.be.undefined;
    });

    it('emits debugged values so that they can be included in reports', async () => {
        const answerables = [
            'some value',
            Question.about('question adapter', actor => { throw new Error('second error') })
        ];
        const debuggerSpy = sandbox.spy();

        const debug = Debug.values(debuggerSpy, ...answerables);

        const actor = serenity.theActorCalled('Debbie');

        const collect = sinon.spy(actor, 'collect');

        await actor.attemptsTo(
            debug,
        );

        collect.firstCall.args[0].map(decoded => {
            expect(JSON.parse(decoded.data)).to.deep.equal({ value: `'some value'` });
        });
        expect(collect.firstCall.args[1]).to.equal(new Name(`'some value'`));

        collect.secondCall.args[0].map(decoded => {
            const data = JSON.parse(decoded.data);
            const error = JSON.parse(data.error);
            expect(error.message).to.deep.equal(`second error`);
        });
        expect(collect.secondCall.args[1]).to.equal(new Name(`question adapter`));
    });

    it('correctly detects its invocation location when debugging values', () => {
        const activity = Debug.values(() => {});
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Debug.spec.ts');
        expect(location.line).to.equal(132);
        expect(location.column).to.equal(32);
    });
});

function promiseRejectedWith(error: Error) {
    // needed to avoid PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 2)
    const promise = Promise.reject(error);
    promise.catch(error => void 0);
    return promise;
}
