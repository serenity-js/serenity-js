import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { InteractionStarts, SceneFinished, SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { CapabilityTag, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    describe('supports invoking actors in test hooks', () => {

        it('injects actors with default abilities', () =>
            playwrightTest(`--project=default`, 'screenplay/inspect-hooks.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario receives an actor with default abilities')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Screenplay')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Hooks')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'BrowseTheWebWithPlaywright'`)))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Betty logs: 'BrowseTheWebWithPlaywright'`)))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Charlie logs: 'BrowseTheWebWithPlaywright'`)))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Danielle logs: 'BrowseTheWebWithPlaywright'`)))
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                        // todo add support for afterAll hooks:
                        //  follow https://github.com/microsoft/playwright/blob/main/packages/playwright/src/reporters/json.ts
                        //  .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Ellie logs: 'CallAnApi'`)))
                    ;
                }));
    });
});
