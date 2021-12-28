import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, isVisible, Navigate, PageElement, Wait } from '@serenity-js/web';

describe('isVisible', function () {

    const Elements = {
        displayed:      PageElement.located(By.id('displayed')).describedAs('visible element'),
        notDisplayed:   PageElement.located(By.id('display-none')).describedAs('not displayed element'),
        nonExistent:    PageElement.located(By.id('does-not-exist')).describedAs('non-existent element'),
        hidden:         PageElement.located(By.id('visibility-hidden')).describedAs('hidden element'),
        notInViewport:  PageElement.located(By.id('not-in-viewport')).describedAs('element outside of the browser viewport'),
        transparent:    PageElement.located(By.id('opacity-zero')).describedAs('a fully transparent element'),

        foreground:     PageElement.located(By.id('foreground')).describedAs('element in the foreground'),
        background:     PageElement.located(By.id('background')).describedAs('element in the background'),
    };

    beforeEach(() =>
        actorCalled('Wendy').attemptsTo(
            Navigate.to('/expectations/is-visible/visibility.html'),
        ));

    describe('resolves to true when the element', () => {

        /** @test {isVisible} */
        it('is displayed', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.displayed, isVisible()),
            ));

        /** @test {isVisible} */
        it('is not covered by other elements', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.foreground, isVisible()),
            ));
    });

    describe('resolves to false when the element', () => {

        /** @test {isVisible} */
        it('is not displayed', () =>
            // expect(
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.notDisplayed, not(isVisible())),
            ));

        /** @test {isVisible} */
        it('does not exist', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.nonExistent, not(isVisible())),
            ));

        /** @test {isVisible} */
        it('is hidden', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.hidden, not(isVisible())),
            ));

        /** @test {isVisible} */
        it('is not in the viewport', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.notInViewport, not(isVisible())),
            ));

        /** @test {isVisible} */
        it('is transparent', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.transparent, not(isVisible())),
            ));

        /** @test {isVisible} */
        it('is covered by other elements', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Elements.background, not(isVisible())),
            ));
    });

    /** @test {isVisible} */
    it('contributes to a human-readable description of an assertion', () => {
        expect(Ensure.that(Elements.displayed, isVisible()).toString())
            .to.equal(`#actor ensures that visible element does become visible`);
    });

    /** @test {isVisible} */
    it('contributes to a human-readable description of a wait', () => {
        expect(Wait.until(Elements.displayed, isVisible()).toString())
            .to.equal(`#actor waits up to 5s until visible element does become visible`);
    });
});
