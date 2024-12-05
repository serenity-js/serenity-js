import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { resolve } from 'path';

import { Actors } from './src';

export const config: WebdriverIOConfig = {

    baseUrl: 'https://todo-app.serenity-js.org/',

    framework: '@serenity-js/webdriverio',

    serenity: {
        // optional, custom cast of actors
        actors: new Actors(),
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
            // [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfInteractions' } ],
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
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

    tsConfigPath: 'tsconfig.json',

    runner: 'local',

    maxInstances: 1,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            excludeSwitches: [ 'enable-automation' ],
            args: [
                // '--headless',
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
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
