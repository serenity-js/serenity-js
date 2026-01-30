import 'jasmine';

import path from 'node:path';

import { configure } from '@serenity-js/core';

beforeAll(() => {
    configure({
        crew: [
            // '@serenity-js/core:StreamReporter',
            [ '@serenity-js/console-reporter', { theme: 'auto' } ],
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: path.resolve(__dirname, '../../target/site/serenity') } ],
            '@serenity-js/serenity-bdd',
        ],
    });
});
