import expect = require('../expect');

import { by, protractor } from 'protractor';

import { Actor, BrowseTheWeb, See, Switch, Target, UseAngular } from '../../src/screenplay-protractor';
import { Click, Open, Text } from '../../src/serenity-protractor';

import { AppServer } from '../support/server';

class Popup {
    static Trigger = Target.the('pop up trigger').located(by.linkText('open a popup'));
    static Text    = Target.the('text of the pop-up').located(by.tagName('body'));
    static Dismiss = Target.the('dismiss popup button').located(by.tagName('input'));
}

describe ('When demonstrating how to work with popup windows, a test scenario', function() {

    this.timeout(10000);

    const app   = new AppServer();
    const james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    before(app.start());
    before(() => james.attemptsTo(Open.browserOn(app.demonstrating('popups'))));
    after(app.stop());

    it ('can switch to a newly opened popup window and back', () =>
        james.attemptsTo(
            Click.on(Popup.Trigger),

            UseAngular.disableSynchronisation(),
            Switch.toPopupWindow(),

            See.if(Text.of(Popup.Text), text => expect(text).to.eventually.equal('Yup, it\'s a pop-up!')),
            Click.on(Popup.Dismiss),

            UseAngular.enableSynchronisation(),
            Switch.toParentWindow(),

            See.if(Text.of(Popup.Trigger), text => expect(text).to.eventually.equal('open a popup')),
        ));

    it ('can switch to a specific window identified by its index', () =>
        james.attemptsTo(
            Click.on(Popup.Trigger),
            Click.on(Popup.Trigger),

            UseAngular.disableSynchronisation(),

            Switch.toWindowNumber(2),
            See.if(Text.of(Popup.Text), text => expect(text).to.eventually.equal('Yup, it\'s a pop-up!')),
            Click.on(Popup.Dismiss),

            Switch.toWindowNumber(1),
            See.if(Text.of(Popup.Text), text => expect(text).to.eventually.equal('Yup, it\'s a pop-up!')),
            Click.on(Popup.Dismiss),

            UseAngular.enableSynchronisation(),
            Switch.toParentWindow(),

            See.if(Text.of(Popup.Trigger), text => expect(text).to.eventually.equal('open a popup')),
        ));

    it ('complains when you try to switch to a popup that does not exist', () =>
        expect(james.attemptsTo(
            Switch.toPopupWindow(),
        )).to.eventually.be.rejectedWith('No popup window was opened'));
});
