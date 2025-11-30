import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { InteractionStarts, SceneFinished, SceneStarts } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    describe('useBase', () => {

        it('allows the user to extend a single base test', async () => {
            const result = await playwrightTest(
                '--project=default',
                'screenplay/extensions/useBase_single_base.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('loads custom fixtures'));
                })
                .next(InteractionStarts, event => {
                    expect(event.details.name).to.equal(new Name(`Serena logs: 'my-marker'`));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        });

        it('allows the user to merge and extend multiple base tests', async () => {
            const result = await playwrightTest(
                '--project=default',
                'screenplay/extensions/useBase_multi_base.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('loads custom fixtures'));
                })
                .next(InteractionStarts, event => {
                    expect(event.details.name).to.equal(new Name(`Serena logs: 'first test marker, second test marker'`));
                })
                .next(InteractionStarts, event => {
                    expect(event.details.name).to.equal(new Name(`Serena logs: 'first worker marker, second worker marker'`));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        });
    });
});
