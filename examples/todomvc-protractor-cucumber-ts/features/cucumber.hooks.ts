import * as serenity from 'serenity-bdd/lib/serenity-cucumber';

export = function () {
    serenity.notifierFor(this);
    serenity.webdriverSynchroniserFor(this, browser.controlFlow());
};
