import { BrowseTheWeb, Open, WebElement } from '../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../src/serenity/screenplay';
import { DemoApp } from './ui/demo_app';

import { protractor } from 'protractor';

import test = require('selenium-webdriver/testing');

import expect = require('../../expect');

test.describe ('Interactions', () => {

    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    test.it ('should allow to check the visibility of a web element', () =>
        james.attemptsTo(
            Open.browserOn('resources/index.html')
        ).then(() =>
            expect(james.toSee(WebElement.of(DemoApp.Header))).displayed));
});
