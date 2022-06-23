import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Wait } from '@serenity-js/core';
import { By, Click, isActive, Navigate, PageElement } from '@serenity-js/web';

describe('isActive', function () {

    const Page = {
        activeInput:        PageElement.located(By.id('active')).describedAs('the active input'),
        autofocusedInput:   PageElement.located(By.id('autofocused')).describedAs('the autofocused input'),
        inactiveInput:      PageElement.located(By.id('inactive')).describedAs('the inactive input'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-active/active_inactive_inputs.html'),
        ));

    /** @test {isActive} */
    it('allows the actor flow to continue when the element is active', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.until(Page.autofocusedInput, isActive()),
            Ensure.that(Page.autofocusedInput, isActive()),

            Ensure.that(Page.inactiveInput, not(isActive())),
            Click.on(Page.inactiveInput),

            Wait.until(Page.inactiveInput, isActive()),
            Ensure.that(Page.inactiveInput, isActive()),
        )).to.be.fulfilled);

    /** @test {isActive} */
    it('breaks the actor flow when element is inactive', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.inactiveInput, isActive()),
        )).to.be.rejectedWith(AssertionError, `Expected the inactive input to become active`));

    /** @test {isActive} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.activeInput, isActive()).toString())
            .to.equal(`#actor ensures that the active input does become active`);
    });

    /** @test {isActive} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.activeInput, isActive()).toString())
            .to.equal(`#actor waits up to 5s, polling every 500ms, until the active input does become active`);
    });
});
