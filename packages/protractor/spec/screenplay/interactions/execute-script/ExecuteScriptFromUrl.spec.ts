import 'mocha';

import { expect } from '@integration/testing-tools';
import { containAtLeastOneItemThat, Ensure, equals, includes, property } from '@serenity-js/assertions';
import { actorCalled, engage, LogicError } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import { Browser, ExecuteScript, Navigate, Target, Text } from '../../../../src';
import { UIActors } from '../../../UIActors';

/** @test {ExecuteScript} */
describe('ExecuteScriptFromUrl', function () {

    this.timeout(10 * 1000);

    class Sandbox {
        static Result = Target.the('sandbox result').located(by.id('result'));
    }

    beforeEach(() => engage(new UIActors()));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('allows the actor to execute a script stored at a specific location', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ protractor.browser.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js`),

            Ensure.that(Text.of(Sandbox.Result), equals('Script loaded successfully')),
        ));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script could not be loaded', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ protractor.browser.baseUrl }/invalid.js`),
        )).to.be.rejected
            .then(error => {
                expect(error).to.be.instanceOf(LogicError);
                expect(error.message).to.match(new RegExp(`Couldn't load script from ${ protractor.browser.baseUrl }/invalid.js`))
            })
            .then(() => actorCalled('Joe').attemptsTo(
                Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('invalid.js - Failed to load resource')))),
            )));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script has already been loaded', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ protractor.browser.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js`),
            ExecuteScript.from(`${ protractor.browser.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js`),
        )).to.be.rejectedWith(LogicError, `Script from ${ protractor.browser.baseUrl }/screenplay/interactions/execute-script/execute_script_sample.js has already been loaded`));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(ExecuteScript.from('https://localhost/script.js').toString())
            .to.equal(`#actor executes a script from https://localhost/script.js`);
    });
});
