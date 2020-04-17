import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { by } from 'protractor';
import { Navigate, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';

/** @test {Target} */
describe('Target', () => {

    const shoppingListPage = pageFromTemplate(`
        <html>
            <body>
                <div id="shopping-list-app">
                    <h1>Shopping <span>list</span></h1>
                    <h2 class="progress"><span>2</span> out of 3</h2>
                    <ul>
                        <li class="buy">oats</li>
                        <li class="buy">coconut milk</li>
                        <li class="bought">coffee</li>
                    </ul>
                </div>
            </body>
        </html>
    `);

    class ShoppingList {
        static App                  = Target.the('shopping list app').located(by.id('shopping-list-app'));
        static Progress             = Target.the('progress bar').located(by.css('.progress')).of(ShoppingList.App);
        static Number_Of_Items_Left = Target.the('number of items left').of(ShoppingList.Progress).located(by.css('span'));

        static Header       = Target.the('header').located(by.tagName('h1'));
        static List         = Target.the('shopping list').located(by.tagName('ul'));
        static Items        = Target.all('items').of(ShoppingList.App).located(by.tagName('li'));
        static Bought_Items = Target.all('bought items').located(by.css('.bought')).of(ShoppingList.List);
    }

    describe('allows the actor to locate', () => {

        /**
         * @test {Target}
         * @test {TargetElement}
         */
        it('a single web element matching the selector', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.of(ShoppingList.Header), equals('Shopping list')),
        ));

        /**
         * @test {Target}
         * @test {TargetElements}
         */
        it('all web elements matching the selector', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.ofAll(ShoppingList.Items), contain('oats')),
        ));

        /**
         * @test {Target}
         * @test {TargetNestedElement}
         */
        it('an element relative to another target', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.of(ShoppingList.Number_Of_Items_Left), equals('2')),
        ));

        /**
         * @test {Target}
         * @test {TargetNestedElements}
         */
        it('all elements relative to another target', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(shoppingListPage),

            Ensure.that(Text.ofAll(ShoppingList.Bought_Items), equals(['coffee'])),
        ));
    });

    describe('provides a sensible description of', () => {

        describe('an element that', () => {

            /**
             * @test {Target}
             * @test {TargetElement}
             */
            it('is being targeted', () => {
                expect(ShoppingList.Header.toString())
                    .to.equal('the header');
            });

            /**
             * @test {Target}
             * @test {TargetElement}
             */
            it('has been located', () => {
                expect(ShoppingList.Header.answeredBy(actorCalled('Bernie')).toString())
                    .to.equal('the header');
            });

            /**
             * @test {Target}
             * @test {TargetNestedElement}
             */
            it('is nested', () =>
                expect(ShoppingList.Number_Of_Items_Left.answeredBy(actorCalled('Bernie')).toString())
                    .to.equal('the number of items left of the progress bar of the shopping list app'));
        });

        describe('elements that', () => {

            /**
             * @test {Target}
             * @test {TargetElements}
             */
            it('are being targeted', () => {
                expect(ShoppingList.Items.toString())
                    .to.equal('the items of the shopping list app');
            });

            /**
             * @test {Target}
             * @test {TargetElements}
             */
            it('have been located', () =>
                expect(ShoppingList.Items.answeredBy(actorCalled('Bernie')).toString())
                    .to.equal('the items of the shopping list app'));

            /**
             * @test {Target}
             * @test {TargetNestedElements}
             */
            it('are nested', () =>
                expect(ShoppingList.Bought_Items.answeredBy(actorCalled('Bernie')).toString())
                    .to.equal('the bought items of the shopping list'));
        });
    });

    describe('when nesting targets', () => {
        const pageWithNestedTargets = pageFromTemplate(`
            <html>
                <body>
                    <article>
                        <header>
                            <h1>Title</h1>
                        </header>
                        <ul id="toc">
                            <li>topic 1</li>
                            <li>topic 2</li>
                            <li>topic 3</li>
                        </ul>
                    </article>
                </body>
            </html>
        `);

        class Page {
            static Article = Target.the('article').located(by.css('article'));
            static Header  = Target.the('header').located(by.css('header'));
            static Title   = Target.the('title').located(by.css('h1'));
            static TOC     = Target.the('table of contents').located(by.css('ul#toc'));
            static Topics  = Target.all('topics').located(by.css('li'));
        }

        /**
         * @test {Target}
         * @test {TargetNestedElement}
         */
        it('allows for Target<ElementFinder> to be nested within another Target<ElementFinder>', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageWithNestedTargets),

            Ensure.that(Text.of(Page.Header.of(Page.Article)), equals('Title')),
            Ensure.that(Page.Header.of(Page.Article).toString(), equals('the header of the article')),
        ));

        /**
         * @test {Target}
         * @test {TargetNestedElement}
         */
        it('allows for Target<ElementFinder> to form a chain with other Target<ElementFinder>s', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageWithNestedTargets),

            Ensure.that(Text.of(Page.Title.of(Page.Header).of(Page.Article)), equals('Title')),
            Ensure.that(Page.Title.of(Page.Header.of(Page.Article)).toString(), equals('the title of the header of the article')),
        ));

        /**
         * @test {Target}
         * @test {TargetNestedElements}
         */
        it('allows for Target<ElementArrayFinder> to be nested within another Target<ElementFinder>', () => actorCalled('Bernie').attemptsTo(
            Navigate.to(pageWithNestedTargets),

            Ensure.that(Text.ofAll(Page.Topics.of(Page.TOC).of(Page.Article)), equals(['topic 1', 'topic 2', 'topic 3'])),
            Ensure.that(Page.Topics.of(Page.TOC).of(Page.Article).toString(), equals('the topics of the table of contents of the article')),
        ));
    });
});
