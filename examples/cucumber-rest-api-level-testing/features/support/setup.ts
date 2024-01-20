import { setDefaultTimeout } from '@cucumber/cucumber';
import { configure } from '@serenity-js/core';
import path from 'path';

import { Actors } from './screenplay';

configure({
    actors: new Actors(),
    crew: [
        '@serenity-js/core:StreamReporter',
        [ '@serenity-js/console-reporter', { theme: 'dark' } ],
        [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: path.resolve(__dirname, '../../target/site/serenity') } ],
        [ '@serenity-js/serenity-bdd', { specDirectory: path.resolve(__dirname, '../../features') } ],
    ],
});

setDefaultTimeout(1000);
