import {Hooks} from "cucumber";
import {createSerenityListener} from '../../../lib/serenity/integration/cucumber/cucumber';

export = function() {
    let hook = <Hooks>this;

    hook.registerListener(createSerenityListener());
}