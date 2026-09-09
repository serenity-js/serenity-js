import { DotReporter } from '@integration/testing-tools';
import { ScenarioTagger, serenity } from '@serenity-js/core';
import { TestRunArchiver } from '@serenity-js/html-reporter';

serenity.configure({
    crew: [
        new DotReporter(),
        new ScenarioTagger(['@integration/webdriverio-8-jasmine']),
        TestRunArchiver.fromJSON({ outputDirectory: './target/html-report' }),
    ],
});
