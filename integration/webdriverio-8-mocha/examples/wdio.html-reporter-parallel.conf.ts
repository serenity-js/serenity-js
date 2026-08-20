import { resolve } from 'node:path';

import { NoOpDiffFormatter } from '@serenity-js/core';
import { WebdriverIOConfig } from '@serenity-js/webdriverio-8';

const outputDirectory = resolve(__dirname, '..', 'target', 'html-report-parallel');

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio-8',

    serenity: {
        runner: 'mocha',
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            ['@serenity-js/html-reporter', {
                outputDirectory,
            }],
        ],
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    specs: [], // specified via --spec CLI arguments

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

    maxInstances: 2,

    headless: true,
    automationProtocol: 'devtools',

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            excludeSwitches: [ 'enable-automation' ],
            args: [
                'headless',
                'no-sandbox',
                'disable-dev-shm-usage',
                'disable-gpu',
                'window-size=1024x768',
            ],
        }
    }],

    logLevel: 'warn',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
