import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity } from '@serenity-js/core';
import { DebugReporter } from '@serenity-js/core/lib/stage';
import { WithStage } from '@serenity-js/cucumber';
import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { Actors } from './Actors';

setDefaultTimeout(5000);

serenity.setTheStage(
    new ChildProcessReporter(),
    new DebugReporter(),
);

setWorldConstructor(function (this: WithStage) {
    this.stage = serenity.callToStageFor(new Actors());
});
