import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

import { setDefaultTimeout } from 'cucumber';

setDefaultTimeout(5000);

configure({
    crew: [
        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
        new SerenityBDDReporter(),
        ConsoleReporter.forDarkTerminals(),
    ]
});
