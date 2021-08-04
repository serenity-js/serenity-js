import 'mocha';

import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals, startsWith } from '@serenity-js/assertions';
import { actorCalled, engage, Question } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { by, ElementFinder } from 'protractor';

import { Click, CSSClasses, Navigate, Target, Text } from '../../../src';
import { UIActors } from '../../UIActors';

/** @test {Target} */
describe('Target', () => {

    class ShoppingList {
        static App = Target.the('shopping list app').located(by.id('shopping-list-app'));
        static Progress = Target.the('progress bar').located(by.css('.progress')).of(ShoppingList.App);
        static Number_Of_Items_Left = Target.the('number of items left').of(ShoppingList.Progress).located(by.css('span'));

        static Header = Target.the('header').located(by.tagName('h1'));
        static List = Target.the('shopping list').located(by.tagName('ul'));
        static Items = Target.all('items').of(ShoppingList.App).located(by.tagName('li'));
        static Bought_Items = Target.all('bought items').located(by.css('.bought')).of(ShoppingList.List);
    }

    beforeEach(() =>
        engage(new UIActors())
    );

    describe('allows the actor to locate', () => {

        /**
         * @test {Target}
         * @test {Target.the}
         * @test {TargetElement}
         */
        it('a single web element matching the selector', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.of(ShoppingList.Header), equals('Shopping list')),
            ));

        /**
         * @test {Target}
         * @test {Target.all}
         * @test {TargetElements}
         */
        it('all web elements matching the selector', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.ofAll(ShoppingList.Items), contain('oats')),
            ));

        /**
         * @test {Target}
         * @test {Target.the}
         * @test {TargetNestedElement}
         * @test {TargetNestedElement#of}
         */
        it('an element relative to another target', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.of(ShoppingList.Number_Of_Items_Left), equals('2')),
            ));

        /**
         * @test {Target}
         * @test {Target.all}
         * @test {TargetNestedElements}
         * @test {TargetNestedElements#of}
         */
        it('all elements relative to another target', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.ofAll(ShoppingList.Bought_Items), equals(['coffee'])),
            ));
    });

    describe('provides a sensible description of', () => {

        describe('an element that', () => {

            /**
             * @test {Target}
             * @test {Target.the}
             * @test {TargetElement}
             */
            it('is being targeted', () => {
                expect(ShoppingList.Header.toString())
                    .to.equal('the header');
            });

            /**
             * @test {Target}
             * @test {Target.the}
             * @test {TargetElement}
             */
            it('has been located', () => {
                expect(ShoppingList.Header.answeredBy(actorCalled('Peter')).toString())
                    .to.equal('the header');
            });

            /**
             * @test {Target}
             * @test {Target.the}
             * @test {TargetNestedElement}
             * @test {TargetNestedElement#of}
             */
            it('is nested', () =>
                expect(ShoppingList.Number_Of_Items_Left.answeredBy(actorCalled('Peter')).toString())
                    .to.equal('the number of items left of the progress bar of the shopping list app'));
        });

        describe('elements that', () => {

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements}
             */
            it('are being targeted', () => {
                expect(ShoppingList.Items.toString())
                    .to.equal('the items of the shopping list app');
            });

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements}
             */
            it('have been located', () =>
                expect(ShoppingList.Items.answeredBy(actorCalled('Peter')).toString())
                    .to.equal('the items of the shopping list app'));

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('are nested', () =>
                expect(ShoppingList.Bought_Items.answeredBy(actorCalled('Peter')).toString())
                    .to.equal('the bought items of the shopping list'));
        });
    });

    describe('when nesting targets', () => {

        class Page {
            static Article = Target.the('article').located(by.css('article'));
            static Header = Target.the('header').located(by.css('header'));
            static Title = Target.the('title').located(by.css('h1'));
            static TOC = Target.the('table of contents').located(by.css('ul#toc'));
            static Topics = Target.all('topics').located(by.css('li'));
            static Topic_Number = Target.the('topic number').located(by.css('.number'));
        }

        /**
         * @test {Target}
         * @test {Target.the}
         * @test {TargetElement#of}
         * @test {TargetNestedElement}
         */
        it('allows for Target<ElementFinder> to be nested within another Target<ElementFinder>', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                Ensure.that(Text.of(Page.Header.of(Page.Article)), equals('Title')),
                Ensure.that(Page.Header.of(Page.Article).toString(), equals('the header of the article')),
            ));

        /**
         * @test {Target}
         * @test {Target.the}
         * @test {TargetElement#of}
         * @test {TargetNestedElement}
         * @test {TargetNestedElement#of}
         */
        it('allows for Target<ElementFinder> to form a chain with other Target<ElementFinder>s', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                Ensure.that(Text.of(Page.Title.of(Page.Header).of(Page.Article)), equals('Title')),
                Ensure.that(Page.Title.of(Page.Header.of(Page.Article)).toString(), equals('the title of the header of the article')),
            ));

        /**
         * @test {Target}
         * @test {Target.all}
         * @test {TargetElements#of}
         * @test {TargetNestedElements}
         * @test {TargetNestedElements#of}
         */
        it('allows for Target<ElementArrayFinder> to be nested within another Target<ElementFinder>', () =>
            actorCalled('Peter').attemptsTo(
                Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                Ensure.that(Text.ofAll(Page.Topics.of(Page.TOC).of(Page.Article)), equals(['topic 1', 'topic 2', 'topic 3'])),
                Ensure.that(Page.Topics.of(Page.TOC).of(Page.Article).toString(), equals('the topics of the table of contents of the article')),
            ));

        describe('and filtering them', () => {

            const filteredTopics = Page.Topics.of(Page.TOC).where(Text.of(Page.Topic_Number), equals('2'));

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('allows for nested Target<ElementArrayFinder> to be filtered', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                    Ensure.that(
                        Text.ofAll(filteredTopics),
                        equals(['topic 2']),
                    ),
                    Ensure.that(
                        filteredTopics.toString(),
                        equals(`the topics of the table of contents where the text of the topic number does equal '2'`),
                    ),
                ));

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('allows for nested Target<ElementArrayFinder> to be counted', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                    Ensure.that(
                        filteredTopics.count(),
                        equals(1),
                    ),
                ));

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('allows for the first of nested Target<ElementArrayFinder> to be retrieved', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                    Ensure.that(
                        Text.of(filteredTopics.first()),
                        equals('topic 2'),
                    ),
                ));

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('allows for the last of nested Target<ElementArrayFinder> to be retrieved', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                    Ensure.that(
                        Text.of(filteredTopics.last()),
                        equals('topic 2'),
                    ),
                ));

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('allows for the nth of nested Target<ElementArrayFinder> to be retrieved', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/nested_targets.html'),

                    Ensure.that(
                        Text.of(filteredTopics.get(0)),
                        equals('topic 2'),
                    ),
                ));
        });
    });

    describe('when filtering a list of targets', () => {

        class AdvancedShoppingList {
            static Items = Target.all('shopping list items').located(by.css('li'));
            static Item = Target.the('shopping list item').located(by.css('li'));
            static Titles = Target.all('shopping list item titles').located(by.css('li span.item-name'));
            static Item_Name = Target.the('item name').located(by.tagName('span.item-name'));
            static Item_Names = Target.all('item names').located(by.tagName('span.item-name'));
        }

        describe('and no filters are applied', () => {

            describe('lets the actor interact with the list of matching elements so that it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#count}
                 */
                it('gets the number of items', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(AdvancedShoppingList.Titles.count(), equals(3)),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks all the items', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(AdvancedShoppingList.Titles), contain('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 * @test {TargetElements#first}
                 */
                it('picks the first item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(AdvancedShoppingList.Titles.first()), equals('oats')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 * @test {TargetElements#last}
                 */
                it('picks the last item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(AdvancedShoppingList.Titles.last()), equals('coffee')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 * @test {TargetElements#get}
                 */
                it('picks the nth item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(AdvancedShoppingList.Titles.get(1)), equals('coconut milk')),
                    ));
            });

            describe('provides a sensible description when it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#count}
                 * @test {TargetElements#toString}
                 */
                it('returns the number of items', () =>
                    expect(AdvancedShoppingList.Items.count().toString())
                        .to.equal('the number of the shopping list items'));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#toString}
                 */
                it('picks all the items', () =>
                    expect(AdvancedShoppingList.Items.toString())
                        .to.equal('the shopping list items'));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#first}
                 * @test {TargetElements#toString}
                 */
                it('picks the first item', () =>
                    expect(AdvancedShoppingList.Items.first().toString())
                        .to.equal('the first of the shopping list items'));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#last}
                 * @test {TargetElements#toString}
                 */
                it('picks the last item', () =>
                    expect(AdvancedShoppingList.Items.last().toString())
                        .to.equal('the last of the shopping list items'));

                given([
                    { description: '1st', index: 0 },
                    { description: '2nd', index: 1 },
                    { description: '3rd', index: 2 },
                    { description: '4th', index: 3 },
                    { description: '5th', index: 4 },
                    { description: '10th', index: 9 },
                    { description: '11th', index: 10 },
                    { description: '20th', index: 19 },
                    { description: '42nd', index: 41 },
                    { description: '115th', index: 114 },
                    { description: '1522nd', index: 1521 },
                ]).it('picks the nth item', ({ description, index }) => {
                    expect(AdvancedShoppingList.Items.get(index).toString())
                        .to.equal(`the ${ description } of the shopping list items`);
                });
            });
        });

        describe('and a filter is applied', () => {

            const list = AdvancedShoppingList.Items.where(CSSClasses, contain('buy'));

            describe('lets the actor filter the list of matching elements so that it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('gets the number of items', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(list.count(), equals(2)),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks all the items', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks the first item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('oats')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks the last item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks the nth item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.get(1)), startsWith('coconut milk')),
                    ));
            });

            describe('provides a sensible description when it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('returns the number of items', () =>
                    expect(list.count().toString())
                        .to.equal(`the number of the shopping list items where CSSClasses property does contain 'buy'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks all the items', () =>
                    expect(list.toString())
                        .to.equal(`the shopping list items where CSSClasses property does contain 'buy'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the first item', () =>
                    expect(list.first().toString())
                        .to.equal(`the first of the shopping list items where CSSClasses property does contain 'buy'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the last item', () =>
                    expect(list.last().toString())
                        .to.equal(`the last of the shopping list items where CSSClasses property does contain 'buy'`));

                given([
                    { description: '1st', index: 0 },
                    { description: '2nd', index: 1 },
                    { description: '3rd', index: 2 },
                    { description: '4th', index: 3 },
                    { description: '5th', index: 4 },
                    { description: '10th', index: 9 },
                    { description: '11th', index: 10 },
                    { description: '20th', index: 19 },
                    { description: '42nd', index: 41 },
                    { description: '115th', index: 114 },
                    { description: '1522nd', index: 1521 },
                ]).it('picks the nth item', ({ description, index }) => {
                    expect(list.get(index).toString()).to.equal(`the ${ description } of the shopping list items where CSSClasses property does contain 'buy'`);
                });
            });
        });

        describe('and multiple filters are applied', () => {

            const list = AdvancedShoppingList.Items.where(CSSClasses, contain('buy')).where(Text, startsWith('coconut'));

            describe('lets the actor filter the list of matching elements so that it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('gets the number of items', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(list.count(), equals(1)),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks all the items', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the first item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the last item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the nth item', () =>
                    actorCalled('Peter').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.get(0)), startsWith('coconut milk')),
                    ));
            });

            describe('provides a sensible description when it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('returns the number of answers', () =>
                    expect(list.count().toString())
                        .to.equal(`the number of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks all the items', () =>
                    expect(list.toString())
                        .to.equal(`the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the first item', () =>
                    expect(list.first().toString())
                        .to.equal(`the first of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the last item', () =>
                    expect(list.last().toString())
                        .to.equal(`the last of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`));

                given([
                    { description: '1st', index: 0 },
                    { description: '2nd', index: 1 },
                    { description: '3rd', index: 2 },
                    { description: '4th', index: 3 },
                    { description: '5th', index: 4 },
                    { description: '10th', index: 9 },
                    { description: '11th', index: 10 },
                    { description: '20th', index: 19 },
                    { description: '42nd', index: 41 },
                    { description: '115th', index: 114 },
                    { description: '1522nd', index: 1521 },
                ]).it('picks the nth item', ({ description, index }) => {
                    expect(list.get(index).toString())
                        .to.equal(`the ${ description } of the shopping list items where CSSClasses property does contain 'buy' and Text property does start with 'coconut'`);
                });
            });
        });

        describe('and interacting with elements on screen', () => {

            const ItemCalled = (name: string) =>    // eslint-disable-line unicorn/consistent-function-scoping
                AdvancedShoppingList.Items
                    .where(Text.of(AdvancedShoppingList.Item_Name), equals(name))
                    .first();

            const ItemsLeftToBuy = () =>            // eslint-disable-line unicorn/consistent-function-scoping
                AdvancedShoppingList.Items
                    .where(CSSClasses, contain('buy'));

            // eslint-disable-next-line unicorn/consistent-function-scoping
            const LinkTo = (item: Question<ElementFinder> | ElementFinder) =>
                Target.the('link to element').of(item).located(by.css('a'));

            /**
             * @test {Target}
             * @test {Target.all}
             */
            it('makes it easy for an actor to pick the element of interest', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                    Click.on(LinkTo(ItemCalled('coffee'))),

                    Ensure.that(CSSClasses.of(ItemCalled('coffee')), contain('buy')),
                ));

            /**
             * @test {Target}
             * @test {Target.all}
             */
            it('makes it easy for an actor to pick all elements of interest', () =>
                actorCalled('Peter').attemptsTo(
                    Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                    Click.on(LinkTo(ItemCalled('coconut milk'))),
                    Click.on(LinkTo(ItemCalled('coffee'))),

                    Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals(['oats x', 'coffee x'])),
                ));
        });
    });
});
