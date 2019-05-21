import { ChildProcessReporter } from '@integration/testing-tools';
import { DebugReporter, serenity, WithStage } from '@serenity-js/core';
import { defineSupportCode } from 'cucumber';
import { Actors } from './Actors';

defineSupportCode(({ setDefaultTimeout, setWorldConstructor }) => {
    setDefaultTimeout(5000);

    serenity.setTheStage(
        new ChildProcessReporter(),
        new DebugReporter(),
    );

    setWorldConstructor(function (this: WithStage) {
        this.stage = serenity.callToStageFor(new Actors());
    });
});
