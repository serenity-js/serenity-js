import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';

import { by, ExecuteScript, Navigate, Target, Text } from '../../../../src';

/** @test {ExecuteScript} */
describe('ExecuteScriptFromUrl', function () {

    this.timeout(10 * 1000);

    class Sandbox {
        static Result = Target.the('sandbox result').located(by.id('result'));
    }

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('allows the actor to execute a script stored at a specific location', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ browser.config.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js`),

            Ensure.that(Text.of(Sandbox.Result), equals('Script loaded successfully')),
        ));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script could not be loaded', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ browser.config.baseUrl }/invalid.js`),
        )).to.be.rejected
            .then(error => {
                expect(error).to.be.instanceOf(LogicError);
                expect(error.message).to.match(new RegExp(`Couldn't load script from ${ browser.config.baseUrl }/invalid.js`))
            })
            .then(() => actorCalled('Joe').attemptsTo(
                // todo: implement "Browser" questions
                // Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('invalid.js - Failed to load resource')))),
            )));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script has already been loaded', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ browser.config.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js`),
            ExecuteScript.from(`${ browser.config.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js`),
        )).to.be.rejectedWith(LogicError, `Script from ${ browser.config.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js has already been loaded`));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(ExecuteScript.from('https://localhost/script.js').toString())
            .to.equal(`#actor executes a script from https://localhost/script.js`);
    });
});
