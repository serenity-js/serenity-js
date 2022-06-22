import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled, LogicError } from '@serenity-js/core';
import { Attribute, By, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

/** @test {Attribute} */
describe('Attribute', () => {

    /** @test {Attribute.of} */
    describe('of', () => {

        const dom = PageElement.located(By.css('html')).describedAs('DOM');

        const body = PageElement.located(By.css('body')).describedAs('document body');

        before(() =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/attribute/language.html'),
            ));

        it('allows the actor to read an attribute of a DOM element matching the locator', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Attribute.called('lang').of(dom), equals('en')),
            ));

        it('produces a sensible description of the question being asked', () => {
            expect(Attribute.called('lang').of(dom).toString())
                .to.equal(`'lang' attribute of DOM`);
        });

        it('complains if the target is not specified', () =>
            expect(actorCalled('Wendy').attemptsTo(
                Ensure.that(Attribute.called('lang'), equals('en')),
            )).to.be.rejectedWith(LogicError, `Couldn't read attribute 'lang' of an unspecified page element.`));

        it('produces a QuestionAdapter that enables access to the underlying value', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(
                    Attribute.called('lang').of(dom).length,
                    equals(2),
                ),
                Ensure.that(
                    Attribute.called('lang').of(dom).toLocaleUpperCase(),
                    equals('EN'),
                ),
            ));

        it('allows for a meta-question relative to another PageElement to be asked', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(
                    Attribute.called('class').of(body).of(dom),
                    equals('example-class'),
                ),
            ));
    });

    /** @test {Attribute.called} */
    describe('filtering', () => {

        const ItemsOfInterest =
            PageElements.located(By.css('li'))
                .describedAs('items of interest')
                .where(Attribute.called('class'), equals('enabled'))

        before(() =>
            actorCalled('Wendy').attemptsTo(
                Navigate.to('/screenplay/questions/attribute/lists.html'),
            ));

        it('can be used to filter a list of elements', () =>
            actorCalled('Wendy').attemptsTo(
                Ensure.that(Text.ofAll(ItemsOfInterest), equals(['one', 'three'])),
            ));
    });

    /** @test {Attribute#toString} */
    describe('toString', () => {

        const sections  = PageElements.located(By.css('section')).describedAs('sections');
        const section   = PageElement.located(By.css('section')).describedAs('a section');
        const heading   = PageElement.located(By.css('h1')).describedAs('the heading');

        it('provides a human-readable description of a regular question', () => {
            const description = Attribute.called('role').of(heading).toString();

            expect(description).to.equal(`'role' attribute of the heading`)
        });

        it('allows for the description to be altered', () => {
            const description = Attribute.called('role').describedAs('accessibility role').toString();

            expect(description).to.equal(`accessibility role`)
        });

        it('provides a human-readable description of the meta-question', () => {
            const description = Attribute.called('role').of(heading).of(section).toString();

            expect(description).to.equal(`'role' attribute of the heading of a section`)
        });

        it('provides a human-readable description of a reqular question used in a filter', () => {
            const found = sections.where(Attribute.called('role'), equals('navigation'));

            const description = found.toString();

            expect(description).to.equal(`sections where 'role' attribute does equal 'navigation'`)
        });

        it('provides a human-readable description of a meta-question used in a filter', () => {
            const found = sections
                .where(Attribute.called('role').of(heading), equals('navigation'));

            const description = found.toString();

            expect(description).to.equal(`sections where 'role' attribute of the heading does equal 'navigation'`)
        });
    });
});
