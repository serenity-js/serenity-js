import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError } from '@serenity-js/core';
import { By, isEnabled, Navigate, PageElement, Wait } from '@serenity-js/web';

describe('isEnabled', function () {

    const Page = {
        enabledButton:     PageElement.located(By.id('enabled')).describedAs('the enabled button'),
        disabledButton:    PageElement.located(By.id('disabled')).describedAs('the disabled button'),
        hiddenButton:      PageElement.located(By.id('hidden')).describedAs('the hidden button'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-enabled/buttons.html'),
        ));

    /** @test {isEnabled} */
    it('allows the actor flow to continue when the element is enabled', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Wait.until(Page.enabledButton, isEnabled()),
            Ensure.that(Page.enabledButton, isEnabled()),
        )).to.be.fulfilled);

    /** @test {isEnabled} */
    it('breaks the actor flow when element is disabled', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.disabledButton, isEnabled()),
        )).to.be.rejectedWith(AssertionError, `Expected the disabled button to become enabled`));

    /** @test {isEnabled} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Page.enabledButton, isEnabled()).toString())
            .to.equal(`#actor ensures that the enabled button does become enabled`);
    });

    /** @test {isEnabled} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Page.enabledButton, isEnabled()).toString())
            .to.equal(`#actor waits up to 5s until the enabled button does become enabled`);
    });
});
