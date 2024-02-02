import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { resolve } from 'path';

export const config: WebdriverIOConfig = {

    // rootDir: 'test/spec',
    framework: '@serenity-js/webdriverio',

    serenity: {
        crew: [
            '@serenity-js/console-reporter',
            [ '@serenity-js/serenity-bdd', { specDirectory: 'test/spec' } ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60_000,
        reporterOptions: {
            specDirectory: './test/spec'                  // optional, requirements hierarchy root
        },
    },

    specs: [
        'test/spec/**/*.spec.ts',
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
            excludeSwitches: [ 'enable-automation' ],
            args: [
                '--headless',
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
