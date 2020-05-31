import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, configure } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

configure({
    crew: [
        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
        new SerenityBDDReporter(),
        ConsoleReporter.forDarkTerminals(),
    ],
});

