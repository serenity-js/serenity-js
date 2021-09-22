import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver } from '@serenity-js/core';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { isCI } from 'ci-info';
import { Actors } from './Actors';

const port = process.env.PORT || 8080;

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
                '--window-size=640x480',
            ],
        }
    }],

    // logLevel: 'debug',
    logLevel: 'error',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,
};
