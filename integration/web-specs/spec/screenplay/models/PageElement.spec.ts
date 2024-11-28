import 'mocha';

import { expect } from '@integration/testing-tools';
import { and, Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';
import { actorCalled, LogicError, Wait } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io';
import {
    By,
    Drag,
    isActive,
    isVisible,
    Key,
    Navigate,
    Page,
    PageElement,
    PageElements,
    Press,
    Switch,
    TakeScreenshot,
    Text,
    Value
} from '@serenity-js/web';

/** @test {PageElement} */
describe('PageElement', () => {

    const heading = PageElement.located(By.css('h1')).describedAs('heading');

    describe('when handling errors', () => {

        beforeEach(() =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/page_with_no_iframes.html'),
            ),
        );

        describe('should complain when trying to switch to an element that', () => {

            it(`doesn't exist`, () =>
                expect(actorCalled('Francesca').attemptsTo(
                    PageElement.located(By.css('#invalid')).switchTo(),
                )).to.be.rejectedWith(LogicError, `Couldn't switch to page element located by css ('#invalid')`),
            );
        });
    });

    /** @test {PageElement#isPresent} */
    describe('isPresent()', () => {

        it('resolves to true when the regular element is present', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/page_with_an_iframe.html'),
                Ensure.that(PageElement.located(By.css('h1')), isPresent()),
            ));

        it('resolves to true when the iframe element is present', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/page_with_an_iframe.html'),
                Ensure.that(PageElement.located(By.css('iframe')), isPresent()),
            ));

        it('resolves to false when the element is not present', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/page_with_no_iframes.html'),
                Ensure.that(PageElement.located(By.css('#invalid')), not(isPresent())),
            ));
    });

    describe('html()', () => {

        it('should return the outer HTML of the element', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/outer_html.html'),
                Ensure.that(
                    PageElement.located(By.id('container')).html(),
                    equals(trimmed`
                        | <div id="container">
                        |     <h1>Title</h1>
                        | </div>                    
                    `)
                ),
            ));

        it('should return the outer HTML of all elements', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/outer_html.html'),
                Ensure.that(
                    PageElements.located(By.css('ul#list li'))
                        .eachMappedTo(PageElement.html()),

                    equals([
                        '<li>Item 1</li>',
                        '<li>Item 2</li>',
                        '<li>Item 3</li>',
                    ])
                ),
            ));
    });

    /** @test {PageElement#switchTo} */
    describe('switchTo()', () => {

        describe('when working with iframes', () => {

            it('should switch context to the iframe of interest', () =>
                actorCalled('Francesca').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/page_with_an_iframe.html'),
                    Ensure.that(Text.of(heading), equals('Page with an iframe')),

                    PageElement.located(By.css('iframe')).switchTo(),
                    Ensure.that(Text.of(heading), equals('An iframe')),
                ),
            );

            it('should switch to a nested iframe', () =>
                actorCalled('Francesca').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/page_with_a_nested_iframe.html'),
                    Ensure.that(Text.of(heading), equals('Page with a nested iframe')),

                    PageElement.located(By.css('iframe')).switchTo(),
                    Ensure.that(Text.of(heading), equals('Page with an iframe')),

                    PageElement.located(By.css('iframe')).switchTo(),
                    Ensure.that(Text.of(heading), equals('An iframe')),
                ),
            );

            it('correctly detects its invocation location', () => {
                const activity = PageElement.located(By.css('iframe')).switchTo();
                const location = activity.instantiationLocation();

                expect(location.path.basename()).to.equal('PageElement.spec.ts');
                expect(location.line).to.equal(129);
                expect(location.column).to.equal(72);
            });

            describe('and performing activities in the context of an iframe', () => {

                it('should automatically switch back to a parent frame from an iframe', () =>
                    actorCalled('Francesca').attemptsTo(
                        Navigate.to('/screenplay/models/page-element/page_with_an_iframe.html'),
                        Ensure.that(Text.of(heading), equals('Page with an iframe')),

                        Switch.to(PageElement.located(By.css('iframe'))).and(
                            Ensure.that(Text.of(heading), equals('An iframe')),
                        ),

                        Ensure.that(Text.of(heading), equals('Page with an iframe')),
                    ),
                );

                it('should automatically switch back to a parent frame from a nested iframe', () =>
                    actorCalled('Francesca').attemptsTo(
                        Navigate.to('/screenplay/models/page-element/page_with_a_nested_iframe.html'),
                        Ensure.that(Text.of(heading), equals('Page with a nested iframe')),

                        Switch.to(PageElement.located(By.css('iframe'))).and(
                            Ensure.that(Text.of(heading), equals('Page with an iframe')),

                            Switch.to(PageElement.located(By.css('iframe'))).and(
                                Ensure.that(Text.of(heading), equals('An iframe')),
                            ),
                        ),

                        Ensure.that(Text.of(heading), equals('Page with a nested iframe')),
                    ),
                );

                it('correctly detects its invocation location', () => {
                    const activity = Switch.to(PageElement.located(By.css('iframe'))).and(/* do nothing */);
                    const location = activity.instantiationLocation();

                    expect(location.path.basename()).to.equal('PageElement.spec.ts');
                    expect(location.line).to.equal(170);
                    expect(location.column).to.equal(87);
                });

                it('allows for a screenshot to be taken without affecting the browsing context', () =>
                    actorCalled('Francesca').attemptsTo(
                        Navigate.to('/screenplay/models/page-element/page_with_a_nested_iframe.html'),
                        Ensure.that(Text.of(heading), equals('Page with a nested iframe')),

                        TakeScreenshot.of('top-level context'),

                        Switch.to(PageElement.located(By.css('iframe'))).and(
                            TakeScreenshot.of('iframe context'),

                            Ensure.that(Text.of(heading), equals('Page with an iframe')),

                            Switch.to(PageElement.located(By.css('iframe'))).and(
                                TakeScreenshot.of('nested iframe context'),

                                Ensure.that(Text.of(heading), equals('An iframe')),
                            ),
                        ),

                        Ensure.that(Text.of(heading), equals('Page with a nested iframe')),
                    ),
                );

                it('allows for properties of the current frame to be retrieved without affecting the browsing context', () =>
                    actorCalled('Francesca').attemptsTo(
                        Navigate.to('/screenplay/models/page-element/page_with_a_nested_iframe.html'),
                        Ensure.that(Page.current().title(), equals('Page with a nested iframe')),

                        Switch.to(PageElement.located(By.css('iframe'))).and(
                            Ensure.that(Page.current().name(), equals('example-nested-iframe')),

                            Switch.to(PageElement.located(By.css('iframe'))).and(
                                Ensure.that(Page.current().name(), equals('example-iframe')),
                            ),
                        ),

                        Ensure.that(Page.current().title(), equals('Page with a nested iframe')),
                    ),
                );
            });
        });

        describe('when working with regular Web elements', () => {

            const inputField = PageElement.located(By.id('message'));
            const submitButton = PageElement.located(By.id('submit'));
            const result = PageElement.located(By.id('result'));

            it('should set focus on the element of interest', () =>
                actorCalled('Francesca').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/form.html'),

                    Switch.to(inputField),
                    Ensure.that(inputField, isActive()),
                ),
            );

            it('should switch focus from one element to another', () =>
                actorCalled('Francesca').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/form.html'),

                    Switch.to(inputField),
                    Ensure.that(inputField, isActive()),

                    Press.the('y'),

                    Switch.to(submitButton),
                    Ensure.that(submitButton, isActive()),

                    Press.the(Key.Enter),

                    Ensure.that(Value.of(result), equals('y')),
                ),
            );

            it('correctly detects its invocation location', () => {
                const activity = Switch.to(inputField);
                const location = activity.instantiationLocation();

                expect(location.path.basename()).to.equal('PageElement.spec.ts');
                expect(location.line).to.equal(254);
                expect(location.column).to.equal(41);
            });

            describe('and performing activities in the context of an Web element', () => {

                it('should automatically switch back to the previously focused element when the sequence is complete', () =>
                    actorCalled('Francesca').attemptsTo(
                        Navigate.to('/screenplay/models/page-element/form.html'),

                        Switch.to(submitButton),
                        Ensure.that(submitButton, isActive()),

                        Switch.to(inputField).and(
                            Press.the('y'),
                        ),

                        // automatically switch back to the previously-focused element
                        Ensure.that(submitButton, isActive()),

                        Press.the(Key.Enter),

                        Ensure.that(Value.of(result), equals('y')),
                    ),
                );

                it('should automatically switch back to previously-focused element in nested sequences', () =>
                    actorCalled('Francesca').attemptsTo(
                        Navigate.to('/screenplay/models/page-element/form.html'),

                        Switch.to(result).and(
                            Ensure.that(result, isActive()),

                            Switch.to(submitButton).and(
                                Ensure.that(submitButton, isActive()),

                                Switch.to(inputField).and(
                                    Press.the('y'),
                                ),

                                // automatically switch back to the previously-focused element
                                Ensure.that(submitButton, isActive()),
                                Press.the(Key.Enter),
                            ),

                            Ensure.that(result, isActive()),
                            Ensure.that(Value.of(result), equals('y')),
                        ),
                    ),
                );
            });
        });
    });

    it('provides a human-readable description', () => {
        const description = PageElement.located(By.css('iframe')).toString();

        expect(description).to.equal(`page element located by css ('iframe')`);
    });

    const draggable = () => PageElement.located(By.id('source')).describedAs('draggable');
    const dropzone = () => PageElement.located(By.id('target')).describedAs('drop zone');
    const dragEventOutput = () => PageElement.located(By.id('output')).describedAs('drag event output box');

    describe('dragTo()', () => {
        it('should successfully drag an element to the specified dropzone', () =>
            actorCalled('Francesca').attemptsTo(
                Navigate.to('/screenplay/models/page-element/drag_and_drop.html'),
                Drag.the(draggable()).to(dropzone()),
                Wait.until(Text.of(dragEventOutput()), and(includes('dragstart:'), includes('dragover:'), includes('drop:'))),
                Wait.until(draggable().of(dropzone()), isVisible()), // dragging doesn't necessarily change the location of the HTML element to be inside the dropzone, but our example does
            ));
    });
});

