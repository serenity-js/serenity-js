import { ScenarioTagger, serenity } from '@serenity-js/core';
import { TestRunArchiver } from '@serenity-js/html-reporter';

serenity.configure({
    crew: [
        new ScenarioTagger(['@integration/cucumber-3']),
        TestRunArchiver.fromJSON({ outputDirectory: './target/html-report' }),
    ],
});
