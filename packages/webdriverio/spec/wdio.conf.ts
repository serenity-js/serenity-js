import { resolve } from 'path'; // eslint-disable-line unicorn/import-style

import { Actors } from './screenplay/Actors';

const port = process.env.PORT || 8080;

export const config = {

    baseUrl: `http://localhost:${ port }`,

    framework: resolve(__dirname, '../src'),

    serenity: {
        actors: new Actors(),
        crew: [
            // ConsoleReporter.forDarkTerminals(),
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60_000_000,
    },

    specs: [
        './spec/expectations/**/*.spec.ts',
        './spec/screenplay/**/*.spec.ts',
        './spec/stage/**/*.spec.ts',
    ],

    reporters: [
        // 'spec',
        'dot',
    ],

    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            transpileOnly: true,
            project: resolve(__dirname, '../tsconfig.json'),
        },
    },

    headless: true,
    automationProtocol: 'devtools',

    runner: 'local',

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
        },
    }],

    logLevel: 'warn',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
