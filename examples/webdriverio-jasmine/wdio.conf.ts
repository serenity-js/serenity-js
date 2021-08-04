import { resolve } from 'path';
import { createWriteStream } from 'fs';
import { StreamReporter } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import Inspector from './src/Inspector';

export const config = {

    framework: '@serenity-js/webdriverio',
    // framework: 'jasmine',

    serenity: {
        runner: 'jasmine',
        crew: [
            ConsoleReporter.forDarkTerminals(),
            // new StreamReporter(createWriteStream(`events-${ process.pid }.ndjson`)),
        ]
    },

    jasmineOpts: {
        ui:     'bdd',
        timeout: 60000,
    },

    specs: [
        './spec/**/*.spec.ts',
    ],

    reporters: [
        // 'spec',
        // Inspector,
    ],

    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: resolve(__dirname, './tsconfig.json'),
        },
    },

    headless: true,
    automationProtocol: 'devtools',

    runner: 'local',

    maxInstances: 1,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--headless',
                '--disable-infobars',
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
