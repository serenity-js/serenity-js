'use strict';

const serenity = require('serenity-bdd/lib/serenity-cucumber/adapters');

module.exports = function () {
    serenity.notifierFor(this);
    serenity.webdriverSynchroniserFor(this, browser.controlFlow());
};
