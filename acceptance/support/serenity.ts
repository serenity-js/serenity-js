import { createSerenityListener } from '../../src/serenity/integration/cucumber/cucumber';
import { Hooks } from 'cucumber';

export = function () {
    let hook = <Hooks> this;

    hook.registerListener(createSerenityListener());
};
