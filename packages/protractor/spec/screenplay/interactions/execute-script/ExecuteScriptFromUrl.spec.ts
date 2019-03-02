import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, LogicError } from '@serenity-js/core';

import { by, protractor } from 'protractor';
import { BrowseTheWeb, ExecuteScript, Navigate, Target, Text } from '../../../../src';

/** @test {ExecuteScriptFromUrl} */
describe('ExecuteScriptFromUrl', function() {
    this.timeout(30000);

    const Joe = Actor.named('Joe').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

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
    )).to.be.rejectedWith(LogicError, `Couldn't load script from ${ pathToScript }.invalid`));

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
