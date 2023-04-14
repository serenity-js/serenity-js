import { StdOutReporter } from '@integration/testing-tools';
import { Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { resolve } from 'path';

import { Actors } from './src';

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        runner: 'mocha',
        actors: new Actors(),
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

    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: resolve(__dirname, './tsconfig.json'),
        },
    },
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
