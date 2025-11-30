import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityRelatedArtifactGenerated,
    InteractionStarts,
    SceneFinished,
    SceneStarts
} from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    this.timeout(60 * 1000);

    describe('extraAbilities', () => {
        it('provide additional abilities to all actors', () =>
            playwrightTest(`--project=default`, 'screenplay/extraAbilities-for-all.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario has access to extra abilities')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: message`)))
                        .next(ActivityRelatedArtifactGenerated,   event => expect(event.artifact.map(value => value.data)).to.equal(`'Hello from MyAbility'`))
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    ;
                }));

        it('provide additional abilities only to some actors', () =>
            playwrightTest(`--project=default`, 'screenplay/extraAbilities-for-some.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario has access to extra abilities for some actors')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: message`)))
                        .next(ActivityRelatedArtifactGenerated,   event => expect(event.artifact.map(value => value.data)).to.equal(`'Hello from MyAbility'`))
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario has no access to extra abilities for other actors')))
                        .next(SceneFinished,       event => {
                            const outcome = event.outcome as unknown as ExecutionFailedWithError;
                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.message).to.contain(`They can't, however, MyAbility yet. Did you give them the ability to do so?`);
                        })
                    ;
                }));
    });
});
