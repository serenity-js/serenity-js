import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { By, isClickable, Navigate, PageElement, Wait } from '@serenity-js/web';

describe('isClickable', function () {

    const Page = {
        enabledButton:     PageElement.located(By.id('enabled')).describedAs('the enabled button'),
        disabledButton:    PageElement.located(By.id('disabled')).describedAs('the disabled button'),
        hiddenButton:      PageElement.located(By.id('hidden')).describedAs('the hidden button'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-clickable/buttons.html'),
        ));

    /** @test {isClickable} */
    it('allows the actor flow to continue when the element is clickable', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.until(Page.enabledButton, isClickable()),
            Ensure.that(Page.enabledButton, isClickable()),
        )).to.be.fulfilled);

    /** @test {isClickable} */
    it('breaks the actor flow when element is disabled', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.disabledButton, isClickable()),
        )).to.be.rejectedWith(AssertionError, `Expected the disabled button to become enabled`));

    /** @test {isClickable} */
    it('breaks the actor flow when element is not visible', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.hiddenButton, isClickable()),
        )).to.be.rejectedWith(AssertionError, `Expected the hidden button to become displayed`));

    /** @test {isClickable} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.enabledButton, isClickable()).toString())
            .to.equal(`#actor ensures that the enabled button does become clickable`);
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.enabledButton, isClickable()).toString())
            .to.equal(`#actor waits up to 5s until the enabled button does become clickable`);
    });
});
