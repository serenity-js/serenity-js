import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts } from '@serenity-js/core/events';
import { ExecutionSuccessful, Name } from '@serenity-js/core/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    describe('electron integration', () => {

        it('launches a fresh electron app instance per test for test-scoped actors', async () => {
            const result = await playwrightTest(
                '--project=default',
                'electron/self-launching-app-per-test.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('when running in serial mode allows the actor to interact with the app'));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('when running in serial mode restarts the app between tests to avoid state leakage'));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        }).timeout(60_000);

        it('launches a fresh electron app instance per worker for worker-scoped actors', async () => {
            const result = await playwrightTest(
                '--project=default',
                'electron/self-launching-app-per-worker.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('when running in serial mode allows the actor to interact with the app'));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('when running in serial mode maintains the app between tests to allow for app state reuse'));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        }).timeout(60_000);

        it('supports externally-managed electron apps', async () => {
            const result = await playwrightTest(
                '--project=default',
                'electron/externally-managed-app-per-test.spec.ts'
            ).then(ifExitCodeIsOtherThan(0, logOutput));

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('when running in serial mode allows the actor to interact with the app'));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                .next(SceneStarts, event => {
                    expect(event.details.name).to.equal(new Name('when running in serial mode restarts the app between tests to avoid state leakage'));
                })
                .next(SceneFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        }).timeout(60_000);
    });
});
