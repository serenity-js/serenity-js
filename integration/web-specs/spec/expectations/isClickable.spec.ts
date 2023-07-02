import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, isPresent } from '@serenity-js/assertions';
import { actorCalled, AssertionError, Duration, Wait } from '@serenity-js/core';
import { By, isClickable, Navigate, PageElement, PageElements } from '@serenity-js/web';

describe('isClickable', function () {

    const Elements = {
        nonExistent:            () => PageElement.located(By.id('does-not-exist')).describedAs('non-existent element'),
        nonExistentElements:    () => PageElements.located(By.id('does-not-exist')).describedAs('non-existent elements'),
        enabledButton:          () => PageElement.located(By.id('enabled')).describedAs('the enabled button'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-clickable/buttons.html'),
            Wait.upTo(Duration.ofSeconds(10))
                .until(Elements.enabledButton(), isPresent()),
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
        it('does not exist', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.nonExistent(), isClickable()),
            )).to.be.rejectedWith(AssertionError, `Expected non-existent element to become present`));

        /** @test {isClickable} */
        it('does not exist in a list of PageElements', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.nonExistentElements().first(), isClickable()),
            )).to.be.rejectedWith(AssertionError, `Expected the first of non-existent elements to become present`));
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Elements.enabledButton(), isClickable()).toString())
            .to.equal(`#actor ensures that the enabled button does become clickable`);
    });

    /** @test {isClickable} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Elements.enabledButton(), isClickable()).toString())
            .to.equal(`#actor waits until the enabled button does become clickable`);
    });
});
