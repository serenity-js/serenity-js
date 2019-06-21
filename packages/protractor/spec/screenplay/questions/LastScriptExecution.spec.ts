import { expect, stage } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { LogicError } from '@serenity-js/core';
import { by } from 'protractor';
import { Enter, ExecuteScript, LastScriptExecution, Navigate, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

/** @test {LastScriptExecution} */
describe('LastScriptExecution', function () {

    const Joe = stage(new UIActors()).actor('Joe');

    const page = pageFromTemplate(`
        <html>
            <body>
                <form>
                    <input type="text" id="name" />
                </form>
            </body>
        </html>
    `);

    class Sandbox {
        static Input = Target.the('input field').located(by.id('name'));
    }

    describe('when used with ExecuteScript.sync', () => {

        /** @test {ExecuteScript.sync} */
        /** @test {ExecuteSynchronousScript} */
        /** @test {LastScriptExecution} */
        it('allows the actor to retrieve the result of the script execution', () => Joe.attemptsTo(
            Navigate.to(page),

            Enter.theValue(Joe.name).into(Sandbox.Input),

            ExecuteScript.sync(`
                var field = arguments[0];
                return field.value;
            `).withArguments(Sandbox.Input),

            Ensure.that(LastScriptExecution.result<string>(), equals(Joe.name)),
        ));

        /** @test {ExecuteScript.sync} */
        /** @test {ExecuteSynchronousScript} */
        /** @test {LastScriptExecution} */
        it('returns null if the script did not return any result', () => Joe.attemptsTo(
            Navigate.to(page),

            ExecuteScript.sync(`
                /* do nothing */
            `),

            Ensure.that(LastScriptExecution.result<null>(), equals(null)),
        ));
    });

    describe('when used with ExecuteScript.async', () => {

        /** @test {ExecuteScript.async} */
        /** @test {ExecuteAsynchronousScript} */
        /** @test {LastScriptExecution} */
        it('allows the actor to retrieve the result of the script execution', () => Joe.attemptsTo(
            Navigate.to(page),

            Enter.theValue(Joe.name).into(Sandbox.Input),

            ExecuteScript.async(`
                var field = arguments[0];
                var callback = arguments[arguments.length - 1];
                callback(field.value);
            `).withArguments(Sandbox.Input),

            Ensure.that(LastScriptExecution.result<string>(), equals(Joe.name)),
        ));

        /** @test {ExecuteScript.async} */
        /** @test {ExecuteAsynchronousScript} */
        /** @test {LastScriptExecution} */
        it('returns null if the script did not return any result', () => Joe.attemptsTo(
            Navigate.to(page),

            ExecuteScript.async(`
                var callback = arguments[arguments.length - 1];
                callback();
            `),

            Ensure.that(LastScriptExecution.result<null>(), equals(null)),
        ));
    });

    /** @test {ExecuteAsynchronousScript} */
    /** @test {LastScriptExecution} */
    it('complains if the script hasn\'t been executed yet', () => expect(Joe.attemptsTo(
        Navigate.to(page),

        Ensure.that(LastScriptExecution.result<string>(), equals(Joe.name)),
    )).to.be.rejectedWith(LogicError, 'Make sure to execute a script before checking on the result'));
});
