import 'mocha';

import { actorCalled, configure, Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as path from 'path';
import { _electron as electron, ElectronApplication } from 'playwright';

import { describeElectronBehavior } from './shared-electron-tests';

describe('Serenity/JS with Playwright Test and Electron', () => {

    describe('Externally-managed Electron session', () => {

        let electronApp: ElectronApplication;

        before(async function () {
            this.timeout(30_000);

            const electronAppPath = path.resolve(__dirname, '../../../electron-app');

            electronApp = await electron.launch({
                args: [ path.join(electronAppPath, 'lib', 'main.js') ],
                cwd: electronAppPath,
            });

            // Wait for the first window
            await electronApp.firstWindow();

            configure({
                diffFormatter: new NoOpDiffFormatter(),
                actors: {
                    prepare: (actor) => actor.whoCan(
                        BrowseTheWebWithPlaywright.usingElectronApp(electronApp, {
                            defaultNavigationTimeout: Duration.ofSeconds(5).inMilliseconds(),
                            defaultTimeout: Duration.ofSeconds(3).inMilliseconds(),
                        })
                    ),
                },
            });

            // Create the actor in the before() hook so it's placed in the
            // 'background' focus area and persists across test scenes
            actorCalled('ExternalTester');
        });

        after(async function () {
            this.timeout(10_000);

            await actorCalled('ExternalTester').dismiss();
            await electronApp.close();
        });

        // Run the shared test suite
        describeElectronBehavior('externally-managed', 'ExternalTester');
    });
});
