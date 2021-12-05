import 'mocha';

import { expect } from '@integration/testing-tools';
import { contain, Ensure, equals, startsWith } from '@serenity-js/assertions';
import { actorCalled, Answerable } from '@serenity-js/core';
import { Click, CssClasses, Navigate, PageElement, PageElementList, TakeScreenshot, Text } from '@serenity-js/web';
import { given } from 'mocha-testdata';

/**
 * @test {Target}
 */
describe('Target', () => {

    class ShoppingList {
        static app = PageElement.locatedById('shopping-list-app').describedAs('shopping list app');
        static progress = PageElement.locatedByCss('.progress').describedAs('progress bar').of(ShoppingList.app);
        static numberOfItemsLeft = PageElement.locatedByCss('span').describedAs('number of items left').of(ShoppingList.progress);

        static header = PageElement.locatedByTagName('h1').describedAs('header');
        static list = PageElement.locatedByTagName('ul').describedAs('shopping list');
        static items = PageElementList.locatedByTagName('li').describedAs('items').of(ShoppingList.app);
        static boughtItems = PageElementList.locatedByCss('.bought').describedAs('bought items').of(ShoppingList.list);
    }

    describe('allows the actor to locate', () => {

        /**
         * @test {Target}
         * @test {TargetElement}
         */
        it('a single web element matching the selector', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.of(ShoppingList.header), equals('Shopping list')),
            ));

        /**
         * @test {Target}
         * @test {TargetElements}
         */
        it('all web elements matching the selector', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.ofAll(ShoppingList.items), contain('oats')),
            ));

        /**
         * @test {Target}
         * @test {Target.the}
         * @test {TargetNestedElement}
         * @test {TargetNestedElement#of}
         */
        it('an element relative to another target', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.of(ShoppingList.numberOfItemsLeft), equals('2')),
            ));

        /**
         * @test {Target}
         * @test {Target.all}
         * @test {TargetNestedElements}
         * @test {TargetNestedElements#of}
         */
        it('all elements relative to another target', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/targets/shopping_list.html'),

                Ensure.that(Text.ofAll(ShoppingList.boughtItems), equals([ 'coffee' ])),
            ));
    });

    // todo: re-introduce list filters
    describe.skip('provides a sensible description of', () => {

        describe('an element that', () => {

            /**
             * @test {Target}
             * @test {Target.the}
             * @test {TargetElement}
             */
            it('is being targeted', () => {
                expect(ShoppingList.header.toString())
                    .to.equal('the header');
            });

            /**
             * @test {Target}
             * @test {Target.the}
             * @test {TargetNestedElement}
             * @test {TargetNestedElement#of}
             */
            it('is nested', () => {
                expect(ShoppingList.numberOfItemsLeft.toString())
                    .to.equal('number of items left of the progress bar of the shopping list app');
            });
        });

        describe('elements that', () => {

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements}
             */
            it('are being targeted', () => {
                expect(ShoppingList.items.toString())
                    .to.equal('items of the shopping list app');
            });

            /**
             * @test {Target}
             * @test {Target.all}
             * @test {TargetElements#of}
             * @test {TargetNestedElements}
             */
            it('are nested', () => {
                expect(ShoppingList.boughtItems.toString())
                    .to.equal('bought items of the shopping list');
            });
        });
    });

    describe('when filtering a list of targets', () => {

        class AdvancedShoppingList {
            static Items = PageElementList.locatedByCss('li').describedAs('shopping list items');
            static Item = PageElement.locatedByCss('li').describedAs('shopping list item');
            static Titles = PageElementList.locatedByCss('li span.item-name').describedAs('shopping list item titles');
            static Item_Name = PageElement.locatedByCss('span.item-name').describedAs('item name');
            static Item_Names = PageElementList.locatedByCss('span.item-name').describedAs('item names');
        }

        describe('and no filters are applied', () => {

            describe('lets the actor interact with the list of matching elements so that it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#count}
                 */
                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(AdvancedShoppingList.Titles.count(), equals(3)),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
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
                    actorCalled('Wendy').attemptsTo(
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
                    actorCalled('Wendy').attemptsTo(
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
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(AdvancedShoppingList.Titles.get(1)), equals('coconut milk')),
                    ));
            });

            // todo: re-introduce list filters
            describe.skip('provides a sensible description when it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#count}
                 * @test {TargetElements#toString}
                 */
                it('returns the number of items', () =>
                    expect(AdvancedShoppingList.Items.count().toString())
                        .to.equal('the number of shopping list items'));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#toString}
                 */
                it('picks all the items', () =>
                    expect(AdvancedShoppingList.Items.toString())
                        .to.equal('shopping list items'));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#first}
                 * @test {TargetElements#toString}
                 */
                it('picks the first item', () =>
                    expect(AdvancedShoppingList.Items.first().toString())
                        .to.equal('the first of shopping list items'));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements#last}
                 * @test {TargetElements#toString}
                 */
                it('picks the last item', () =>
                    expect(AdvancedShoppingList.Items.last().toString())
                        .to.equal('the last of shopping list items'));

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
                        .to.equal(`the ${ description } of shopping list items`);
                });
            });
        });

        describe('and a filter is applied', () => {
            // todo: re-introduce list filters
            //  AdvancedShoppingList.Items.where(CssClasses, contain('buy'));
            const list = AdvancedShoppingList.Items.filter(async element => {
                const cssClasses = (await element.attribute('class')).split(/\s+/);
                return cssClasses.some(cssClass => cssClass === 'buy');
            });

            describe('lets the actor filter the list of matching elements so that it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(list.count(), equals(2)),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks the first item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('oats')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks the last item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 * @test {TargetElements}
                 */
                it('picks the nth item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.get(1)), startsWith('coconut milk')),
                    ));
            });

            // todo: re-introduce list filters
            describe.skip('provides a sensible description when it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('returns the number of items', () =>
                    expect(list.count().toString())
                        .to.equal(`the number of shopping list items where CssClasses does contain 'buy'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks all the items', () =>
                    expect(list.toString())
                        .to.equal(`shopping list items where CssClasses does contain 'buy'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the first item', () =>
                    expect(list.first().toString())
                        .to.equal(`the first of shopping list items where CssClasses does contain 'buy'`));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the last item', () =>
                    expect(list.last().toString())
                        .to.equal(`the last of shopping list items where CssClasses does contain 'buy'`));

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
                    expect(list.get(index).toString()).to.equal(`the ${ description } of shopping list items where CssClasses does contain 'buy'`);
                });
            });
        });

        describe('and multiple filters are applied', () => {

            // todo: re-introduce list filters
            //  const list = AdvancedShoppingList.Items
            //      .where(CssClasses, contain('buy'))
            //      .where(Text, startsWith('coconut'));

            const list = AdvancedShoppingList.Items.filter(async element => {
                const cssClasses =  (await element.attribute('class')).split(/\s+/);
                const text =        (await element.text());

                return cssClasses.some(cssClass => cssClass === 'buy')
                    && text.startsWith('coconut');
            });

            describe('lets the actor filter the list of matching elements so that it', () => {

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('gets the number of items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(list.count(), equals(1)),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks all the items', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.ofAll(list), contain('coconut milk x')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the first item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.first()), startsWith('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the last item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.last()), startsWith('coconut milk')),
                    ));

                /**
                 * @test {Target}
                 * @test {Target.all}
                 */
                it('picks the nth item', () =>
                    actorCalled('Wendy').attemptsTo(
                        Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),

                        Ensure.that(Text.of(list.get(0)), startsWith('coconut milk')),
                    ));
            });

            // todo: re-introduce list filters
            describe.skip('provides a sensible description when it', () => {

                // /**
                //  * @test {Target}
                //  * @test {Target.all}
                //  */
                // it('returns the number of answers', () =>
                //     expect(list.count().toString())
                //         .to.equal(`the number of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));
                //
                // /**
                //  * @test {Target}
                //  * @test {Target.all}
                //  */
                // it('picks all the items', () =>
                //     expect(list.toString())
                //         .to.equal(`shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));
                //
                // /**
                //  * @test {Target}
                //  * @test {Target.all}
                //  */
                // it('picks the first item', () =>
                //     expect(list.first().toString())
                //         .to.equal(`the first of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));
                //
                // /**
                //  * @test {Target}
                //  * @test {Target.all}
                //  */
                // it('picks the last item', () =>
                //     expect(list.last().toString())
                //         .to.equal(`the last of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`));
                //
                // given([
                //     { description: '1st', index: 0 },
                //     { description: '2nd', index: 1 },
                //     { description: '3rd', index: 2 },
                //     { description: '4th', index: 3 },
                //     { description: '5th', index: 4 },
                //     { description: '10th', index: 9 },
                //     { description: '11th', index: 10 },
                //     { description: '20th', index: 19 },
                //     { description: '42nd', index: 41 },
                //     { description: '115th', index: 114 },
                //     { description: '1522nd', index: 1521 },
                // ]).it('picks the nth item', ({ description, index }) => {
                //     expect(list.get(index).toString())
                //         .to.equal(`the ${ description } of shopping list items where CssClasses does contain 'buy' and Text does start with 'coconut'`);
                // });
            });
        });

        // todo: re-introduce list filters
        describe.skip('and interacting with elements on screen', () => {

            // const ItemCalled = (name: string) =>    // eslint-disable-line unicorn/consistent-function-scoping
            //     AdvancedShoppingList.Items
            //         .where(Text.of(AdvancedShoppingList.Item_Name), equals(name))
            //         .first();
            //
            // const ItemsLeftToBuy = () =>            // eslint-disable-line unicorn/consistent-function-scoping
            //     AdvancedShoppingList.Items
            //         .where(CssClasses, contain('buy'));
            //
            // // eslint-disable-next-line unicorn/consistent-function-scoping
            // const LinkTo = (item: Answerable<PageElement>) =>
            //     PageElement.locatedByCss('a').describedAs('link to element').of(item);
            //
            // /**
            //  * @test {Target}
            //  * @test {Target.all}
            //  */
            // it('makes it easy for an actor to pick the element of interest', () =>
            //     actorCalled('Wendy').attemptsTo(
            //         Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),
            //         Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coconut milk x' ])),
            //         Click.on(LinkTo(ItemCalled('coffee'))),
            //         Ensure.that(CssClasses.of(ItemCalled('coffee')), contain('buy')),
            //     ));
            //
            // /**
            //  * @test {Target}
            //  * @test {Target.all}
            //  */
            // it('makes it easy for an actor to pick all elements of interest', () =>
            //     actorCalled('Wendy').attemptsTo(
            //         Navigate.to('/screenplay/questions/targets/advanced_shopping_list.html'),
            //         Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coconut milk x' ])),
            //
            //         Click.on(LinkTo(ItemCalled('coconut milk'))),
            //         TakeScreenshot.of('first'),
            //         Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x' ])),
            //
            //         Click.on(LinkTo(ItemCalled('coffee'))),
            //         TakeScreenshot.of('second'),
            //         Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coffee x' ])),
            //
            //         Ensure.that(Text.ofAll(ItemsLeftToBuy()), equals([ 'oats x', 'coffee x' ])),
            //     ));
        });
    });
});
