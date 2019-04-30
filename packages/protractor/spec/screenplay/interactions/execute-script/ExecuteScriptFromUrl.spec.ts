import { expect, stage } from '@integration/testing-tools';
import { containAtLeastOneItemThat, Ensure, equals, includes, property } from '@serenity-js/assertions';
import { LogicError } from '@serenity-js/core';

import { by } from 'protractor';
import { Browser, ExecuteScript, Navigate, Target, Text } from '../../../../src';
import { UIActors } from '../../../UIActors';

/** @test {ExecuteScriptFromUrl} */
describe('ExecuteScriptFromUrl', function () {

    const Joe = stage(new UIActors()).actor('Joe');

    const
        pathToScript = `file://${ require.resolve('./resources/execute-script-sample.js') }`,
        pathToPage = `file://${ require.resolve('./resources/execute-script-sandbox.html') }`;

    class Sandbox {
        static Result = Target.the('sandbox result').located(by.id('result'));
    }

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('allows the actor to execute a script stored at a specific location', () => Joe.attemptsTo(
        Navigate.to(pathToPage),

        ExecuteScript.from(pathToScript),

        Ensure.that(Text.of(Sandbox.Result), equals('Script loaded successfully')),
    ));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script could not be loaded', () => expect(Joe.attemptsTo(
        Navigate.to(pathToPage),

        ExecuteScript.from(pathToScript + '.invalid'),
    )).to.be.rejectedWith(LogicError, `Couldn't load script from ${ pathToScript }.invalid`)
        .then(() => Joe.attemptsTo(
            Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('execute-script-sample.js.invalid - Failed to load resource')))),
        )));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script has already been loaded', () => expect(Joe.attemptsTo(
        Navigate.to(pathToPage),

        ExecuteScript.from(pathToScript),
        ExecuteScript.from(pathToScript),
    )).to.be.rejectedWith(LogicError, `Script from ${ pathToScript } has already been loaded`));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl#toString} */
    it(`provides a sensible description of the interaction being performed`, () => {
        expect(ExecuteScript.from(pathToScript).toString())
            .to.equal(`#actor executes a script from ${ pathToScript }`);
    });
});
