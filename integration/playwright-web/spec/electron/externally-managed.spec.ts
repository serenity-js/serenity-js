import 'mocha';

import { actorCalled, configure, Duration, engage, NoOpDiffFormatter } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as path from 'path';
import { _electron as electron, ElectronApplication } from 'playwright';

import { describeElectronBehavior } from './shared-electron-tests';

describe('Externally-managed Electron session', () => {

    let electronApp: ElectronApplication;

    before(async function () {
        this.timeout(30_000);

        const electronAppPath = path.resolve(__dirname, '../../node_modules/@integration/electron-app');

        // Launch the Electron app
        electronApp = await electron.launch({
            args: [path.join(electronAppPath, 'lib', 'main.js')],
            cwd: electronAppPath,
        });

        // Wait for the first window
        await electronApp.firstWindow();

        // Configure Serenity/JS with the externally-managed Electron session
        configure({
            diffFormatter: new NoOpDiffFormatter(),
            crew: []
        });

        // Engage the cast that provides the Electron ability
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
            await actorCalled('ExternalTester').dismiss();
        } catch {
            // Actor may not exist yet
        }

        if (electronApp) {
            await electronApp.close();
        }
    });

    // Run the shared test suite
    describeElectronBehavior('externally-managed', 'ExternalTester');
});
