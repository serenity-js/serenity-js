import { TestRunnerTagger } from '@integration/testing-tools';
import { ArtifactArchiver, configure, Duration, engage, NoOpDiffFormatter } from '@serenity-js/core';
import { TestRunArchiver } from '@serenity-js/html-reporter';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import * as playwright from 'playwright';

import { Actors } from './Actors';

let browser: playwright.Browser;

configure({
    diffFormatter: new NoOpDiffFormatter(),
    crew: [
        new TestRunnerTagger('playwright'),
        ArtifactArchiver.storingArtifactsAt(`${ process.cwd() }/target/site/serenity`),
        // Photographer.whoWill(TakePhotosOfFailures),
        SerenityBDDReporter.fromJSON({
            specDirectory: './node_modules/@integration/web-specs/spec'
        }),
        TestRunArchiver.fromJSON({ outputDirectory: './target/html-report' }),
        // ConsoleReporter.forDarkTerminals(),
        // new StreamReporter(fs.createWriteStream('./events.ndjson'))
    ]
});

export const mochaHooks = {
    async beforeAll(): Promise<void> {
        browser = await playwright.chromium.launch({
            headless: true
        });

        engage(new Actors(
            browser,
            { baseURL: `http://localhost:${process.env.PORT || '8080'}` },
            {
                defaultNavigationTimeout:   Duration.ofSeconds(1).inMilliseconds(),
                defaultTimeout:             Duration.ofMilliseconds(750).inMilliseconds(),
            }
        ));
    },

    async afterAll(): Promise<void> {
        if (browser) {
            await browser.close()
        }
    }
}
