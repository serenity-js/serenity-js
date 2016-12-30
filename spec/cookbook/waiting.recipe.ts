import synced = require('selenium-webdriver/testing');
import expect = require('../expect');

import { by, protractor } from 'protractor';

import {
    Actor,
    BrowseTheWeb,
    Clear,
    Click,
    Duration,
    Enter,
    Is,
    Open,
    PerformsTasks,
    Select,
    Target,
    Task,
    Wait,
    WebElement,
} from '../../src/screenplay-protractor';

import { AppServer } from '../support/server';

export class Playground {
    static Examples       = Target.the('example type').located(by.id('example_type'));
    static Timeout_Type        = Target.the('timeout function type').located(by.id('timeout_type'));
    static Timeout_Length      = Target.the('timeout length').located(by.id('timeout_length'));
    static Trigger = Target.the('trigger button').located(by.css('#timeouts button'));
    static Result  = Target.the('result').located(by.css('#timeouts #example .result'));
}

class ChooseAnExample implements Task {
    private timeout_length = Duration.ofMillis(500);
    private timeout_type   = '$timeout' ;

    static whereElementBecomes = (example: string) => new ChooseAnExample(example);

    using = (timeout_type: string) => {
        this.timeout_type = timeout_type;

        return this;
    }

    after = (length: Duration) => {
        this.timeout_length = length;

        return this;
    }

    performAs = (actor: PerformsTasks) => actor.attemptsTo(
        Select.theValue(this.example).from(Playground.Examples),
        Select.theValue(this.timeout_type).from(Playground.Timeout_Type),
        Clear.theValueOf(Playground.Timeout_Length),
        Enter.theValue(this.timeout_length.toMillis()).into(Playground.Timeout_Length),
        Click.on(Playground.Trigger),
    );

    constructor(private example: string) {
    }
}

synced.describe ('When waiting for things to happen, a test scenario', function () {

    this.timeout(10000);

    const Trigger_Delay   = Duration.ofMillis(500),
          Not_Long_Enough = Duration.ofMillis(100),
          Long_Enough     = Duration.ofMillis(1000);

    let app   = new AppServer();
    let james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    synced.before(app.start());
    synced.after(app.stop());

    synced.beforeEach(() =>

        james.attemptsTo(
            Open.browserOn(app.demonstrating('waiting')),
        ).

        then(() => expect(james.toSee(WebElement.of(Playground.Result))).not.displayed));

    [
        'setTimeout',
        '$timeout',
        '$interval',
    ].forEach(timeoutFunction => {

        synced.describe(`using Passive Wait (${ timeoutFunction })`, () => {

            synced.it ('will fail if the timeout is too short', () =>

                james.attemptsTo(
                    ChooseAnExample.whereElementBecomes('Visible').after(Trigger_Delay).using(timeoutFunction),
                    Wait.for(Not_Long_Enough),
                ).

                then(() => expect(james.toSee(WebElement.of(Playground.Result))).not.displayed));

            synced.it ('will pass if the timeout is long enough', () =>

                james.attemptsTo(
                    ChooseAnExample.whereElementBecomes('Visible').after(Trigger_Delay).using(timeoutFunction),
                    Wait.for(Long_Enough),
                ).

                then(() => expect(james.toSee(WebElement.of(Playground.Result))).displayed));
        });

        synced.describe(`using Active Wait (${ timeoutFunction })`, () => {

            synced.it('can rely on a default timeout provided by Wait.until(..) to be sensibly long enough', () =>

                expect(james.attemptsTo(
                    ChooseAnExample.whereElementBecomes('Visible').after(Trigger_Delay).using(timeoutFunction),
                    Wait.until(Playground.Result, Is.visible()),
                )).to.be.fulfilled);

            synced.describe('to determine if an element is visible', () => {

                synced.it('will fail if the condition is not met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Visible').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Not_Long_Enough).until(Playground.Result, Is.visible()),
                    )).to.be.rejectedWith('The result did not become visible'));

                synced.it('will pass if the condition is met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Visible').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Long_Enough).until(Playground.Result, Is.visible()),
                    )).to.be.fulfilled.

                    then(() => Promise.all([
                        expect(james.toSee(WebElement.of(Playground.Result))).displayed,
                        expect(james.toSee(WebElement.of(Playground.Result))).present,
                    ])));
            });

            synced.describe('to determine if an element is invisible', () => {

                synced.it('will fail if the condition is not met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Invisible').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Not_Long_Enough).until(Playground.Result, Is.invisible()),
                    )).to.be.rejectedWith('The result did not become invisible'));

                synced.it('will pass if the condition is met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Invisible').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Long_Enough).until(Playground.Result, Is.invisible()),
                    )).to.be.fulfilled.

                    then(() => Promise.all([
                        expect(james.toSee(WebElement.of(Playground.Result))).not.displayed,
                        expect(james.toSee(WebElement.of(Playground.Result))).present,
                    ])));
            });

            synced.describe('to determine if an element is present', () => {

                synced.it('will fail if the condition is not met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Present').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Not_Long_Enough).until(Playground.Result, Is.present()),
                    )).to.be.rejectedWith('The result did not become invisible'));

                synced.it('will pass if the condition is met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Present').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Long_Enough).until(Playground.Result, Is.present()),
                    )).to.be.fulfilled.

                    then(() => Promise.all([
                        expect(james.toSee(WebElement.of(Playground.Result))).displayed,
                        expect(james.toSee(WebElement.of(Playground.Result))).present,
                    ])));
            });

            synced.describe('to determine if an element is not present in the DOM', () => {

                synced.it('will fail if the condition is not met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Absent').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Not_Long_Enough).until(Playground.Result, Is.absent()),
                    )).to.be.rejectedWith('The result did not become absent'));

                synced.it('will pass if the condition is met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Absent').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Long_Enough).until(Playground.Result, Is.absent()),
                    )).to.be.fulfilled.

                    then(() => Promise.all([
                        expect(james.toSee(WebElement.of(Playground.Result))).not.present,
                    ])));
            });

            synced.describe('to determine if an element is selected', () => {

                synced.it('will fail if the condition is not met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Selected').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Not_Long_Enough).until(Playground.Result, Is.selected()),
                    )).to.be.rejectedWith('The result did not become selected'));

                synced.it('will pass if the condition is met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Selected').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Long_Enough).until(Playground.Result, Is.selected()),
                    )).to.be.fulfilled.

                    then(() => Promise.all([
                        expect(james.toSee(WebElement.of(Playground.Result))).present,
                        expect(james.toSee(WebElement.of(Playground.Result))).displayed,
                        expect(james.toSee(WebElement.of(Playground.Result))).selected,
                    ])));
            });

            synced.describe('to determine if an element is clickable', () => {

                synced.it('will fail if the condition is not met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Clickable').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Not_Long_Enough).until(Playground.Result, Is.clickable()),
                    )).to.be.rejectedWith('The result did not become clickable'));

                synced.it('will pass if the condition is met within the timeout', () =>

                    expect(james.attemptsTo(
                        ChooseAnExample.whereElementBecomes('Clickable').after(Trigger_Delay).using(timeoutFunction),
                        Wait.upTo(Long_Enough).until(Playground.Result, Is.clickable()),
                    )).to.be.fulfilled.

                    then(() => Promise.all([
                        expect(james.toSee(WebElement.of(Playground.Result))).present,
                        expect(james.toSee(WebElement.of(Playground.Result))).displayed,
                    ])));
            });
        });
    });
});
