import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity } from '@serenity-js/core';
import { DebugReporter } from '@serenity-js/core/lib/stage';
import { WithStage } from '@serenity-js/cucumber';
import { Actors } from './Actors';

export = function () {

    this.setDefaultTimeout(5000);

    serenity.setTheStage(
        new ChildProcessReporter(),
        new DebugReporter(),
    );

    this.World = function (this: WithStage) {
        this.stage = serenity.callToStageFor(new Actors());
    };
};
