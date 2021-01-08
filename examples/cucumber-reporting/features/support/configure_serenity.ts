import { setDefaultTimeout } from '@cucumber/cucumber';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, configure, StreamReporter } from '@serenity-js/core';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import * as fs from 'fs';

setDefaultTimeout(5000);

configure({
    crew: [
        ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
        new SerenityBDDReporter(),
        ConsoleReporter.forDarkTerminals(),
    ]
});
