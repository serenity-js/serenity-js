import { protractor } from 'protractor';

import {
    BrowseTheWeb,
    Click,
    DoubleClick,
    Open,
    Text,
} from '../../../src/serenity-protractor/screenplay';
import { Actor } from '../../../src/serenity/screenplay';

import test = require('selenium-webdriver/testing');

import expect = require('../../expect');
import { DemoApp } from './ui/demo_app';

test.describe ('Interactions', () => {

    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    test.beforeEach(() => james.attemptsTo(
        Open.browserOn('resources/index.html')
    ));

    test.it ('should allow to click elements of the UI', () =>
        james.attemptsTo(
            Click.on(DemoApp.Event_Trigger.of('click'))
        ).then(() =>
            expect(james.toSee(Text.of(DemoApp.Event_Trigger.of('click'))))
                .eventually.equal('click works!')));

    test.it ('should allow to double-click elements of the UI', () =>
        james.attemptsTo(
            DoubleClick.on(DemoApp.Event_Trigger.of('dblclick'))
        ).then(() =>
            expect(james.toSee(Text.of(DemoApp.Event_Trigger.of('dblclick'))))
                .eventually.equal('dblclick works!')));
});
