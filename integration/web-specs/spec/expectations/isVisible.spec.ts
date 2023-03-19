import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, not } from '@serenity-js/assertions';
import { actorCalled, Wait } from '@serenity-js/core';
import { Attribute, By, Hover, isVisible, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

describe('isVisible', function () {

    describe('when working with standard document structure', () => {

        const Elements = {
            displayed:              () => PageElement.located(By.id('displayed')).describedAs('visible element'),
            notDisplayed:           () => PageElement.located(By.id('display-none')).describedAs('not displayed element'),
            nonExistent:            () => PageElement.located(By.id('does-not-exist')).describedAs('non-existent element'),
            nonExistentElements:    () => PageElements.located(By.id('does-not-exist')).describedAs('non-existent elements'),
            hidden:                 () => PageElement.located(By.id('visibility-hidden')).describedAs('hidden element'),
            notInViewport:          () => PageElement.located(By.id('not-in-viewport')).describedAs('element outside of the browser viewport'),
            transparent:            () => PageElement.located(By.id('opacity-zero')).describedAs('a fully transparent element'),

            foreground:             () => PageElement.located(By.id('foreground')).describedAs('element in the foreground'),
            background:             () => PageElement.located(By.id('background')).describedAs('element in the background'),
        };

        beforeEach(() =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/expectations/is-visible/visibility.html'),
            ));

        describe('resolves to true when the element', () => {

            /** @test {isVisible} */
            it('is displayed', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.displayed(), isVisible()),
                ));

            /** @test {isVisible} */
            it('is not covered by other elements', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.foreground(), isVisible()),
                ));
        });

        describe('resolves to false when the element', () => {

            /** @test {isVisible} */
            it('is not displayed', () =>
                // expect(
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.notDisplayed(), not(isVisible())),
                ));

            /** @test {isVisible} */
            it('does not exist', () =>
                expect(actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.nonExistent(), not(isVisible())),
                )));

            /** @test {isVisible} */
            it('does not exist in a list of PageElements', () =>
                expect(actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.nonExistentElements().first(), not(isVisible())),
                )));

            /** @test {isVisible} */
            it('is hidden', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.hidden(), not(isVisible())),
                ));

            /** @test {isVisible} */
            it('is not in the viewport', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.notInViewport(), not(isVisible())),
                ));

            /** @test {isVisible} */
            it('is transparent', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.transparent(), not(isVisible())),
                ));

            /** @test {isVisible} */
            it('is covered by other elements', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.background(), not(isVisible())),
                ));
        });

        /** @test {isVisible} */
        it('contributes to a human-readable description of an assertion', () => {
            expect(Ensure.that(Elements.displayed(), isVisible()).toString())
                .to.equal(`#actor ensures that visible element does become visible`);
        });

        /** @test {isVisible} */
        it('contributes to a human-readable description of a wait', () => {
            expect(Wait.until(Elements.displayed(), isVisible()).toString())
                .to.equal(`#actor waits until visible element does become visible`);
        });
    });

    describe('when working with Shadow DOM', () => {

        const Elements = {
            cvcLabel:       PageElement.located(By.tagName('label')).describedAs('popup label'),
            infoComponent:  PageElement.located(By.tagName('popup-info')).describedAs('popup info icon'),
            infoText:       PageElement.located(By.deepCss('popup-info span.info')).describedAs('popup text'),
        };

        beforeEach(() =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/expectations/is-visible/shadow_dom.html'),
            ));

        describe('resolves to true when the element', () => {

            /** @test {isVisible} */
            it('is displayed', () =>
                actorCalled('Wendy').attemptsTo(
                    Ensure.that(Elements.infoComponent, isVisible()),
                    Ensure.that(Elements.infoText, not(isVisible())),

                    Hover.over(Elements.infoComponent),
                    Ensure.that(Elements.infoText, isVisible()),
                    Ensure.that(Text.of(Elements.infoText), equals(Attribute.called('data-text').of(Elements.infoComponent))),
                ));
        });
    });
});
