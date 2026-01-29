import * as path from 'node:path';

import { StdOutReporter } from '@integration/testing-tools';
import { Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { WithSerenityConfig } from '@serenity-js/webdriverio';

// Marker prefix for afterTest hook output, used by integration tests to verify hook invocation
const AFTER_TEST_MARKER = '[AfterTest]';

export const config: WebdriverIO.Config & WithSerenityConfig = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        runner: 'mocha',
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            new StdOutReporter(),
        ],
        cueTimeout: Duration.ofSeconds(1),
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    specs: [ ], // specified in tests themselves to avoid loading more than needed

    reporters: [
        'spec',
    ],

    tsConfigPath: path.resolve(__dirname, './tsconfig.json'),

    runner: 'local',

    maxInstances: 1,

    headless: true,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            excludeSwitches: [ 'enable-automation' ],
            args: [
                'headless',
                'no-sandbox',
                'disable-gpu',
                'window-size=1024x768',
            ],
        }
    }],

    logLevel: 'debug',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,

    /**
     * Hook that gets executed after a test (in Mocha/Jasmine only)
     * This hook is used to verify that Serenity/JS correctly awaits the afterTest hook
     * before completing the test scenario.
     */
    afterTest: async function (test, _context, result) {
        // Log the hook invocation with test details for verification
        console.log(`${ AFTER_TEST_MARKER }${ JSON.stringify({
            title: test.title,
            passed: result.passed,
            duration: result.duration,
        }) }`);

        // Simulate an async operation to verify the hook is properly awaited
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log(`${ AFTER_TEST_MARKER }${ JSON.stringify({
            event: 'completed',
            title: test.title,
        }) }`);
    },
};
