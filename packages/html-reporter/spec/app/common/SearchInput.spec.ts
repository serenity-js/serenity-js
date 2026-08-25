import { contain, Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';

import { SearchInput } from '../../../src/serenity/common/SearchInput.serenity.js';
import { beforeEach, describe, it } from '../fixtures.js';

describe('SearchInput', () => {

    beforeEach(async ({ page }) => {
        await page.exposeFunction('__noop', () => { /* noop */ });
    });

    it('displays the default placeholder', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__noop' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find test scenarios...')),
        );
    });

    it('displays a custom placeholder', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__noop', placeholder: 'Find capabilities...' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find capabilities...')),
        );
    });

    it('is not clearable when the value is empty', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__noop' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.isClearable(), isFalse()),
        );
    });

    it('is clearable when the value is non-empty', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: 'hello', onInput: '__noop' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.isClearable(), isTrue()),
        );
    });

    it('allows typing a search term', async ({ interactionObject, actor, page }) => {
        await page.exposeFunction('__onInput__', () => { /* noop */ });

        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__onInput__' },
        });

        await actor.attemptsTo(
            searchInput.enter('hello'),
            Ensure.that(searchInput.value(), equals('hello')),
        );
    });

    it('triggers onInput callback when typing', async ({ interactionObject, actor, page }) => {
        const receivedValues: string[] = [];
        await page.exposeFunction('__onInput__', (value: string) => { receivedValues.push(value); });

        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__onInput__' },
        });

        await actor.attemptsTo(
            searchInput.enter('a'),
            Ensure.that(receivedValues, contain('a')),
        );
    });

    it('triggers onInput with empty string when cleared', async ({ interactionObject, actor, page }) => {
        const receivedValues: string[] = [];
        await page.exposeFunction('__onInput__', (value: string) => { receivedValues.push(value); });

        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: 'something', onInput: '__onInput__' },
        });

        await actor.attemptsTo(
            searchInput.clear(),
            Ensure.that(receivedValues, contain('')),
        );
    });

    it('uses the placeholder as the label by default', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__noop' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Find test scenarios')),
        );
    });

    it('strips trailing ellipsis from placeholder for the label', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__noop', placeholder: 'Find capabilities...' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Find capabilities')),
        );
    });

    it('uses a custom label when provided', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, './components/common/SearchInput', {
            props: { value: '', onInput: '__noop', ariaLabel: 'Search everything' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Search everything')),
        );
    });
});
