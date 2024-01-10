import { setDefaultTimeout } from '@cucumber/cucumber';
import { configure } from '@serenity-js/core';

import { Actors } from './screenplay';

configure({
    actors: new Actors(),
    crew: [
        '@serenity-js/core:StreamReporter',
        [ '@serenity-js/console-reporter', { theme: 'dark' } ],
        [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
        [ '@serenity-js/serenity-bdd', { specDirectory: 'features' } ],
    ],
});

setDefaultTimeout(1000);
