import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { Log, Question, Serenity } from '../../../src';
import { Name } from '../../../src/model';
import { expect } from '../../expect';

describe('Log', () => {

    const sandbox = sinon.createSandbox();

    let serenity: Serenity;

    beforeEach(async () => {
        serenity = new Serenity();
    });

    afterEach(() => {
        sandbox.restore();
    })

    it(`describes what's logged`, () => {

        const log = Log.the('example', 42)

        expect(log.toString()).to.equal(`#actor logs: 'example', 42`);
    });

    it('emits debugged values so that they can be included in reports', async () => {

        const log = Log.the(Question.about('question adapter', actor => 'some value'));

        const actor = serenity.theActorCalled('Logan');

        const collect = sinon.spy(actor, 'collect');

        await actor.attemptsTo(
            log,
        );

        await actor.dismiss();

        collect.firstCall.args[0].map(decoded => {
            expect(decoded.data).to.deep.equal(`'some value'`);
        });
        expect(collect.firstCall.args[1]).to.equal(new Name(`question adapter`));
    });

    it('correctly detects its invocation location', () => {
        const activity = Log.the('example value');
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Log.spec.ts');
        expect(location.line).to.equal(50);
        expect(location.column).to.equal(30);
    });
});
