import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, ExecuteScript, LastScriptExecution, Navigate, PageElement, Scroll } from '@serenity-js/web';

/** @test {Scroll} */
describe('Scroll', function () {

    const Page = {
        Execute_Button: PageElement.located(By.id('cast')).describedAs('the "Cast!" button'),
        Body: PageElement.located(By.tagName('body'))
    };

    before(() => actorCalled('Gandalf').attemptsTo(
        Navigate.to('/screenplay/interactions/scroll/long_page.html')
    ));

    afterEach(() => actorCalled('Gandalf').attemptsTo(
        Scroll.to(Page.Body)
    ));

    /** @test {Scroll.to} */
    it('allows the actor to scroll to a given target so that it appears in the viewport', () =>
        actorCalled('Gandalf').attemptsTo(
            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(10000)),

            Scroll.to(Page.Execute_Button),

            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(0))
        ));

    /** @test {Scroll.alignedTo(true)} */
    it('allows the actor to scroll to a given target so that it appears in the top of the viewport', () =>
        actorCalled('Gandalf').attemptsTo(
            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(10000)),

            Scroll.alignedTo(true).to(Page.Execute_Button),

            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().top;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(0))
        ));

    it('allows the actor to scroll to a given target so that it appears in the bottom of the viewport', () =>
        actorCalled('Gandalf').attemptsTo(
            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().bottom;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(10021)),

            Scroll.alignedTo(false).to(Page.Execute_Button),

            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().bottom;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(21))
        ));

    it('allows the actor to scroll to a given target so that it appears in the bottom of the viewport (using options object)', () =>
        actorCalled('Gandalf').attemptsTo(
            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().bottom;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(10021)),

            Scroll.alignedTo({ block: 'end' }).to(Page.Execute_Button),

            ExecuteScript.sync(`return arguments[0].getBoundingClientRect().bottom;`).withArguments(Page.Execute_Button),
            Ensure.that(LastScriptExecution.result<number>(), equals(21))
        ));

    describe('toString', function () {
        /** @test {Scroll.to} */
        /** @test {Scroll#toString} */
        it('provides a sensible description of the interaction being performed', () => {
            expect(Scroll.to(Page.Execute_Button).toString())
                .to.equal(`#actor scrolls to the "Cast!" button`);
        });

        /** @test {Scroll.alignedTo} */
        /** @test {Scroll#toString} */
        it('provides a sensible description of the interaction being performed when the element is aligned to the top', () => {
            expect(Scroll.alignedTo(true).to(Page.Execute_Button).toString())
                .to.equal(`#actor scrolls to the 'top' of the "Cast!" button aligned to the 'top' of the visible area of the scrollable ancestor`);
        });

        /** @test {Scroll.alignedTo} */
        /** @test {Scroll#toString} */
        it('provides a sensible description of the interaction being performed when the element is aligned to the bottom', () => {
            expect(Scroll.alignedTo(false).to(Page.Execute_Button).toString())
                .to.equal(`#actor scrolls to the 'bottom' of the "Cast!" button aligned to the 'bottom' of the visible area of the scrollable ancestor`);
        });

        /** @test {Scroll.alignedTo} */
        /** @test {Scroll#toString} */
        it('provides a sensible description of the interaction being performed when the element is aligned using specific configuration', () => {
            expect(Scroll.alignedTo({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            }).to(Page.Execute_Button).toString())
                .to.equal(`#actor scrolls to the "Cast!" button with the following view options '{"behavior":"smooth","block":"end","inline":"nearest"}'`);
        });
    });
});
