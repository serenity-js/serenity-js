import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver, Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { WithSerenityConfig } from '@serenity-js/webdriverio';
import { cpus } from 'os';

const port = process.env.PORT
    ? Number.parseInt(process.env.PORT, 10)
    : 8080;

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

export const config: WebdriverIO.Config & WithSerenityConfig = {

    framework: '@serenity-js/webdriverio',

    baseUrl: `http://localhost:${ port }`,

    serenity: {
        runner: 'mocha',
        cueTimeout: Duration.ofSeconds(10),
        diffFormatter: new NoOpDiffFormatter(),
        crew: [
            new TestRunnerTagger('webdriverio'),
            ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
            Photographer.whoWill(TakePhotosOfFailures),
            SerenityBDDReporter.fromJSON({
                specDirectory: '.'
            }),
        ]
    },

    mochaOpts: {
        ui: 'bdd',
        timeout: 300_000,
    },

    specs: [
        './node_modules/@integration/web-specs/spec/**/*.spec.ts',
        './spec/**/*.spec.ts',
    ],

    reporters: [
        'spec',
    ],

    runner: 'local',

    waitforTimeout: 10_000,
    connectionRetryTimeout: 30_000,

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
                '--no-sandbox',
                '--disable-gpu',
                '--disable-popup-blocking',
                '--window-size=1024x768',
            ],
        }
    }],

    maxInstances: workers(process.env),

    // outputDir: 'target/logs',
    services: [
        [ 'chromedriver', {
            chromedriverCustomPath: require(`chromedriver`).path,   // eslint-disable-line @typescript-eslint/no-var-requires
        } ]
    ],

    logLevel: 'debug',
    // logLevel: 'error',

    connectionRetryCount: 5,

    tsConfigPath: 'tsconfig.json',

    onPrepare: function (config) {
        console.log(
            '[configuration]',
            'integration:', 'webdriver',
            'protocol:', 'webdriver',
            'port:', port,
            'browser workers:', config.maxInstances
        );
    },
};
