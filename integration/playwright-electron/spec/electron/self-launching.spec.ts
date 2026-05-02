import 'mocha';

import { actorCalled, configure, Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright, type ElectronLaunchOptions } from '@serenity-js/playwright';
import * as path from 'path';

import { describeElectronBehavior } from './shared-electron-tests';

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
            crew: [],
            actors: {
                prepare: (actor) => actor.whoCan(
                    BrowseTheWebWithPlaywright.launchingElectronApp(electronOptions, {
                        defaultNavigationTimeout: Duration.ofSeconds(5).inMilliseconds(),
                        defaultTimeout: Duration.ofSeconds(3).inMilliseconds(),
                    })
                ),
            },
        });
    });

    after(async function () {
        this.timeout(10_000);

        await actorCalled('SelfLaunchTester').dismiss();
    });

    // Run the shared test suite
    describeElectronBehavior('self-launching', 'SelfLaunchTester');
});
