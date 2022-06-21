import { TestRunnerTagger } from '@integration/testing-tools';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Browser, chromium } from 'playwright';

import { Actors } from './Actors';

let browser: Browser;

export const mochaHooks = {
    async beforeAll(): Promise<void> {
        browser = await chromium.launch({
            headless: true
        });

        configure({
            actors: new Actors(browser, `http://localhost:${ process.env.PORT || '8080' }`),
            crew: [
                new TestRunnerTagger('playwright'),
                ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
                // Photographer.whoWill(TakePhotosOfFailures),
                new SerenityBDDReporter(),
                ConsoleReporter.forDarkTerminals(),
                // new StreamReporter(fs.createWriteStream('./events.ndjson'))
            ]
        })
    },

    async afterAll(): Promise<void> {
        if (browser) {
            return browser.close()
        }
    }
}
