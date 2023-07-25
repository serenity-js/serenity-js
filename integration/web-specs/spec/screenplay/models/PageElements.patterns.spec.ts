/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, ListItemNotFoundError, LogicError, MetaQuestion, Question } from '@serenity-js/core';
import { Attribute, By, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

import { ExportedPageElements } from './fixtures/ExportedPageElements';

/** @test {PageElements} */
describe('PageElements', () => {

    beforeEach(() =>
        actorCalled('Peggy').attemptsTo(
            Navigate.to('/screenplay/models/page-elements/locator_patterns.html')
        ));

    describe('when using advanced locator strategies', () => {

        describe('to find a specific element', () => {

            describe('using a direct locator pattern', () => {

                const element = () =>
                    PageElement.located(By.css('.element'));

                it(`finds the element, if one exists`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(Text.of(element()), equals('expected')),
                    ));
            });

            describe('using a "child of parent" locator pattern', () => {

                const childParentStrategySection = () =>
                    PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                        .describedAs('child of parent locator strategy section');

                const child = () =>
                    PageElement.located(By.css('.child'));

                const parent1 = () =>
                    PageElement.located(By.css('[data-test-id="parent-1"]'))
                        .of(childParentStrategySection())
                        .describedAs('parent 1');

                const parent2 = () =>
                    PageElement.located(By.css('[data-test-id="parent-2"]'))
                        .of(childParentStrategySection())
                        .describedAs('parent 2');

                it(`finds a direct descendant, if one exists`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            Text.of(parent1()),
                            includes('child 1.1')
                        ),
                    ));

                it(`finds an indirect descendant, if one exists`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            Text.of(child().of(parent2())),
                            equals('child 2.1')
                        ),
                    ));

                // see https://github.com/serenity-js/serenity-js/issues/1106
                it(`supports exported PageElements`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            Text.of(child().of(ExportedPageElements.parent())),
                            equals('child 1.1')
                        ),
                    ));
            });

            describe('using a "parent closest to child" pattern', () => {

                const childParentStrategySection = () =>
                    PageElement.located(By.css('[data-test-id="parent-closest-to-child-locator-pattern"]'))
                        .describedAs('parent closest to child locator strategy section');

                const child2 = () =>
                    PageElement.located(By.css('[data-test-id="child-2-1"]'))
                        .of(childParentStrategySection());

                const parent = () =>
                    PageElement.located(By.css('.parent'))
                        .describedAs('parent');

                const nonExistentElement = () =>
                    PageElement.located(By.css('.non-existent'))
                        .describedAs('non-existent element');

                const parentLocatedByNonCssSelector = () =>
                    PageElement.located(By.xpath('//div'))
                        .describedAs('parent located by a non-CSS selector');

                it(`traverses the DOM tree to find the parent specified by a CSS selector`, async () => {
                    await actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            Attribute.called('data-test-id').of(
                                parent().closestTo(child2())
                            ),
                            equals('parent-2')
                        ),
                    )
                });

                it(`knows if the parent element doesn't exist`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            nonExistentElement().closestTo(child2()),
                            not(isPresent()),
                        ),
                    ));

                // Element.closest(selector) is executed in browser and supports only standard CSS selectors.
                it(`complains if given a non-CSS selector`, async () => {
                    await expect(
                        actorCalled('Peggy').attemptsTo(
                            Ensure.that(
                                Attribute.called('data-test-id').of(
                                    parentLocatedByNonCssSelector().closestTo(child2())
                                ),
                                equals('should never match'),
                            ),
                        )
                    ).to.be.rejectedWith(LogicError, `by xpath ('//div') can't be expressed as a CSS selector`)
                });
            });

            describe('using a filter locator pattern to find a non-unique parent element', () => {

                const filterStrategySection = () =>
                    PageElement.located(By.css('[data-test-id="filter-locator-pattern"]'))
                        .describedAs('filter pattern section');

                const parents = () =>
                    PageElements.located(By.css('.parent'))
                        .of(filterStrategySection())

                const children = () =>
                    PageElements.located(By.css('.child'));

                it(`finds the element, if one exists`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            Attribute.called('data-test-id').of(
                                parents()
                                    .where(Text.ofAll(children()), contain('tea'))
                                    // AND
                                    .where(Text.ofAll(children()), contain('coffee'))
                                    .first()
                            ),
                            equals('parent-2')
                        ),
                    ));

                it(`allows to check if the element of interest is present`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            parents()
                                .where(Text.ofAll(children()), contain('tea'))
                                // AND
                                .where(Text.ofAll(children()), contain('coffee'))
                                .first(),
                            isPresent(),
                        ),
                    ));

                it(`complains if the element is not present`, () =>
                    expect(
                        actorCalled('Peggy').answer(
                            parents()
                                .where(Text.ofAll(children()), contain('tea'))
                                .where(Text.ofAll(children()), contain('coffee'))
                                .where(Text.ofAll(children()), contain('juice'))
                                // there's no parent container with all the three items
                                .first()
                                .nativeElement()
                        )
                    ).to.be.rejectedWith(ListItemNotFoundError, `Can't retrieve the first item from a list with 0 items: [ ]`)
                );

                it(`allows to check if the element of interest is not present`, () =>
                    actorCalled('Peggy').attemptsTo(
                        Ensure.that(
                            parents()
                                .where(Text.ofAll(children()), contain('tea'))
                                .where(Text.ofAll(children()), contain('coffee'))
                                .where(Text.ofAll(children()), contain('juice'))
                                // there's no parent container with all the three items
                                .first(),
                            not(isPresent())
                        ),
                    ));
            });
        });

        describe('to find multiple elements', () => {

            const childParentStrategySection = () =>
                PageElement.located(By.css('[data-test-id="filter-locator-with-mapping-pattern"]'))
                    .describedAs('filter pattern with mapping section');

            const containers = () =>
                PageElements.located(By.css('.container'))
                    .describedAs('containers')
                    .of(childParentStrategySection());

            const heading = () =>
                PageElement.located(By.tagName('h1'))
                    .describedAs('heading');

            const listItems = () =>
                PageElements.located(By.css('ul li'))
                    .describedAs('list items');

            it('allows for the found elements to be mapped to child elements', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.ofAll(
                            containers()
                                .where(Text.ofAll(listItems()), contain('coffee'))
                                .eachMappedTo(heading())
                        ),
                        equals([ 'First shopping list', 'Second shopping list' ])
                    ),
                ));

            it('allows for a list of found PageElement[] to be mapped to lists of Text.ofAll(children) of those elements', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        containers().eachMappedTo(Text.ofAll(listItems())),
                        equals([
                            [ 'biscuits', 'coffee', 'milk' ],
                            [ 'coffee', 'cake' ],
                            [ 'apples', 'oranges' ],
                        ])
                    ),
                ));

            it('produces a sensible description', () => {
                const description = Text.of(
                    heading().of(
                        containers()
                            .where(Text.ofAll(listItems()), contain('coffee'))
                            .last()
                    )
                ).toString();

                expect(description).to.equal(
                    `the text of heading of the last of containers of filter pattern with mapping section where the text of list items does contain 'coffee'`
                );
            });
        });

        describe('to map elements', () => {

            const mappingPatternSection = () =>
                PageElement.located(By.css('[data-test-id="mapping-tabular-data-to-object"]'))
                    .describedAs('mapping pattern');

            const container = () =>
                PageElement.located(By.css('.container'))
                    .describedAs('container')
                    .of(mappingPatternSection());

            const items = () =>
                PageElements.located(By.css('.item'))
                    .of(container())
                    .describedAs('items')

            const BasketItemDetails: MetaQuestion<PageElement, Promise<{ name: string, price: number }>> = {
                of: (element: PageElement) =>
                    Question.fromObject({

                        name: Text
                            .of(PageElement.located(By.css('.name')))
                            .of(element),

                        price: Text
                            .of(PageElement.located(By.css('.price')).of(element))
                            .trim()
                            .replace('£', '')
                            .as(Number)

                    }).describedAs('basket item details')
            }

            it('supports custom meta questions', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        items().eachMappedTo(BasketItemDetails),
                        equals([
                            { name: 'apples',  price: 2.25 },
                            { name: 'bananas', price: 1.5  },
                        ])
                    ),
                ));
        });
    });
});
