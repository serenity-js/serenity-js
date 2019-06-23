import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter, WithStage } from '@serenity-js/core';
import { defineSupportCode } from 'cucumber';
import { Actors } from './Actors';

defineSupportCode(({ setDefaultTimeout, setWorldConstructor }) => {
    setDefaultTimeout(5000);

    serenity.setTheStage(
        new ChildProcessReporter(),
        new StreamReporter(),
    );

    setWorldConstructor(function (this: WithStage) {
        this.stage = serenity.callToStageFor(new Actors());
    });
});
