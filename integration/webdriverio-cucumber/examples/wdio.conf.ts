import { StdOutReporter } from '@integration/testing-tools';
import { Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { resolve } from 'path';

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',
    // framework: 'cucumber',

    serenity: {
        runner: 'cucumber',
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            new StdOutReporter(),
        ],
        cueTimeout: Duration.ofSeconds(1),
    },

    cucumberOpts: {
        require: [
            './examples/features/step_definitions/steps.ts',
        ],
    },

    specs: [
        // specified directly in tests
    ],

    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: resolve(__dirname, '../tsconfig.json'),
        },
    },

    reporters: [
        'spec',
    ],

    runner: 'local',

    maxInstances: 1,

    headless: true,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            excludeSwitches: [ 'enable-automation' ],
            args: [
                '--headless',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
        }
    }],

    logLevel: 'debug',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
