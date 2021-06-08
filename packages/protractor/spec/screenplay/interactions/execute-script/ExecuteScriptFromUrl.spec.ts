import 'mocha';

import { expect } from '@integration/testing-tools';
import { containAtLeastOneItemThat, Ensure, equals, includes, property } from '@serenity-js/assertions';
import { actorCalled, engage, LogicError } from '@serenity-js/core';
import { by } from 'protractor';

import { Browser, ExecuteScript, Navigate, Target, Text } from '../../../../src';
import { UIActors } from '../../../UIActors';

/** @test {ExecuteScript} */
describe('ExecuteScriptFromUrl', function () {

    this.timeout(10 * 1000);

    const
        pathToScript = fileUrl(require.resolve('./resources/execute-script-sample.js')),
        pathToPage = fileUrl(require.resolve('./resources/execute-script-sandbox.html'));

    class Sandbox {
        static Result = Target.the('sandbox result').located(by.id('result'));
    }

    beforeEach(() => engage(new UIActors()));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('allows the actor to execute a script stored at a specific location', () => actorCalled('Joe').attemptsTo(
        Navigate.to(pathToPage),

        ExecuteScript.from(pathToScript),

        Ensure.that(Text.of(Sandbox.Result), equals('Script loaded successfully')),
    ));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script could not be loaded', () => expect(actorCalled('Joe').attemptsTo(
        Navigate.to(pathToPage),

        ExecuteScript.from(pathToScript + '.invalid'),
    )).to.be.rejected
        .then(error => {
            expect(error).to.be.instanceOf(LogicError);
            expect(error.message).to.match(new RegExp(`Couldn't load script from.*?${ pathToScript }.invalid`))
        })
        .then(() => actorCalled('Joe').attemptsTo(
            Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('execute-script-sample.js.invalid - Failed to load resource')))),
        )));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl} */
    it('complains if the script has already been loaded', () => expect(actorCalled('Joe').attemptsTo(
        Navigate.to(pathToPage),

        ExecuteScript.from(pathToScript),
        ExecuteScript.from(pathToScript),
    )).to.be.rejectedWith(LogicError, `Script from ${ pathToScript } has already been loaded`));

    /** @test {ExecuteScript.from} */
    /** @test {ExecuteScriptFromUrl#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(ExecuteScript.from(pathToScript).toString())
            .to.equal(`#actor executes a script from ${ pathToScript }`);
    });
});

// based on https://github.com/sindresorhus/file-url/blob/main/index.js
function fileUrl(filePath: string) {
    let pathName = filePath.replace(/\\/g, '/');

    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== '/') {
        pathName = `/${pathName}`;
    }

    // Escape required characters for path components
    // See: https://tools.ietf.org/html/rfc3986#section-3.3
    return encodeURI(`file://${pathName}`).replace(/[#?]/g, encodeURIComponent);
}
