import 'jasmine';

import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

// eslint-disable-next-line mocha/no-top-level-hooks
beforeAll(() => {
    configure({
        crew: [
            ArtifactArchiver.storingArtifactsAt(__dirname, '../../target/site/serenity'),
            new SerenityBDDReporter(),
            ConsoleReporter.forDarkTerminals(),
        ],
    });
});
