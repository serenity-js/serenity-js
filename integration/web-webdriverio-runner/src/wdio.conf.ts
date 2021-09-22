import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver } from '@serenity-js/core';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Actors } from './Actors';

const port = process.env.PORT || 8080;

const local: Partial<WebdriverIOConfig> = {
    headless: true,
    automationProtocol: 'devtools',

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--disable-infobars',
                '--headless',
                '--disable-gpu',
                '--disable-gpu',
                '--window-size=800x600',
            ],
        }
    }],
};

const sauceLabs: Partial<WebdriverIOConfig> = {
    user:   process.env.SAUCE_USERNAME,
    key:    process.env.SAUCE_ACCESS_KEY,
    region: 'us', // or 'eu' or 'apac'

    services: [
        ['sauce', {}],
    ],

    capabilities: [{

        browserName: 'chrome',
        'sauce:options': {
            tunnelIdentifier:   process.env.SAUCE_TUNNEL_ID,
            build:              `@serenity-js/web-${ process.env.GITHUB_RUN_NUMBER }`,
            screenResolution:   '800x600',
        },
    }],
};

const browserConfig = process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY
    ? sauceLabs
    : local;

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    baseUrl: `http://localhost:${port}`,

    serenity: {
        actors: new Actors(),
        runner: 'mocha',
        crew: [
            new TestRunnerTagger('webdriverio'),
            ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
            Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    specs: [ ], // specified in tests themselves to avoid loading more than needed

    reporters: [
        'spec',
    ],

    runner: 'local',

    // maxInstances: isCI ? 1 : undefined,

    capabilities: [],
    ...browserConfig,

    // logLevel: 'debug',
    logLevel: 'error',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
