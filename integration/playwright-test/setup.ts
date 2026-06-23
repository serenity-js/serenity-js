import { ScenarioTagger, serenity } from '@serenity-js/core';
import { TestRunArchiver } from '@serenity-js/html-reporter';

serenity.configure({
    crew: [
        new ScenarioTagger(['@playwright/test']),
        TestRunArchiver.fromJSON({ outputDirectory: './target/html-report' }),
    ],
});
