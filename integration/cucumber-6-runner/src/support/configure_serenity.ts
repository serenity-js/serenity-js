import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter, WithStage } from '@serenity-js/core';
import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { Actors } from './Actors';

setDefaultTimeout(5000);

serenity.setTheStage(
    new ChildProcessReporter(),
    new StreamReporter(),
);

setWorldConstructor(function (this: WithStage) {
    this.stage = serenity.callToStageFor(new Actors());
});
