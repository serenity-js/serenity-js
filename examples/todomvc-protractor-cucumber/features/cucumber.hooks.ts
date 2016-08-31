import { protractor } from 'protractor/globals';
import * as serenity from 'serenity-bdd/lib/serenity-cucumber';

export = function () {
    serenity.notifierFor(this);
    serenity.webdriverSynchroniserFor(this, protractor.browser.driver.controlFlow());
};
