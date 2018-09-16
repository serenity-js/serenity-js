import { serenity } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { ArtifactArchiver, ConsoleReporter, SerenityBDDReporter, Stage } from '@serenity-js/core/lib/stage';

import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { Actors } from './Actors';

setDefaultTimeout(5000);

// todo: should probably come with @serenity-js/cucumber
interface WithStage {
    stage: Stage;
}

setWorldConstructor(function(this: WithStage, { parameters }) {
    this.stage = serenity.callToStageFor(new Actors());
});

// todo: implement serenity.configure(...)
serenity.stageManager.register(
    new ArtifactArchiver(new FileSystem(new Path('./target/site/serenity'))),
    new SerenityBDDReporter(),
    new ConsoleReporter(),
);
