import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, replace, toNumber, trim } from '@serenity-js/core';

import { by, Navigate, Target, Text } from '../../../src';

describe('Text', () => {

    describe('of', () => {

        const header = Target.the('header').located(by.tagName('h1'));

        /** @test {Text.of} */
        it('allows the actor to read the text of the DOM element matching the locator', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/text/hello_world.html'),

                Ensure.that(Text.of(header), equals('Hello World!')),
            ));

        /** @test {Text.of} */
        /** @test {Text#toString} */
        it('produces a sensible description of the question being asked', () => {
            expect(Text.of(Target.the('header').located(by.tagName('h1'))).toString())
                .to.equal('the text of the header');
        });

        describe('when mapping', () => {

            /** @test {Text.of} */
            /** @test {Text#map} */
            it('allows for the answer to be mapped to another type', () =>
                actorCalled('Wendy').attemptsTo(

                    Navigate.to('/screenplay/questions/text/single_number_example.html'),

                    Ensure.that(Text.of(header).map(toNumber()), equals(2)),
                ));

            /** @test {Text.of} */
            /** @test {Text#map} */
            it('allows for the transformations to be chained', () =>
                actorCalled('Wendy').attemptsTo(

                    Navigate.to('/screenplay/questions/text/date_example.html'),

                    Ensure.that(
                        Text.of(header).map(trim()).map(actor => value => new Date(value)), // eslint-disable-line unicorn/consistent-function-scoping
                        equals(new Date('2020-09-11T19:53:18.160Z'))
                    ),
                ));
        });
    });

    describe('ofAll', () => {

        const Shopping_List_Items = Target.all('shopping list items').located(by.css('li'));

        /** @test {Text.ofAll} */
        it('allows the actor to read the text of all DOM elements matching the locator', () =>
            actorCalled('Wendy').attemptsTo(

                Navigate.to('/screenplay/questions/text/shopping_list.html'),

                Ensure.that(Text.ofAll(Shopping_List_Items), equals(['milk', 'oats'])),
            ));

        // todo: relative questions

        /** @test {Text.ofAll} */
        it('allows for a question relative to another target to be asked', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/text/shopping_list.html'),

                Ensure.that(
                    Text.ofAll(Shopping_List_Items).of(Target.the('body').located(by.tagName('body'))),
                    equals(['milk', 'oats'])
                ),
            ));

        /** @test {Text.ofAll} */
        /** @test {Text#toString} */
        it('produces sensible description of the question being asked', () => {
            expect(Text.ofAll(Shopping_List_Items).toString())
                .to.equal('the text of shopping list items');       // todo: the text of ALL, of THE ?
        });

        /** @test {Text.ofAll} */
        /** @test {Text#map} */
        it('allows for the answer to be mapped', () =>
            actorCalled('Wendy').attemptsTo(

                Navigate.to('/screenplay/questions/text/percentages.html'),

                Ensure.that(
                    Text.ofAll(Target.all('possible answers').located(by.css('#answers li')))
                        .map(trim())
                        .map(replace('%', ''))
                        .map(toNumber()),
                    equals([6.67, 3.34])
                ),
            ));
    });
});
