import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, isGreaterThan, isLessThan } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { by, ExecuteScript, LastScriptExecution, Navigate, Scroll, Target } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

/** @test {Scroll} */
describe('Scroll', function () {

    const aLongSpell = pageFromTemplate(`
        <html>
            <body style="margin:0; padding:0 0 1024px 0;">
                <input type="submit" value="Cast!" id="cast" style="margin-top:10000px;" />
            </body>
        </html>
    `);

    const Page = {
        Execute_Button: Target.the('"Cast!" button').located(by.id('cast')),
    };

    /** @test {Scroll.to} */
    it('allows the actor to scroll to a given target so that it appears in the viewport', () => actorCalled('Gandalf').attemptsTo(
        Navigate.to(aLongSpell),

        ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
        Ensure.that(LastScriptExecution.result<number>(), isGreaterThan(9000)),

        Scroll.to(Page.Execute_Button),

        ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
        Ensure.that(LastScriptExecution.result<number>(), isLessThan(9000)),
    ));

    /** @test {Scroll.to} */
    /** @test {Scroll#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(Scroll.to(Page.Execute_Button).toString())
            .to.equal(`#actor scrolls to the "Cast!" button`);
    });
});
