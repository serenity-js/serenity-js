import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { By, PageElement, Value } from '@serenity-js/web';

import { describe, it } from '../../../spec/app/story-fixtures.js';
import { SearchInput } from '../../../src/serenity/common/SearchInput.serenity.js';

describe('SearchInput', () => {

    it('displays the default placeholder', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find test scenarios...')),
        );
    });

    it('displays a custom placeholder', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '', placeholder: 'Find capabilities...' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find capabilities...')),
        );
    });

    it('is not clearable when the value is empty', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.isClearable(), isFalse()),
        );
    });

    it('is clearable when the value is non-empty', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: 'hello' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.isClearable(), isTrue()),
        );
    });

    it('allows typing a search term', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '' },
        });

        await actor.attemptsTo(
            searchInput.searchFor('hello'),
            Ensure.that(searchInput.value(), equals('hello')),
        );
    });

    it('triggers onInput callback when typing', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/WithInput', {
            props: { value: '' },
        });

        await actor.attemptsTo(
            searchInput.searchFor('a'),
            Ensure.that(
                Value.of(PageElement.located(By.css('[data-testid="input-value"]'))),
                equals('a'),
            ),
        );
    });

    it('triggers onInput with empty string when cleared', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/WithInput', {
            props: { value: 'something' },
        });

        await actor.attemptsTo(
            searchInput.clear(),
            Ensure.that(
                Value.of(PageElement.located(By.css('[data-testid="input-value"]'))),
                equals(''),
            ),
        );
    });

    it('uses the placeholder as the label by default', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Find test scenarios')),
        );
    });

    it('strips trailing ellipsis from placeholder for the label', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '', placeholder: 'Find capabilities...' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Find capabilities')),
        );
    });

    it('uses a custom label when provided', async ({ interactionObject, actor }) => {
        const searchInput = await interactionObject(SearchInput, 'components/common/SearchInput/Default', {
            props: { value: '', ariaLabel: 'Search everything' },
        });

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Search everything')),
        );
    });
});
