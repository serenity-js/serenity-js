import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { Attribute, By, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

describe('Attribute', () => {

    describe('called', () => {

        const dom = PageElement.located(By.tagName('html')).describedAs('DOM');

        /** @test {Attribute.called} */
        it('allows the actor to read an attribute of a DOM element matching the locator', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/attribute/language.html'),

                Ensure.that(Attribute.called('lang').of(dom), equals('en')),
            ));

        /** @test {Attribute.called} */
        /** @test {Attribute#toString} */
        it('produces a sensible description of the question being asked', () => {
            expect(Attribute.called('lang').of(dom).toString())
                .to.equal('"lang" attribute of DOM');
        });

        /** @test {Attribute.called} */
        it('complains if the target is not specified', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/attribute/language.html'),

                Ensure.that(Attribute.called('lang'), equals('en')),
            )).to.be.rejectedWith(LogicError, `Target not specified`));

        const ItemsOfInterest = PageElements.located(By.tagName('li')).describedAs('items of interest')
            .where(Attribute.called('class'), equals('enabled'))

        /** @test {Attribute.called} */
        /** @test {Target.all} */
        it('can be used to filter a list of elements', () =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/attribute/lists.html'),

                Ensure.that(Text.ofAll(ItemsOfInterest), equals(['one', 'three'])),
            ));
    });
});
