import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver } from '@serenity-js/core';
import { Photographer, TakePhotosOfInteractions } from '@serenity-js/web';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { protractor } from 'protractor';
import { Actors } from './Actors';

const port = process.env.PORT || 8080;

export const config = {

    baseUrl: `http://localhost:${port}`,

    SELENIUM_PROMISE_MANAGER: false,

    onPrepare: function () {
        return protractor.browser.waitForAngularEnabled(false);
    },

    allScriptsTimeout: 120_000,

    framework:      'custom',
    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),

    serenity: {
        actors: new Actors(),
        runner: 'mocha',
        crew: [
            new TestRunnerTagger('protractor'),
            ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
            Photographer.whoWill(TakePhotosOfInteractions),
            // Photographer.whoWill(TakePhotosOfFailures),
            new SerenityBDDReporter(),
        ]
    },

    // specs: [ ],  // set via the command line

    mochaOpts: {
        timeout: 60_000,
        require: [
            'ts-node/register',
        ],
        reporter: 'spec',
    },


    chromeDriver: require(`chromedriver`).path,
    directConnect: true,

    capabilities: {
        browserName: 'chrome',
        acceptInsecureCerts: true,

        loggingPrefs: {
            browser: 'INFO',
        },

        'goog:chromeOptions': {
            // As of version 75, ChromeDriver is W3C by default, which Protractor does not fully support.
            w3c: false,
            args: [
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--allow-file-access',
                '--disable-infobars',
                '--headless',
                '--disable-gpu',
                '--window-size=640x480',
            ],
        },
    },
};
