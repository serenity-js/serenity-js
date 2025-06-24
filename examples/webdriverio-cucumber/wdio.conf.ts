import { WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',
    // framework: 'cucumber',

    serenity: {
        runner: 'cucumber',
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
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

    tsConfigPath: 'tsconfig.json',

    runner: 'local',

    maxInstances: 1,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            excludeSwitches: [ 'enable-automation' ],
            args: [
                'headless',
                'no-sandbox',
                'disable-gpu',
                'window-size=1024x768',
            ],
        }
    }],

    logLevel: 'warn',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
