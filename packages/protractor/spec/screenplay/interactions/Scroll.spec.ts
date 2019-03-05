import { expect } from '@integration/testing-tools';
import { Ensure, equals, isGreaterThan, isLessThan } from '@serenity-js/assertions';
import { Actor, Duration } from '@serenity-js/core';
import { by, protractor } from 'protractor';

import {
    BrowseTheWeb,
    Enter,
    ExecuteScript,
    isVisible,
    LastScriptExecution,
    Navigate, Scroll,
    Target,
    Value,
    Wait,
} from '../../../src';
import { pageFromTemplate } from '../../fixtures';

describe('Scroll', function() {

    const Gandalf = Actor.named('Gandalf').whoCan(
        BrowseTheWeb.using(protractor.browser),
    );

    const aLongSpell = pageFromTemplate(`
        <html>
            <body style="margin:0; padding:0 0 1024px 0;">
                <input type="submit" value="Cast!" id="cast" style="margin-top:1024px;" />
            </body>
        </html>
    `);

    const Page = {
        Execute_Button: Target.the('"Cast!" button').located(by.id('cast')),
    };

    /** @test {Scroll} */
    /** @test {Scroll.to} */
    it('allows the actor to scroll to a given target so that it appears in the viewport', () => Gandalf.attemptsTo(
        Navigate.to(aLongSpell),

        ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
        Ensure.that(LastScriptExecution.result(), isGreaterThan(1000)),

        Scroll.to(Page.Execute_Button),

        ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
        Ensure.that(LastScriptExecution.result(), isLessThan(1000)),
    ));

    /** @test {Enter#toString} */
    it(`provides a sensible description of the interaction being performed`, () => {
        expect(Scroll.to(Page.Execute_Button).toString())
            .to.equal(`#actor scrolls to the "Cast!" button`);
    });
});
