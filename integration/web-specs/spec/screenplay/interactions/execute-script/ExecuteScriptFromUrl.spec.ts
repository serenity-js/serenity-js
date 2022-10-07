import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { By, ExecuteScript, Navigate, PageElement, Text } from '@serenity-js/web';

// todo: introduce question about baseUrl
const port = process.env.PORT ?? 8080;
const baseUrl = `http://localhost:${ port }`;

describe('ExecuteScriptFromUrl', function () {

    class Sandbox {
        static Result = PageElement.located(By.id('result')).describedAs('sandbox result');
    }

    it('allows the actor to execute a script stored at a specific location', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ baseUrl }/screenplay/interactions/execute-script/execute-script-sample.js`),

            Ensure.that(Text.of(Sandbox.Result), equals('Script loaded successfully')),
        ));

    it('complains if the script could not be loaded', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            // todo: replace with Answerable<string>
            ExecuteScript.from(`${ baseUrl }/invalid.js`),
        )).to.be.rejected
            .then(error => {
                expect(error).to.be.instanceOf(LogicError);
                expect(error.message).to.match(new RegExp(`Couldn't load script from ${ baseUrl }/invalid.js`))
            })
            .then(() => actorCalled('Joe').attemptsTo(
                // todo: implement Browser log when Webdriver supports it
                // Ensure.that(Browser.log(), containAtLeastOneItemThat(property('message', includes('invalid.js - Failed to load resource')))),
            )));

    it('complains if the script has already been loaded', () =>
        expect(actorCalled('Joe').attemptsTo(
            Navigate.to('/screenplay/interactions/execute-script/execute_script_sandbox.html'),

            ExecuteScript.from(`${ baseUrl }/screenplay/interactions/execute-script/execute-script-sample.js`),
            ExecuteScript.from(`${ baseUrl }/screenplay/interactions/execute-script/execute-script-sample.js`),
        )).to.be.rejectedWith(LogicError, `Script from ${ baseUrl }/screenplay/interactions/execute-script/execute-script-sample.js has already been loaded`));

    it('provides a sensible description of the interaction being performed', () => {
        expect(ExecuteScript.from('https://localhost/script.js').toString())
            .to.equal(`#actor executes a script from 'https://localhost/script.js'`);
    });

    it('correctly detects its invocation location', () => {
        const activity = ExecuteScript.from('https://localhost/script.js');
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('ExecuteScriptFromUrl.spec.ts');
        expect(location.line).to.equal(57);
        expect(location.column).to.equal(40);
    });
});
