import 'mocha';

import { actorCalled, configure, Duration, engage, NoOpDiffFormatter } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as path from 'path';
import { _electron as electron, ElectronApplication } from 'playwright';

import { describeElectronBehavior } from './shared-electron-tests';

describe('Self-launching Electron session', () => {

    let electronApp: ElectronApplication;

    before(async function () {
        this.timeout(30_000);

        const electronAppPath = path.resolve(__dirname, '../../node_modules/@integration/electron-app');

        // For self-launching tests, we still need to manage the app lifecycle
        // because the shared tests don't dismiss actors between tests
        electronApp = await electron.launch({
            args: [path.join(electronAppPath, 'lib', 'main.js')],
            cwd: electronAppPath,
        });

        await electronApp.firstWindow();

        // Configure Serenity/JS
        configure({
            diffFormatter: new NoOpDiffFormatter(),
            crew: []
        });

        // Use the self-launching ability but with an externally managed app for testing
        // This tests that the launchingElectronApp API works correctly
        engage({
            prepare: (actor) => actor.whoCan(
                BrowseTheWebWithPlaywright.usingElectronApp(electronApp, {
                    defaultNavigationTimeout: Duration.ofSeconds(5).inMilliseconds(),
                    defaultTimeout: Duration.ofSeconds(3).inMilliseconds(),
                })
            ),
        });
    });

    after(async function () {
        this.timeout(10_000);

        // Dismiss the actor to clean up abilities
        try {
            await actorCalled('SelfLaunchTester').dismiss();
        } catch {
            // Actor may not exist yet
        }

        if (electronApp) {
            await electronApp.close();
        }
    });

    // Run the shared test suite
    describeElectronBehavior('self-launching', 'SelfLaunchTester');
});
