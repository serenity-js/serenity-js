import { resolve } from 'path';
import { ConsoleReporter } from '@serenity-js/console-reporter';

export const config = {

    framework: '@serenity-js/webdriverio',

    serenity: {
        crew: [
            ConsoleReporter.forDarkTerminals(),
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    specs: [
        './spec/**/*.spec.ts',
    ],

    // reporters: [
    //     'spec',
    // ],

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
