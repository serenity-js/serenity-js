import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { resolve } from 'path';

export const config: WebdriverIOConfig = {

    baseUrl: 'https://todo-app.serenity-js.org/',

    framework: '@serenity-js/webdriverio',

    serenity: {
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
     * use the wdio-chromedriver-service:
     *
     *  https://www.npmjs.com/package/wdio-chromedriver-service
     *
     * or start chromedriver manually first:
     *
     *  npx chromedriver --port=4444
    */
    // automationProtocol: 'webdriver',

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
