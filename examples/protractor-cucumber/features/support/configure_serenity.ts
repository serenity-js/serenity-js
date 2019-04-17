import { serenity } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { ArtifactArchiver, ConsoleReporter, DebugReporter, SerenityBDDReporter } from '@serenity-js/core/lib/stage';
import { WithStage } from '@serenity-js/cucumber';

import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { Actors } from './screenplay';

// todo: move to config and make the artifact archiver config more intuitive
serenity.setTheStage(
    new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
    new SerenityBDDReporter(),
    // new DebugReporter(),
    new ConsoleReporter(),
);

setDefaultTimeout(1000);

setWorldConstructor(function(this: WithStage, { parameters }) {
    this.stage = serenity.callToStageFor(new Actors());
});
