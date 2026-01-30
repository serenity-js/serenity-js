import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals, isPresent, startsWith } from '@serenity-js/assertions';
import { actorCalled, Question } from '@serenity-js/core';
import { By, Navigate, PageElement, Text } from '@serenity-js/web';
import { Attribute } from '@serenity-js/web';

/** @test {PageElement} */
describe('PageElement', () => {

    const question = <T>(name: string, value: T) =>
        Question.about(name, _actor => value);

    describe('when locating an element', () => {

        describe('by role', () => {

            const Elements = {
                submitButton:   PageElement.located(By.role('button', { name: 'Submit' })).describedAs('submit button'),
                textbox:        PageElement.located(By.role('textbox', { name: 'Email Address' })).describedAs('email address textbox'),
                checkbox:       PageElement.located(By.role('checkbox', { name: 'Subscribe' })).describedAs('subscribe checkbox'),
                heading:        PageElement.located(By.role('heading', { name: 'Fruits List', level: 2 })).describedAs('fruits list heading with leading and trailing whitespace'),
                list:           PageElement.located(By.role('list')).describedAs('fruits list'),
                listItem:       PageElement.located(By.role('listitem', { name: 'Apple' })).describedAs('apple list item'),
                homeLink:       PageElement.located(By.role('link', { name: 'Home' })).describedAs('home link with explicit aria role'),
                aboutLink:      PageElement.located(By.role('link', { name: 'About' })).describedAs('about link with no explicit aria role'),
                alert:          PageElement.located(By.role('alert')).describedAs('alert message'),
                progressbar:    PageElement.located(By.role('progressbar')).describedAs('loading progress bar'),
                navigation:     PageElement.located(By.role('navigation', { name: 'Main menu' })).describedAs('main menu navigation'),
                banner:         PageElement.located(By.role('banner')).describedAs('page banner'),
                main:           PageElement.located(By.role('main')).describedAs('main content area'),
                form:           PageElement.located(By.role('form', { name: 'Signup' })).describedAs('signup form'),
                someButton:     PageElement.located(By.role('button', { name: 'Some_button' })).describedAs('some button'),
            };

            beforeEach(() =>
                actorCalled('Elle').attemptsTo(
                    Navigate.to('/screenplay/models/page-element/by_role.html'),
                ));

            it('generates a description for a PageElement without a custom description', () => {
                expect(PageElement.located(By.role('button', { name: 'Submit' })).toString())
                    .to.equal(`page element located by role "button" (name: 'Submit')`)
            });

            it('generates a description for a PageElement without a custom description, where the selector is provided as question', () => {
                expect(PageElement.located(By.role('button', { name: question('button name', 'Submit') })).toString())
                    .to.equal(`page element located by role "button" (name: <<button name>>)`);
            });

            it('uses a custom description when provided', () => {
                expect(PageElement.located(By.role('button', { name: 'Submit' })).describedAs('the confirmation button').toString())
                    .to.equal(`the confirmation button`);
            });

            it('can locate an element by its role alone', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Elements.banner, isPresent()),
                );
            });

            it('can locate a button by its role and name', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Elements.submitButton, isPresent()),
                );
            });

            it('can locate an input by its aria label', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Elements.checkbox, isPresent()),
                );
            });

            it('can locate a heading by its role, name and level', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Text.of(Elements.heading), equals('Fruits List')),
                );
            });

            it('can locate a button by its aria-labelledby property', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Text.of(Elements.someButton), equals('Click Me!')),
                );
            });

            it('can locate an element by its aria-label property', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Elements.navigation.html(), startsWith('<nav role="navigation" aria-label="Main menu">')),
                );
            });

            it('can locate an element by its role and content', async () => {
                await actorCalled('Elle').attemptsTo(
                    Ensure.that(Attribute.called('href').of(Elements.homeLink), equals('#home')),
                );
            });
        });
    });
});
