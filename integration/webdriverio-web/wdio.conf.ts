import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver, Duration } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { cpus } from 'os';

import { Actors } from './src/Actors';

const options = {
    specs: [
        './node_modules/@integration/web-specs/spec/**/*.spec.ts',
    ],

    port: process.env.PORT
        ? Number.parseInt(process.env.PORT, 10)
        : 8080,

    integration: process.env.INTEGRATION === 'puppeteer'
        ? 'puppeteer'
        : 'selenium-standalone',

    workers: workers(process.env),

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
                '--window-size=1024x768',
            ],
        }
    }]
}

const puppeteerBrowser: Partial<WebdriverIOConfig> = {
    headless: true,
    automationProtocol: 'devtools',
};

const seleniumStandaloneBrowser: Partial<WebdriverIOConfig> = {
    automationProtocol: 'webdriver',
    services: [
        ['selenium-standalone', {
            logPath: './logs',
            drivers:
                options.capabilities.reduce((drivers, capability) => {
                    drivers[capability.browserName] = true;
                    return drivers;
                }, {})
        }]
    ],
};

function workers(env: Record<string, string>) {
    if (env.WORKERS) {
        return Number.parseInt(env.WORKERS, 10);
    }

    if (env.CI) {
        // This number seems to be optimal, based on trial and error
        // - https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources
        return env.INTEGRATION === 'selenium-standalone'
            ? 2
            : 6;
    }

    return cpus().length - 1;
}

export const config: WebdriverIOConfig = {

    framework: '@serenity-js/webdriverio',

    baseUrl: `http://localhost:${ options.port }`,

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

    specs: options.specs,

    reporters: [
        'spec',
    ],

    runner: 'local',

    waitforTimeout: 10_000,
    connectionRetryTimeout: 90_000,

    capabilities: options.capabilities,
    maxInstances: options.workers,
    ...(options.integration === 'selenium-standalone' ? seleniumStandaloneBrowser : puppeteerBrowser),

    logLevel: 'debug',
    // logLevel: 'error',

    connectionRetryCount: 5,

    autoCompileOpts: {
        autoCompile: false,
        tsNodeOpts: {
            transpileOnly: true,
            project: 'tsconfig.json'
        }
    },

    onPrepare: function (config) {
        console.log(
            '[configuration]',
            'integration:', options.integration,
            'protocol:', config.automationProtocol,
            'port:', options.port,
            'browser workers:', options.workers
        );
    },
};
