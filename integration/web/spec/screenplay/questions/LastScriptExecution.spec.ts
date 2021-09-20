import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, or } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { by, Enter, ExecuteScript, LastScriptExecution, Navigate, Target } from '@serenity-js/web';

/** @test {LastScriptExecution} */
describe('LastScriptExecution', function () {

    class Sandbox {
        static Input = Target.the('input field').located(by.id('name'));
    }

    describe('when used with ExecuteScript.sync', () => {

        /** @test {ExecuteScript.sync} */
        /** @test {ExecuteSynchronousScript} */
        /** @test {LastScriptExecution} */
        it('allows the actor to retrieve the result of the script execution', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/questions/last-script-execution/result.html'),

                Enter.theValue(actorCalled('Joe').name).into(Sandbox.Input),

                ExecuteScript.sync(`function() {
                    var field = arguments[0];
                    return field.value;
                }`).withArguments(Sandbox.Input),

                Ensure.that(LastScriptExecution.result<string>(), equals(actorCalled('Joe').name)),
            ));

        /** @test {ExecuteScript.sync} */
        /** @test {ExecuteSynchronousScript} */
        /** @test {LastScriptExecution} */
        it('returns undefined or null if the script did not return any result', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/questions/last-script-execution/result.html'),

                ExecuteScript.sync(`
                    /* do nothing */
                `),

                // Selenium returns `null`, WebdriverIO returns an `undefined`
                Ensure.that(LastScriptExecution.result<null>(), or(equals(undefined), equals(null))),  // eslint-disable-line unicorn/no-null
            ));
    });

    describe('when used with ExecuteScript.async', () => {

        /** @test {ExecuteScript.async} */
        /** @test {ExecuteAsynchronousScript} */
        /** @test {LastScriptExecution} */
        it('allows the actor to retrieve the result of the script execution', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/questions/last-script-execution/result.html'),

                Enter.theValue(actorCalled('Joe').name).into(Sandbox.Input),

                ExecuteScript.async(`
                    var field = arguments[0];
                    var callback = arguments[arguments.length - 1];
                    callback(field.value);
                `).withArguments(Sandbox.Input),

                Ensure.that(LastScriptExecution.result<string>(), equals(actorCalled('Joe').name)),
            ));

        /** @test {ExecuteScript.async} */
        /** @test {ExecuteAsynchronousScript} */
        /** @test {LastScriptExecution} */
        it('returns undefined or null if the script did not return any result', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/questions/last-script-execution/result.html'),

                ExecuteScript.async(`
                    var callback = arguments[arguments.length - 1];
                    callback();
                `),

                // Selenium returns `null`, WebdriverIO returns an `undefined`
                Ensure.that(LastScriptExecution.result<null>(), or(equals(undefined), equals(null))),  // eslint-disable-line unicorn/no-null
            ));
    });

    /** @test {ExecuteAsynchronousScript} */
    /** @test {LastScriptExecution} */
    it(`complains if the script hasn't been executed yet`, () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/questions/last-script-execution/result.html'),

            Ensure.that(LastScriptExecution.result<string>(), equals(actorCalled('Joe').name)),
        )).to.be.rejectedWith(LogicError, 'Make sure to execute a script before checking on the result'));
});
