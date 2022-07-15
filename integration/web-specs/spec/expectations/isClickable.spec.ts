import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Wait } from '@serenity-js/core';
import { By, isClickable, Navigate, PageElement } from '@serenity-js/web';

describe('isClickable', function () {

    const Elements = {
        enabledButton:  () => PageElement.located(By.id('enabled')).describedAs('the enabled button'),
        disabledButton: () => PageElement.located(By.id('disabled')).describedAs('the disabled button'),
        hiddenButton:   () => PageElement.located(By.id('hidden')).describedAs('the hidden button'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-clickable/buttons.html'),
        ));

    describe('resolves to true when the element', () => {

        /** @test {isClickable} */
        it('can be clicked on', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Wait.until(Elements.enabledButton(), isClickable()),
                Ensure.that(Elements.enabledButton(), isClickable()),
            )).to.be.fulfilled);
    });

    describe('resolves to false when the element', () => {

        /** @test {isClickable} */
        it('is disabled', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.disabledButton(), isClickable()),
            )).to.be.rejectedWith(AssertionError, `Expected the disabled button to become enabled`));

        /** @test {isClickable} */
        it('is not visible', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.hiddenButton(), isClickable()),
            )).to.be.rejectedWith(AssertionError, `Expected the hidden button to become visible`));
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Elements.enabledButton(), isClickable()).toString())
            .to.equal(`#actor ensures that the enabled button does become clickable`);
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Elements.enabledButton(), isClickable()).toString())
            .to.equal(`#actor waits up to 5s, polling every 500ms, until the enabled button does become clickable`);
    });
});
