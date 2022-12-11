import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver, Duration } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';

import { Actors } from './src/Actors';

const port = process.env.PORT || 8080;

const specs = [
    './node_modules/@integration/web-specs/spec/**/*.spec.ts',
];

const localBrowser: Partial<WebdriverIOConfig> = {
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
                '--ignore-certificate-errors',
                '--headless',
                '--disable-gpu',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
        }
    }],

    // Reduce the number of parallel browsers on GitHub Actions because of the limited resources available
    //  https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources
    maxInstances: process.env.CI
        ? 2
        : 6,
};

const build = process.env.GITHUB_RUN_NUMBER
    ? `@serenity-js/web (GitHub #${ process.env.GITHUB_RUN_NUMBER })`
    : `@serenity-js/web (local ${ new Date().toISOString() })`;

const sauceCapabilities = {
    user:   process.env.SAUCE_USERNAME,
    key:    process.env.SAUCE_ACCESS_KEY,
    'sauce:options': {
        tunnelIdentifier:   process.env.SAUCE_TUNNEL_ID,
        build,
        screenResolution:   '1024x768',
    }
};

const sauceLabsBrowsers: Partial<WebdriverIOConfig> = {
    user:   process.env.SAUCE_USERNAME,
    key:    process.env.SAUCE_ACCESS_KEY,
    services: [
        ['sauce', {
            sauceConnect: false,
        }]
    ],

    capabilities: [{
        browserName:    'chrome',
        browserVersion: 'latest',
        platformName:   'Windows 11',
        unhandledPromptBehavior: 'ignore',  // because we need to test ModalDialog interactions
        ...sauceCapabilities,
    }],

    maxInstances: 10,
};

const browserConfig = process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY
    ? sauceLabsBrowsers
    : localBrowser;

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    baseUrl: `http://localhost:${port}`,

    serenity: {
        actors: new Actors(),
        runner: 'mocha',
        cueTimeout: Duration.ofSeconds(10),
        crew: [
            new TestRunnerTagger('webdriverio'),
            ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
            Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 60_000,
    },

    specs,

    reporters: [
        'spec',
    ],

    runner: 'local',

    waitforTimeout: 10_000,
    connectionRetryTimeout: 90_000,

    capabilities: [],
    ...browserConfig,

    // logLevel: 'debug',
    logLevel: 'error',

    connectionRetryCount: 5,

    autoCompileOpts: {
        autoCompile: false,
        tsNodeOpts: {
            transpileOnly: true,
            project: 'tsconfig.json'
        }
    }
};
