import 'mocha';

import { actorCalled, configure, Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, type ElectronLaunchOptions } from '@serenity-js/playwright';
import * as path from 'path';

import { describeElectronBehavior } from './shared-electron-tests';

describe('Serenity/JS with Playwright Test and Electron', () => {

    describe('Self-launching Electron session', () => {

        before(async function () {
            this.timeout(30_000);

            const electronAppPath = path.resolve(__dirname, '../../../electron-app');

            const electronOptions: ElectronLaunchOptions = {
                args: [ path.join(electronAppPath, 'lib', 'main.js') ],
                cwd: electronAppPath,
            };

            configure({
                diffFormatter: new NoOpDiffFormatter(),
                actors: {
                    prepare: (actor) => actor.whoCan(
                        BrowseTheWebWithPlaywright.launchingElectronApp(electronOptions, {
                            defaultNavigationTimeout: Duration.ofSeconds(5).inMilliseconds(),
                            defaultTimeout: Duration.ofSeconds(3).inMilliseconds(),
                        })
                    ),
                },
            });

            // Create the actor in the before() hook so it's placed in the
            // 'background' focus area and persists across test scenes
            actorCalled('SelfLaunchTester');
        });

        after(async function () {
            this.timeout(10_000);

            await actorCalled('SelfLaunchTester').dismiss();
        });

        // Run the shared test suite
        describeElectronBehavior('self-launching', 'SelfLaunchTester');
    });
});
