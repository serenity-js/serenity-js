import { WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',
    // framework: 'jasmine',

    serenity: {
        runner: 'jasmine',
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
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

    logLevel: 'debug',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
