import { configure } from '@serenity-js/core';
import * as path from 'path';

configure({
    crew: [
        // '@serenity-js/core:StreamReporter',
        [ '@serenity-js/console-reporter', { theme: 'auto' } ],
        [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: path.resolve(__dirname, '../../target/site/serenity') } ],
        [ '@serenity-js/serenity-bdd', { specDirectory: path.resolve(__dirname, '../spec') } ],
    ],
});

