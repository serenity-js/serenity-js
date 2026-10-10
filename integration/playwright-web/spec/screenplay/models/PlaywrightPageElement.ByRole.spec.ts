import 'mocha';

import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';
import type { ByRoleSelectorOptions, ByRoleSelectorValue } from '@serenity-js/web';
import { By, Navigate, PageElement, PageElements, Text } from '@serenity-js/web';

/**
 * Playwright supports every By.role option, so these examples go beyond
 * the ones in @integration/web-specs, which also run against WebdriverIO.
 */
/** @test {PlaywrightPageElement} */
describe('PlaywrightPageElement', () => {

    const elementsWithRole = (role: ByRoleSelectorValue, options: ByRoleSelectorOptions = {}) =>
        PageElements.located(By.role(role, options)).describedAs(`${ role } elements`);

    beforeEach(() =>
        actorCalled('Rhea').attemptsTo(
            Navigate.to('/screenplay/models/page-element/by_role_options.html'),
        ));

    describe('when locating elements by role', () => {

        it('matches the name as a case-insensitive substring by default', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { name: 'save' })), equals([ 'Save', 'Save draft', 'Save' ])),
            );
        });

        it('matches the name exactly when asked to', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { name: 'Save', exact: true })), equals([ 'Save', 'Save' ])),
            );
        });

        it('matches the name against a regular expression', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { name: /draft$/ })), equals([ 'Save draft' ])),
            );
        });

        it('matches a regular expression that contains quotes', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { name: /say "hello"/i })), equals([ 'Say "hello"' ])),
            );
        });

        it('matches names that contain quotes', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { name: 'Say "hello"', exact: true })), equals([ 'Say "hello"' ])),
            );
        });

        it('matches names that contain backslashes', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { name: 'Back\\slash', exact: true })), equals([ 'Back\\slash' ])),
            );
        });

        it('filters elements by their checked state', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(elementsWithRole('checkbox', { checked: true }).count(), equals(1)),
                Ensure.that(elementsWithRole('checkbox', { checked: false }).count(), equals(1)),
            );
        });

        it('filters elements by their disabled state', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { disabled: true })), equals([ 'Disabled action' ])),
            );
        });

        it('filters elements by their pressed state', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { pressed: true })), equals([ 'Bold' ])),
            );
        });

        it('filters elements by their expanded state', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button', { expanded: false })), equals([ 'Collapsed menu' ])),
            );
        });

        it('filters elements by their selected state', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('tab', { selected: true })), equals([ 'First tab' ])),
            );
        });

        it('filters headings by their level', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('heading', { level: 3 })), equals([ 'Sub heading' ])),
            );
        });

        it('ignores hidden elements unless asked to include them', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(elementsWithRole('button', { name: 'Hidden action' }).count(), equals(0)),
                Ensure.that(elementsWithRole('button', { name: 'Hidden action', includeHidden: true }).count(), equals(1)),
            );
        });

        it('treats an element that does not exist as not present', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(PageElement.located(By.role('button', { name: 'Delete' })), not(isPresent())),
            );
        });
    });

    describe('when locating elements by role within a parent element', () => {

        const settingsDialog = () =>
            PageElement.located(By.role('dialog', { name: 'Settings' })).describedAs('settings dialog');

        it('locates a single element within the parent', async () => {
            const saveButton = PageElement.located(By.role('button', { name: 'Save', exact: true })).describedAs('save button');

            await actorCalled('Rhea').attemptsTo(
                Ensure.that(saveButton.of(settingsDialog()), isPresent()),
                Ensure.that(Text.of(saveButton.of(settingsDialog())), equals('Save')),
            );
        });

        it('locates all the matching elements within the parent', async () => {
            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.ofAll(elementsWithRole('button').of(settingsDialog())), equals([ 'Save', 'Cancel' ])),
            );
        });

        it('locates a parent element by role and a child element by CSS', async () => {
            const cancelButton = PageElement.located(By.css('button:last-child')).describedAs('last button');

            await actorCalled('Rhea').attemptsTo(
                Ensure.that(Text.of(cancelButton.of(settingsDialog())), equals('Cancel')),
            );
        });
    });
});
