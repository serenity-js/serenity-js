import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import { Attribute, By, Navigate, PageElement, PageElements, Value } from '@serenity-js/web';

/** @test {Value} */
describe('Value', () => {

    /** @test {Value.of} */
    describe('of', () => {

        const input = PageElement.located(By.tagName('input')).describedAs('username field');
        const form = PageElement.located(By.tagName('form')).describedAs(`form`);

        before(() =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/value/username_form.html'),
            ));

        it('allows the actor to read the "value" attribute of a DOM element matching the locator', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Value.of(input), equals('jan-molak')),
            ));

        it('allows for a meta-question relative to another PageElement to be asked', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(
                    Value.of(input).of(form),
                    equals('jan-molak'),
                ),
            ));

        it('produces a sensible description of the question being asked', () => {
            expect(Value.of(input).toString())
                .to.equal(`the value of username field`);
        });

        it('produces a QuestionAdapter that enables access to the underlying value', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(
                    Value.of(input).length,
                    equals(9),
                ),
                Ensure.that(
                    Value.of(input).toLocaleUpperCase(),
                    equals('JAN-MOLAK'),
                ),
            ));
    });

    describe('filtering', () => {

        const NonEmptyInput =
            PageElements.located(By.css('input'))
                .describedAs('input elements with non-empty value')
                .where(Value, not(equals('')))
                .first();

        before(() =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/value/filtering.html'),
            ));

        it('can be used to filter a list of elements', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Attribute.called('name').of(NonEmptyInput), equals('non-empty')),
            ));
    });

    /** @test {Value#toString} */
    describe('toString', () => {

        const sections  = PageElements.located(By.css('section')).describedAs('sections');
        const section   = PageElement.located(By.css('section')).describedAs('a section');
        const input     = PageElement.located(By.css('input')).describedAs('input field');

        it('provides a human-readable description of a regular question', () => {
            const description = Value.of(input).toString();

            expect(description).to.equal(`the value of input field`)
        });

        it('allows for the description to be altered', () => {
            const description = Value.of(input).describedAs('username').toString();

            expect(description).to.equal(`username`)
        });

        it('provides a human-readable description of the meta-question', () => {
            const description = Value.of(input).of(section).toString();

            expect(description).to.equal(`the value of input field of a section`)
        });

        it('provides a human-readable description of a reqular question used in a filter', () => {
            const found = sections.where(Value, equals('example'));

            const description = found.toString();

            expect(description).to.equal(`sections where Value does equal 'example'`)
        });

        it('provides a human-readable description of a meta-question used in a filter', () => {
            const found = sections
                .where(Value.of(input), equals('example'));

            const description = found.toString();

            expect(description).to.equal(`sections where the value of input field does equal 'example'`)
        });
    });
});
