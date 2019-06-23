import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter, WithStage } from '@serenity-js/core';
import { Actors } from './Actors';

export = function () {

    this.setDefaultTimeout(5000);

    serenity.setTheStage(
        new ChildProcessReporter(),
        new StreamReporter(),
    );

    this.World = function (this: WithStage) {
        this.stage = serenity.callToStageFor(new Actors());
    };
};
