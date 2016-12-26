import synced = require('selenium-webdriver/testing');
import expect = require('../expect');

import { by, protractor } from 'protractor';

import { Actor, BrowseTheWeb, Target } from '../../src/screenplay-protractor';
import { Click, DoubleClick, Open, Text } from '../../src/serenity-protractor';

import { AppServer } from '../support/server';

class MouseEvents {
    static Event_Trigger    = Target.the('event-triggering button').located(by.css('#event-tester-{0} button'));
    static Triggered_Result = Target.the('event-triggering button').located(by.css('#event-tester-{0} pre'));
}

synced.describe ('When demonstrating the usage of a Static Website, a test scenario', function () {

    this.timeout(10000);

    let app   = new AppServer();
    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    synced.before(app.start());
    synced.before(() => james.attemptsTo(Open.browserOn(app.demonstrating('mouse_events'))));
    synced.after(app.stop());

    synced.it ('can click the on-screen elements', () =>
        james.attemptsTo(
            Click.on(MouseEvents.Event_Trigger.of('click')),
        ).then(() =>
            expect(james.toSee(Text.of(MouseEvents.Triggered_Result.of('click'))))
                .eventually.equal('click works!')));

    synced.it ('can double-click the on-screen elements', () =>
        james.attemptsTo(
            DoubleClick.on(MouseEvents.Event_Trigger.of('dblclick')),
        ).then(() =>
            expect(james.toSee(Text.of(MouseEvents.Triggered_Result.of('dblclick'))))
                .eventually.equal('dblclick works!')));
});
