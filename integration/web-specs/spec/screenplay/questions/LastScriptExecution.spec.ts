import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { By, Enter, ExecuteScript, LastScriptExecution, Navigate, PageElement } from '@serenity-js/web';

/** @test {LastScriptExecution} */
describe('LastScriptExecution', function () {

    class Sandbox {
        static Input = PageElement.located(By.id('name')).describedAs('input field');
    }

    describe('when used with ExecuteScript.sync', () => {

        /** @test {ExecuteScript.sync} */
        /** @test {ExecuteSynchronousScript} */
        /** @test {LastScriptExecution} */
        it('allows the actor to retrieve the result of the script execution', () =>
            actorCalled('Joe').attemptsTo(
                Navigate.to('/screenplay/questions/last-script-execution/result.html'),

                Enter.theValue(actorCalled('Joe').name).into(Sandbox.Input),

                ExecuteScript.sync(function(field) {
                    return field.value;
                }).withArguments(Sandbox.Input),

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

                Ensure.that(LastScriptExecution.result<null>(), equals(undefined)), // eslint-disable-line unicorn/no-useless-undefined
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

                Ensure.that(LastScriptExecution.result<null>(), equals(undefined)), // eslint-disable-line unicorn/no-useless-undefined
            ));
    });

    /** @test {ExecuteAsynchronousScript} */
    /** @test {LastScriptExecution} */
    it(`complains if the script hasn't been executed yet`, () =>
        expect(actorCalled('Bob').attemptsTo(
            Navigate.to('/screenplay/questions/last-script-execution/result.html'),

            Ensure.that(LastScriptExecution.result<string>(), equals(actorCalled('Joe').name)),
        )).to.be.rejectedWith(LogicError, 'Make sure to execute a script before checking on the result'));
});
