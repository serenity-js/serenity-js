import { DotReporter } from '@integration/testing-tools';
import { ScenarioTagger, serenity } from '@serenity-js/core';
import { TestRunArchiver } from '@serenity-js/html-reporter';

serenity.configure({
    crew: [
        new DotReporter(),
        new ScenarioTagger(['@integration/jasmine-5']),
        TestRunArchiver.fromJSON({ outputDirectory: './target/html-report' }),
    ],
});
