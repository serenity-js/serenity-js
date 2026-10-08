import { resolve } from 'node:path';

// Type-only imports, mirroring the Serenity/JS project templates.
// Unlike wdio.conf.ts, this config must NOT import any runtime values from @serenity-js/* modules,
// so that the first copy of @serenity-js/core loaded in the worker process is the one
// loaded by the WebdriverIO framework adapter, and not by the config file.
// See https://github.com/serenity-js/serenity-js/issues/3535
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        runner: 'mocha',
        crew: [
            '@integration/testing-tools:StdOutReporter',
        ],
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    specs: [ ], // specified in tests themselves to avoid loading more than needed

    reporters: [
        'spec',
    ],

    tsConfigPath: resolve(__dirname, './tsconfig.json'),

    runner: 'local',
    autoXvfb: false,

    maxInstances: 1,

    headless: true,

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

    logLevel: 'debug',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
