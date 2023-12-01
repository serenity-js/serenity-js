import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { By, ComputedStyle, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

describe('ComputedStyle', () => {

    describe('called', () => {

        const exampleElement = PageElement.located(By.id('example')).describedAs('example element');

        it('complains if the target is not specified', async () => {
            await expect(actorCalled('Wendy').attemptsTo(
                Ensure.that(ComputedStyle.called('content'), equals('non-existent')),
            )).to.be.rejectedWith(LogicError, `Couldn't read computed style property 'content' of an unspecified page element`)
        });

        describe('toString', () => {

            it('provides a human-readable description', async () => {
                const description = ComputedStyle.called('content').toString();

                expect(description).to.equal(`computed style property 'content'`);
            });
        });

        describe('of', () => {

            const elements = {
                hidden: () => PageElement.located(By.id('hidden')).describedAs('hidden element'),
                visible: () => PageElement.located(By.id('visible')).describedAs('visible element'),
            };

            it('allows the actor to read an in-line style property of a DOM element matching the locator', async () => {
                await actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/questions/computed-style/display-none.html'),
                    Ensure.that(ComputedStyle.called('display').of(elements.hidden()), equals('none')),
                );
            });

            it('allows the actor to read a computed style property of a DOM element matching the locator', async () => {
                await actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/questions/computed-style/display-none.html'),
                    Ensure.that(ComputedStyle.called('display').of(elements.visible()), equals('block')),
                );
            });

            it('allows the actor to filter a list of elements by computed style property of an element', async () => {
                const elements = PageElements.located(By.css('li')).describedAs('example elements')
                    .where(ComputedStyle.called('border-style'), equals('solid'));

                await actorCalled('Wendy').attemptsTo(
                    Navigate.to('/screenplay/questions/computed-style/filtering-by-computed-style.html'),
                    Ensure.that(Text.ofAll(elements), equals([ 'one', 'three' ])),
                );
            });

            describe('toString', () => {

                it('provides a human-readable description', async () => {
                    const description = ComputedStyle.called('content').of(exampleElement).toString();

                    expect(description).to.equal(`computed style property 'content' of example element`);
                });
            });
        });

        describe('ofPseudoElement', () => {

            describe('toString', () => {

                it('provides a human-readable description', async () => {
                    const description = ComputedStyle.called('content').ofPseudoElement('::after').toString();

                    expect(description).to.equal(`computed style property 'content' of pseudo-element '::after'`);
                });
            });

            describe('of', () => {

                const elements = {
                    example: () => PageElement.located(By.id('example')).describedAs('example'),
                };

                it('allows the actor to read an in-line style property of a DOM element matching the locator', async () => {
                    await actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/computed-style/pseudo-element.html'),
                        Ensure.that(ComputedStyle.called('border-style').ofPseudoElement('::after').of(elements.example()), equals('solid')),
                        Ensure.that(ComputedStyle.called('content').ofPseudoElement('::after').of(elements.example()), equals('"pseudo-element"')),
                    );
                });

                it('allows the actor to filter a list of elements by computed style property of a pseudo-element', async () => {
                    const elements = PageElements.located(By.css('li')).describedAs('example elements')
                        .where(ComputedStyle.called('content').ofPseudoElement('::after'), includes('pseudo-element'));

                    await actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/computed-style/filtering-by-pseudo-element.html'),
                        Ensure.that(Text.ofAll(elements), equals([ 'one', 'three' ])),
                    );
                });

                describe('toString', () => {

                    it('provides a human-readable description', async () => {
                        const description = ComputedStyle.called('content').ofPseudoElement('::after').of(exampleElement).toString();

                        expect(description).to.equal(`computed style property 'content' of pseudo-element '::after' of example element`);
                    });
                });
            });
        });
    });
});
