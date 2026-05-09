import { ElectronApp } from '@integration/electron-app/serenity';
import { Ensure, equals } from '@serenity-js/assertions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { beforeAll, describe, it, test } from '@serenity-js/playwright-test';
import { Click, Text } from '@serenity-js/web';
import path from 'path';

const electronAppPath = path.resolve(__dirname, '../../../electron-app');

test.use({
    extraWorkerAbilities: [
        async ({ }, use) => {
            await use((actorName: string) => [
                BrowseTheWebWithPlaywright.launchingElectronApp({
                    args: [ path.join(electronAppPath, 'lib', 'main.js') ],
                    cwd: electronAppPath,
                })
            ]);
        }, { scope: 'worker' }],
});

describe('Self-launching electron app per worker', () => {

    describe.serial('when running in serial mode', () => {

        // beforeAll starts a worker-scoped actor
        beforeAll(async ({ actorCalled }, info) => {
            await actorCalled('Serial Worker').attemptsTo(
                Ensure.that(Text.of(ElectronApp.title), equals('Serenity/JS Electron Test App')),
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
            );
        });

        it(`allows the actor to interact with the app`, async ({ actorCalled }) => {
            await actorCalled('Serial Worker').attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
                Click.on(ElectronApp.clickButton),
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });

        it(`maintains the app between tests to allow for app state reuse `, async ({ actorCalled }, info) => {
            await actorCalled('Serial Worker').attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });
    });

    describe('when running in parallel mode', () => {

        // beforeAll starts a worker-scoped actor
        beforeAll(async ({ actorCalled }, info) => {
            await actorCalled('Parallel Worker').attemptsTo(
                Ensure.that(Text.of(ElectronApp.title), equals('Serenity/JS Electron Test App')),
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
                Click.on(ElectronApp.clickButton),
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });

        it(`allows multiple actors to launch their individual apps`, async ({ actorCalled }) => {
            await actorCalled('Parallel Worker').attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });

        it(`preserves the state of each launched app independently`, async ({ actorCalled }) => {
            await actorCalled('Parallel Worker').attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });
    });
});
