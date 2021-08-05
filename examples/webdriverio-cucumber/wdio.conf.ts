import { resolve } from 'path';
import { createWriteStream } from 'fs';
import { ArtifactArchiver, StreamReporter } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import Inspector from './src/Inspector';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

export const config = {

    framework: '@serenity-js/webdriverio',
    // framework: 'cucumber',

    serenity: {
        runner: 'cucumber',
        crew: [
            ConsoleReporter.forDarkTerminals(),
            new SerenityBDDReporter(),
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            // new StreamReporter(createWriteStream(`events-${ process.pid }.ndjson`)),
        ]
    },

    cucumberOpts: {
        require: [
            './features/step_definitions/**/*.ts',
        ],
        // 'require-module': ['ts-node/register'],  // not needed, WebdriverIO is already doing the job
    },

    specs: [
        './features/**/*.feature',
    ],

    reporters: [
        'spec',
        // [ Inspector, { outputDir: `./log/tmp` } ]
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

    logLevel: 'warn',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
