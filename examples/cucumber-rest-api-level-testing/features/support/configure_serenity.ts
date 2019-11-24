import { ConsoleReporter } from '@serenity-js/console-reporter';
import { ArtifactArchiver, serenity, StreamReporter, WithStage } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';

import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { Actors } from './screenplay';

serenity.setTheStage(
    ArtifactArchiver.storingArtifactsAt('./target/site/serenity'),
    new SerenityBDDReporter(),
    ConsoleReporter.forDarkTerminals(),
);

setDefaultTimeout(1000);

setWorldConstructor(function (this: WithStage, { parameters }) {
    this.stage = serenity.callToStageFor(new Actors());
});
