import synced = require('selenium-webdriver/testing');
import expect = require('../expect');

import { by, protractor } from 'protractor';

import { Actor, BrowseTheWeb, Click, Duration, Is, Open, Target, Wait, WebElement } from '../../src/screenplay-protractor';

import { AppServer } from '../support/server';

export class AngularTimeout {
    static Button                 = Target.the('NG $timeout trigger').located(by.css('#timeouts #angular button'));
    static Result = Target.the('NG $timeout result').located(by.css('#timeouts #angular pre'));
}

export class JavaScriptTimeout {
    static Button = Target.the('JS timeout trigger').located(by.css('#timeouts #setTimeout button'));
    static Result = Target.the('JS timeout result').located(by.css('#timeouts #setTimeout pre'));
}

synced.describe ('When waiting for things to happen, a test scenario', function () {

    this.timeout(10000);

    const Not_Long_Enough = Duration.ofMillis(200),
          Long_Enough     = Duration.ofMillis(1500);

    let app   = new AppServer();
    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    synced.before(app.start());
    synced.after(app.stop());

    synced.beforeEach(() =>
        james.attemptsTo(
            Open.browserOn(app.demonstrating('waiting')),
        ).then(() => Promise.all([
            expect(james.toSee(WebElement.of(AngularTimeout.Result))).not.displayed,
            expect(james.toSee(WebElement.of(JavaScriptTimeout.Result))).not.displayed,
        ])));

    synced.describe('using Passive Wait', () => {

        synced.it ('will fail if the timeout is too short', () =>
            james.attemptsTo(
                Click.on(AngularTimeout.Button),
                Wait.for(Not_Long_Enough),
            ).then(() => expect(james.toSee(WebElement.of(AngularTimeout.Result))).not.displayed));

        synced.it ('will pass if the timeout is long enough', () =>
            james.attemptsTo(
                Click.on(AngularTimeout.Button),
                Wait.for(Long_Enough),
            ).then(() => expect(james.toSee(WebElement.of(AngularTimeout.Result))).displayed));
    });

    synced.describe('using Active Wait', () => {

        synced.describe('with Angular apps', () => {
            synced.describe('to determine if an element is visible', () => {

                synced.it('will fail if the condition is not met within the timeout (timeout not triggered)', () =>
                    expect(james.attemptsTo(
                        Wait.until(AngularTimeout.Result, Is.visible()),
                    )).to.be.rejectedWith('"the NG $timeout result" did not become visible'));

                synced.it('will fail if the condition is not met within the timeout (timeout triggered)', () =>
                    expect(james.attemptsTo(
                        Click.on(AngularTimeout.Button),
                        Wait.upTo(Not_Long_Enough).until(AngularTimeout.Result, Is.visible()),
                    )).to.be.rejectedWith('"the NG $timeout result" did not become visible'));

                synced.it('will pass if the condition is met within the timeout', () =>
                    expect(james.attemptsTo(
                        Click.on(AngularTimeout.Button),
                        Wait.upTo(Long_Enough).until(AngularTimeout.Result, Is.visible()),
                    )).to.be.fulfilled.then(() => Promise.all([
                        expect(james.toSee(WebElement.of(AngularTimeout.Result))).displayed,
                        expect(james.toSee(WebElement.of(AngularTimeout.Result))).present,
                    ])));
            });

            synced.describe('to determine if an element is invisible', () => {

                synced.it('will pass if the element is already invisible', () =>
                    james.attemptsTo(
                        Wait.until(AngularTimeout.Result, Is.invisible()),
                    ).then(() => expect(james.toSee(WebElement.of(AngularTimeout.Result))).not.displayed));
            });
        });

        synced.describe('with non-Angular apps', () => {
            synced.describe('to determine if an element is visible', () => {

                synced.it('will fail if the condition is not met within the timeout (timeout not triggered)', () =>
                    expect(james.attemptsTo(
                        Wait.until(JavaScriptTimeout.Result, Is.visible()),
                    )).to.be.rejectedWith('"the JS timeout result" did not become visible'));

                synced.it('will fail if the condition is not met within the timeout (timeout triggered)', () =>
                    expect(james.attemptsTo(
                        Click.on(JavaScriptTimeout.Result),
                        Wait.upTo(Not_Long_Enough).until(JavaScriptTimeout.Result, Is.visible()),
                    )).to.be.rejectedWith('"the JS timeout result" did not become visible'));

                synced.it('will pass if the condition is met within the timeout', () =>
                    expect(james.attemptsTo(
                        Click.on(JavaScriptTimeout.Button),
                        Wait.upTo(Long_Enough).until(JavaScriptTimeout.Result, Is.visible()),
                    )).to.be.fulfilled.then(() => Promise.all([
                        expect(james.toSee(WebElement.of(JavaScriptTimeout.Result))).displayed,
                        expect(james.toSee(WebElement.of(JavaScriptTimeout.Result))).present,
                    ])));
            });

            synced.describe('to determine if an element is invisible', () => {

                synced.it('will pass if the element is already invisible', () =>
                    james.attemptsTo(
                        Wait.until(JavaScriptTimeout.Result, Is.invisible()),
                    ).then(() => expect(james.toSee(WebElement.of(JavaScriptTimeout.Result))).not.displayed));
            });
        });
    });
});
