import { ChildProcessReporter } from '@integration/testing-tools';
import { DebugReporter, serenity, WithStage } from '@serenity-js/core';
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
