import { setDefaultTimeout } from '@cucumber/cucumber';
import { configure } from '@serenity-js/core';

import { Actors } from './screenplay';

configure({
    actors: new Actors(),
    crew: [
        // '@serenity-js/core:StreamReporter',
        [ '@serenity-js/console-reporter', { theme: 'auto' } ],
        [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
        '@serenity-js/serenity-bdd',
        [ '@serenity-js/html-reporter', { outputDirectory: 'reports/serenity', specDirectory: './features' } ],
    ],
});

setDefaultTimeout(1_000);
