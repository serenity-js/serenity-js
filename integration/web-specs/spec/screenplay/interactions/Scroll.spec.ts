import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, isGreaterThan, isLessThan } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { ExecuteScript, LastScriptExecution, Navigate, PageElement, Scroll } from '@serenity-js/web';

/** @test {Scroll} */
describe('Scroll', function () {

    const Page = {
        Execute_Button: PageElement.locatedById('cast').describedAs('the "Cast!" button'),
    };

    /** @test {Scroll.to} */
    it('allows the actor to scroll to a given target so that it appears in the viewport', () =>
        actorCalled('Gandalf').attemptsTo(
            Navigate.to('/screenplay/interactions/scroll/long_page.html'),

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
