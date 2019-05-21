import { ArtifactArchiver, ConsoleReporter, serenity, SerenityBDDReporter, WithStage } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';

import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { Actors } from './screenplay';

serenity.setTheStage(
    new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
    new SerenityBDDReporter(),
    new ConsoleReporter(),
);

setDefaultTimeout(1000);

setWorldConstructor(function (this: WithStage, { parameters }) {
    this.stage = serenity.callToStageFor(new Actors());
});
