import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError } from '@serenity-js/core';

import { by, isClickable, Navigate, Target, Wait } from '../../src';

describe('isClickable', function () {

    const Page = {
        enabledButton:     Target.the('enabled button').located(by.id('enabled')),
        disabledButton:    Target.the('disabled button').located(by.id('disabled')),
        hiddenButton:      Target.the('hidden button').located(by.id('hidden')),
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
        )).to.be.rejectedWith(AssertionError, `Expected the disabled button to become clickable`));

    /** @test {isClickable} */
    it('breaks the actor flow when element is not visible', () =>
        expect(actorCalled('Wendy').attemptsTo(
            Ensure.that(Page.hiddenButton, isClickable()),
        )).to.be.rejectedWith(AssertionError, `Expected the hidden button to become clickable`));

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
