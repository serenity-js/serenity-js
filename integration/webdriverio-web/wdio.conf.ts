import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver, Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WebdriverIOConfig } from '@serenity-js/webdriverio';
import { cpus } from 'os';

import { Actors } from './src/Actors';

const protocol = process.env.PROTOCOL === 'devtools'
    ? 'devtools'
    : 'webdriver';

const options = {
    specs: [
        './node_modules/@integration/web-specs/spec/**/*.spec.ts',
    ],

    port: process.env.PORT
        ? Number.parseInt(process.env.PORT, 10)
        : 8080,

    protocol,

    workers: workers(process.env),

    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            excludeSwitches: [ 'enable-automation' ],
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--ignore-certificate-errors',
                '--headless',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
        }
    }]
}

const devtoolsProtocol: Partial<WebdriverIOConfig> = {
    headless: true,
    automationProtocol: 'devtools',
};

const webdriverProtocol: Partial<WebdriverIOConfig> = {
    headless: true,
    automationProtocol: 'webdriver',
    outputDir: 'target/logs',
    services: [
        [ 'chromedriver', { } ]
    ],
};

function workers(env: Record<string, string>) {
    if (env.WORKERS) {
        return Number.parseInt(env.WORKERS, 10);
    }

    if (env.CI) {
        // This number seems to be optimal, based on trial and error
        // - https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources
        return 6;
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
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            new TestRunnerTagger('webdriverio'),
            ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
            Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 300_000,
    },

    specs: options.specs,

    reporters: [
        'spec',
    ],

    runner: 'local',

    waitforTimeout: 10_000,
    connectionRetryTimeout: 30_000,

    capabilities: options.capabilities,
    maxInstances: options.workers,
    ...(options.protocol === 'webdriver' ? webdriverProtocol : devtoolsProtocol),

    // logLevel: 'debug',
    logLevel: 'error',

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
            'integration:', options.protocol,
            'protocol:', config.automationProtocol,
            'port:', options.port,
            'browser workers:', options.workers
        );
    },
};
