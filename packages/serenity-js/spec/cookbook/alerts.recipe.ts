import expect = require('../expect');

import { by, protractor } from 'protractor';

import {
    Actor,
    BrowseTheWeb,
    Clear,
    Click,
    Open,
    See,
    Target,
    Text,
    UseAngular,
    WebElement,
} from '../../src/screenplay-protractor';

import { Alert } from '../../src/serenity-protractor/screenplay/interactions/alert';
import { WaitForAlert } from '../../src/serenity-protractor/screenplay/interactions/waitForAlert';
import { AppServer } from '../support/server';

class AlertTargets {
    static Trigger = Target.the('alert trigger').located(by.id('alert-demo-trigger'));
    static TextResult = Target.the('text of the alert clicking result').located(by.id('alert-demo-result'));
}

describe('When demonstrating how to work with alert windows, a test scenario', function() {

    this.timeout(10000);

    const app = new AppServer();
    const nick = Actor.named('Nick').whoCan(BrowseTheWeb.using(protractor.browser));

    before(app.start());
    after(app.stop());

    describe('running in a real browser', () => {

        beforeEach(() =>
            nick.attemptsTo(
                UseAngular.disableSynchronisation(),
                Open.browserOn(app.demonstrating('alerts')),
            ).then(() => expect(nick.toSee(WebElement.of(AlertTargets.Trigger))).displayed));

        it('can click the OK action of a triggered alert and see the alert accepted', () =>
            nick.attemptsTo(
                Click.on(AlertTargets.Trigger),
                WaitForAlert.toBePresent(),
                Alert.accept(),
                See.if(Text.of(AlertTargets.TextResult), text => expect(text).to.eventually.equal('You pressed OK!')),
            ));

        it('can click the cancel action of a triggered alert and see the alert dismissed', () =>
            nick.attemptsTo(
                Click.on(AlertTargets.Trigger),
                WaitForAlert.toBePresent(),
                Alert.dismiss(),
                See.if(Text.of(AlertTargets.TextResult), text => expect(text).to.eventually.equal('You pressed Cancel!')),
            ));
    });
});
