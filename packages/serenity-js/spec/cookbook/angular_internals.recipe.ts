import { by, protractor } from 'protractor';

import expect = require('../expect');
import { Actor, BrowseTheWeb, Evaluate, Execute, Open, Target, Text, Value } from '../../src/screenplay-protractor';
import { AppServer } from '../support/server';

class Username {
    static Field  = Target.the('username field').located(by.css('[name="text-input"] label[for="text"] input'));
    static Result = Target.the('username value').located(by.css('[name="text-input"] label[for="text"] pre'));
}

class Newsletter {
    static Checkbox = Target.the('newsletter checkbox').located(by.css('label[for="checkbox"] input'));
    static Result   = Target.the('newsletter result').located(by.css('label[for="checkbox"] pre'));
}

describe ('When working with an Angular app, a test scenario can execute', function() {

    this.timeout(10000);

    const app   = new AppServer();
    const james = Actor.named('James').whoCan(BrowseTheWeb.using(protractor.browser));

    before(app.start());
    before(() => james.attemptsTo(Open.browserOn(app.demonstrating('angular_internals'))));
    after(app.stop());

    describe('a script that', () => {

        it ('runs within its context', () =>
            james.attemptsTo(
                Execute.script('arguments[0].click();').on(Newsletter.Checkbox),
            ).then(() => Promise.all([
                expect(james.toSee(Value.of(Newsletter.Checkbox))).eventually.equal('on'),
            ])));

        it ('can be called with arguments', () =>
            james.attemptsTo(
                Execute.script('angular.element(arguments[0]).val(arguments[1]).triggerHandler("input");').withArguments(Username.Field, 'Jimmy'),
            ).then(() => Promise.all([
                expect(james.toSee(Text.of(Username.Result))).eventually.equal('Jimmy'),
            ])));
    });

    describe('a function that', () => {

        it ('runs within its context', () =>
            james.attemptsTo(
                Execute.fn(function() { arguments[0].click(); }).on(Newsletter.Checkbox),
            ).then(() => Promise.all([
                expect(james.toSee(Value.of(Newsletter.Checkbox))).eventually.equal('on'),
            ])));
    });

    describe('an asynchronous script that', () => {

        it ('runs within its context', () =>
            james.attemptsTo(
                Execute.asyncScript(
                    'var callback = arguments[arguments.length - 1];',
                    'arguments[0].click();',
                    'callback();',
                ).on(Newsletter.Checkbox),
            ).then(() => Promise.all([
                expect(james.toSee(Value.of(Newsletter.Checkbox))).eventually.equal('on'),
            ])));

        it ('can be called with arguments', () =>
            james.attemptsTo(
                Execute.asyncScript(
                    'var callback = arguments[arguments.length - 1];',
                    'angular.element(arguments[0]).val(arguments[1]).triggerHandler("input");',
                    'callback();',
                ).on(Username.Field).withArguments('James'),
            ).then(() => Promise.all([
                expect(james.toSee(Text.of(Username.Result))).eventually.equal('James'),
            ])));
    });

    describe('an asynchronous function that', () => {

        it ('runs within its context', () =>
            james.attemptsTo(
                Execute.asyncFn(function(element, callback) {
                    element.click();
                    callback();
                }).on(Newsletter.Checkbox),
            ).then(() => Promise.all([
                expect(james.toSee(Value.of(Newsletter.Checkbox))).eventually.equal('on'),
            ])));
    });
});
