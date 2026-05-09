import { ElectronApp } from '@integration/electron-app/serenity';
import { Ensure, equals } from '@serenity-js/assertions';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { describe, it, test } from '@serenity-js/playwright-test';
import { Click, Text } from '@serenity-js/web';
import path from 'path';
import * as playwright from 'playwright';

const electronAppPath = path.resolve(__dirname, '../../../electron-app');

describe('Self-launching electron app per test', () => {

    test.use({
        extraAbilities: [
            async ({}, use) => {
                const electronApp = await playwright._electron.launch({
                    args: [ path.join(electronAppPath, 'lib', 'main.js') ],
                    cwd: electronAppPath,
                });

                await use([
                    BrowseTheWebWithPlaywright.usingElectronApp(electronApp)
                ]);

                await electronApp.close();
            },
            { scope: 'test' },
        ]
    });

    describe.serial('when running in serial mode', () => {

        it(`allows the actor to interact with the app`, async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
                Click.on(ElectronApp.clickButton),
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });

        it(`restarts the app between tests to avoid state leakage`, async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
            );
        });
    });

    describe('when running in parallel mode', () => {

        it(`allows the actor to interact with the app`, async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
                Click.on(ElectronApp.clickButton),
                Ensure.that(Text.of(ElectronApp.clickCount), equals('1')),
            );
        });

        it(`restarts the app between tests to avoid state leakage`, async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(Text.of(ElectronApp.clickCount), equals('0')),
            );
        });
    });
});
