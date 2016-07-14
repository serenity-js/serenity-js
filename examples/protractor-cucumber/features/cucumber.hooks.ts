import * as serenity from 'serenity/lib/serenity-cucumber';

export = function () {
    serenity.notifierFor(this);
    serenity.webdriverSynchroniserFor(this, browser.controlFlow());
};
