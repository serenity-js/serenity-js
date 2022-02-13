import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { By, Frame, Navigate, PageElement, Switch, Text } from '@serenity-js/web';

/** @test {Frame} */
describe('Frame', () => {

    const heading = PageElement.located(By.css('h1')).describedAs('heading');

    describe('when handling errors', () => {

        beforeEach(() =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_no_iframes.html'),
            )
        );

        describe('should complain when trying to switch to an element that', () => {

            it('is not a frame', () =>
                expect(actorCalled('Francesca').attemptsTo(
                    Frame.located(By.css('h1')).switchTo(),
                )).to.be.rejectedWith(LogicError, `Couldn't switch to a frame located by css ('h1')`)
            );

            it(`doesn't exist`, () =>
                expect(actorCalled('Francesca').attemptsTo(
                    Frame.located(By.css('#invalid')).switchTo(),
                )).to.be.rejectedWith(LogicError, `Couldn't locate frame by css ('#invalid')`)
            );
        });
    });

    describe('isPresent()', () => {

        it('resolves to true when the frame is present', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_an_iframe.html'),
                Ensure.that(Frame.located(By.css('iframe')), isPresent()),
            ));

        it('resolves to false when the frame is not present', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_no_iframes.html'),
                Ensure.that(Frame.located(By.css('#invalid')), not(isPresent())),
            ));
    });

    describe('when working with iframes', () => {

        it('should switch context to the iframe of interest', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_an_iframe.html'),
                Ensure.that(Text.of(heading), equals('Page with an iframe')),

                Frame.located(By.css('iframe')).switchTo(),
                Ensure.that(Text.of(heading), equals('An iframe')),
            )
        );

        it('should switch to a nested iframe', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_a_nested_iframe.html'),
                Ensure.that(Text.of(heading), equals('Page with a nested iframe')),

                Frame.located(By.css('iframe')).switchTo(),
                Ensure.that(Text.of(heading), equals('Page with an iframe')),

                Frame.located(By.css('iframe')).switchTo(),
                Ensure.that(Text.of(heading), equals('An iframe')),
            )
        );
    });

    describe('when performing activities in the context of an iframe', () => {

        it('should automatically switch back to a parent frame from an iframe', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_an_iframe.html'),
                Ensure.that(Text.of(heading), equals('Page with an iframe')),

                Switch.to(Frame.located(By.css('iframe'))).and(
                    Ensure.that(Text.of(heading), equals('An iframe')),
                ),

                Ensure.that(Text.of(heading), equals('Page with an iframe')),
            )
        );

        it('should automatically switch back to a parent frame from a nested iframe', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/frame/page_with_a_nested_iframe.html'),
                Ensure.that(Text.of(heading), equals('Page with a nested iframe')),

                Switch.to(Frame.located(By.css('iframe'))).and(
                    Ensure.that(Text.of(heading), equals('Page with an iframe')),

                    Switch.to(Frame.located(By.css('iframe'))).and(
                        Ensure.that(Text.of(heading), equals('An iframe')),
                    ),
                ),

                Ensure.that(Text.of(heading), equals('Page with a nested iframe')),
            )
        );
    });

    it('provides a human-readable description', () => {
        const description = Frame.located(By.css('iframe')).toString();

        expect(description).to.equal(`frame located by css ('iframe')`);
    });
});

