import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver, configure, Duration, NoOpDiffFormatter } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import * as playwright from 'playwright-core';

import { Actors } from './Actors';

let browser: playwright.Browser;

export const mochaHooks = {
    async beforeAll(): Promise<void> {
        browser = await playwright.chromium.launch({
            headless: true
        });

        configure({
            actors: new Actors(browser, {
                baseURL: `http://localhost:${ process.env.PORT || '8080' }`,
                defaultNavigationTimeout:   Duration.ofSeconds(1).inMilliseconds(),
                defaultTimeout:             Duration.ofMilliseconds(750).inMilliseconds(),
            }),
            diffFormatter: new NoOpDiffFormatter(),
            crew: [
                new TestRunnerTagger('playwright'),
                ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
                // Photographer.whoWill(TakePhotosOfFailures),
                new SerenityBDDReporter(),
                // ConsoleReporter.forDarkTerminals(),
                // new StreamReporter(fs.createWriteStream('./events.ndjson'))
            ]
        });
    },

    async afterAll(): Promise<void> {
        if (browser) {
            await browser.close()
        }
    }
}
