import * as serenity from 'serenity/lib/adapters/cucumber';

export = function () {
    serenity.notifierFor(this);
    serenity.webdriverSynchroniserFor(this, browser.controlFlow());
};
