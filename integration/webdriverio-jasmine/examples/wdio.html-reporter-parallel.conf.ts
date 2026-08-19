import path from 'node:path';

import { NoOpDiffFormatter } from '@serenity-js/core';
import { WithSerenityConfig } from '@serenity-js/webdriverio';

const outputDirectory = path.resolve(__dirname, '..', 'target', 'html-report-parallel');

export const config: WebdriverIO.Config & WithSerenityConfig = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        runner: 'jasmine',
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            ['@serenity-js/html-reporter', {
                outputDirectory,
            }],
        ],
    },

    specs: [], // specified via --spec CLI arguments to ensure correct path resolution

    reporters: [
        'spec',
    ],

    runner: 'local',

    maxInstances: 2,

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

    logLevel: 'warn',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
