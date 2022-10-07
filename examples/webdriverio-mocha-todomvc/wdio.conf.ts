import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { resolve } from 'path';

import { Actors } from './src';

export const config: WebdriverIOConfig = {

    baseUrl: 'https://todo-app.serenity-js.org/',

    framework: '@serenity-js/webdriverio',

    serenity: {
        actors: new Actors(),
        crew: [
            ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
            Photographer.whoWill(TakePhotosOfFailures),
            // Photographer.whoWill(TakePhotosOfInteractions),
            ConsoleReporter.forDarkTerminals(),
            new SerenityBDDReporter(),
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

    // headless: true,
    automationProtocol: 'devtools',

    /*
     * To use the 'webdriver' protocol,
     * start chromedriver first:
     *
     *   npx chromedriver --port=4444
    */
    // automationProtocol: 'webdriver',

    runner: 'local',

    maxInstances: 1,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                // '--headless',
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--disable-infobars',
                '--ignore-certificate-errors',
                '--disable-gpu',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
        }
    }],

    logLevel: 'info',
    // logLevel: 'debug',

    waitforTimeout: 10_000,

    connectionRetryTimeout: 90_000,

    connectionRetryCount: 3,
};
