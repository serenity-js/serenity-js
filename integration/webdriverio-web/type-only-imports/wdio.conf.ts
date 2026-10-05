import { resolve } from 'node:path';

import { Browser, computeExecutablePath } from '@puppeteer/browsers';
// Type-only imports, mirroring the Serenity/JS project templates.
// Unlike ../wdio.conf.ts, this config must NOT import any runtime values from @serenity-js/* modules,
// so that the first copy of @serenity-js/core loaded in the worker process is the one
// loaded by the WebdriverIO framework adapter, and not by the config file.
// See https://github.com/serenity-js/serenity-js/issues/3535
import type { WebdriverIOConfig } from '@serenity-js/webdriverio';

const port = process.env.PORT
    ? Number.parseInt(process.env.PORT, 10)
    : 8080;

const defaults = {
    buildId: 'stable',
    cacheDir: resolve(__dirname, '../../../browsers'),
};

const binaries = {
    chromedriver: computeExecutablePath({ browser: 'chromedriver' as Browser, ...defaults }),
    chrome: computeExecutablePath({ browser: 'chrome' as Browser, ...defaults }),
}

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    baseUrl: `http://localhost:${ port }`,

    serenity: {
        runner: 'mocha',
        crew: [
            '@serenity-js/console-reporter',
        ],
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 300_000,
    },

    specs: [
        resolve(__dirname, './**/*.spec.ts'),
    ],

    reporters: [
        'spec',
    ],

    runner: 'local',
    autoXvfb: false,

    waitforTimeout: 10_000,
    connectionRetryTimeout: 30_000,

    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            binary: binaries.chrome,
            excludeSwitches: [ 'enable-automation' ],
            args: [
                'disable-dev-shm-usage',
                'headless',
                'no-sandbox',
                'disable-gpu',
                'window-size=1024x768',
            ],
        },
        'wdio:chromedriverOptions': {
            binary: binaries.chromedriver
        }
    }],

    maxInstances: 1,

    logLevel: 'error',

    tsConfigPath: resolve(__dirname, '../tsconfig.json'),
};
