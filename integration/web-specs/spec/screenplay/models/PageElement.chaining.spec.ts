import 'mocha';

import { Ensure, contain, equals, includes } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { By, Navigate, PageElement, Text } from '@serenity-js/web';

/** @test {PageElement} */
describe('PageElement', () => {

    beforeEach(() =>
        actorCalled('Peggy').attemptsTo(
            Navigate.to('/screenplay/models/page-elements/locator_patterns.html')
        ));

    describe('when using fluent element chaining', () => {

        describe('.element(selector)', () => {

            it('resolves a child element within a parent', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(
                            PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                                .element(By.css('[data-test-id="parent-1"]'))
                                .element(By.css('.child'))
                        ),
                        equals('child 1.1'),
                    ),
                ));

            it('resolves a direct child within a parent section', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(
                            PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                                .element(By.css('[data-test-id="parent-2"] .child'))
                        ),
                        equals('child 2.1'),
                    ),
                ));

            it('supports multi-level chaining: parent.element(child).element(grandchild)', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(
                            PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                                .element(By.css('[data-test-id="parent-2"]'))
                                .element(By.css('.child'))
                        ),
                        equals('child 2.1'),
                    ),
                ));
        });

        describe('.elements(selector)', () => {

            it('resolves all children within a parent', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.ofAll(
                            PageElement.located(By.css('[data-test-id="filter-locator-pattern"] [data-test-id="parent-2"]'))
                                .elements(By.css('.child'))
                        ),
                        equals(['tea', 'coffee']),
                    ),
                ));

            it('resolves all items within a nested container', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.ofAll(
                            PageElement.located(By.css('[data-test-id="mapping-tabular-data-to-object"] .container'))
                                .elements(By.css('.item .name'))
                        ),
                        equals(['apples', 'bananas']),
                    ),
                ));
        });

        describe('.of() rescoping with PageElement.located()', () => {

            const child = () =>
                PageElement.located(By.css('.child'));

            const parent1 = () =>
                PageElement.located(By.css('[data-test-id="parent-1"]'))
                    .of(
                        PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                    );

            const parent2 = () =>
                PageElement.located(By.css('[data-test-id="parent-2"]'))
                    .of(
                        PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                    );

            it('rescopes a located element using .of() to resolve within a parent', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(child().of(parent1())),
                        equals('child 1.1'),
                    ),
                ));

            it('rescopes to a different parent using .of()', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(child().of(parent2())),
                        equals('child 2.1'),
                    ),
                ));
        });

        describe('integrating with Text.of() and Ensure.that()', () => {

            it('extracts text from a deeply chained element', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(
                            PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                                .element(By.css('[data-test-id="parent-1"]'))
                                .element(By.css('[data-test-id="child-1-1"]'))
                        ),
                        equals('child 1.1'),
                    ),
                ));

            it('extracts text from a child within a filter-pattern section', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(
                            PageElement.located(By.css('[data-test-id="filter-locator-pattern"] [data-test-id="parent-1"]'))
                                .element(By.css('[data-test-id="child-1-1"]'))
                        ),
                        equals('tea'),
                    ),
                ));

            it('verifies text content includes a substring', () =>
                actorCalled('Peggy').attemptsTo(
                    Ensure.that(
                        Text.of(
                            PageElement.located(By.css('[data-test-id="child-of-parent-locator-pattern"]'))
                                .element(By.css('[data-test-id="parent-1"]'))
                        ),
                        includes('child 1.1'),
                    ),
                ));
        });
    });
});
