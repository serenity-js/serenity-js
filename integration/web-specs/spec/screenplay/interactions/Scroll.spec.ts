import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, isGreaterThan, isLessThan } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, ExecuteScript, LastScriptExecution, Navigate, PageElement, Scroll } from '@serenity-js/web';

describe('Scroll', function () {

    const Page = {
        Execute_Button: PageElement.located(By.id('cast')).describedAs('the "Cast!" button'),
    };

    it('allows the actor to scroll to a given target so that it appears in the viewport', () =>
        actorCalled('Gandalf').attemptsTo(
            Navigate.to('/screenplay/interactions/scroll/long_page.html'),

            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), isGreaterThan(9000)),

            Scroll.to(Page.Execute_Button),

            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), isLessThan(9000)),
        ));

    it('provides a sensible description of the interaction being performed', () => {
        expect(Scroll.to(Page.Execute_Button).toString())
            .to.equal(`#actor scrolls to the "Cast!" button`);
    });

    it('correctly detects its invocation location', () => {
        const activity = Scroll.to(Page.Execute_Button);
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('Scroll.spec.ts');
        expect(location.line).to.equal(33);
        expect(location.column).to.equal(33);
    });
});
