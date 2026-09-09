import { Ensure, equals, isFalse, isTrue } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { By, PageElement, Value } from '@serenity-js/web';

import { SearchInput } from '../../../src/serenity/common/SearchInput.serenity.js';

describe('SearchInput', () => {

    it('displays the default placeholder', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find test scenarios...')),
        );
    });

    it('displays a custom placeholder', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '', placeholder: 'Find capabilities...',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.placeholder(), equals('Find capabilities...')),
        );
    });

    it('is not clearable when the value is empty', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.isClearable(), isFalse()),
        );
    });

    it('is clearable when the value is non-empty', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: 'hello',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.isClearable(), isTrue()),
        );
    });

    it('allows typing a search term', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '',
        }).as(SearchInput);

        await actor.attemptsTo(
            searchInput.searchFor('hello'),
            Ensure.that(searchInput.value(), equals('hello')),
        );
    });

    it('triggers onInput callback when typing', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/WithInput', {
            value: '',
        }).as(SearchInput);

        await actor.attemptsTo(
            searchInput.searchFor('a'),
            Ensure.that(
                Value.of(PageElement.located(By.css('[data-testid="input-value"]'))),
                equals('a'),
            ),
        );
    });

    it('triggers onInput with empty string when cleared', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/WithInput', {
            value: 'something',
        }).as(SearchInput);

        await actor.attemptsTo(
            searchInput.clear(),
            Ensure.that(
                Value.of(PageElement.located(By.css('[data-testid="input-value"]'))),
                equals(''),
            ),
        );
    });

    it('uses the placeholder as the label by default', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Find test scenarios')),
        );
    });

    it('strips trailing ellipsis from placeholder for the label', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '', placeholder: 'Find capabilities...',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Find capabilities')),
        );
    });

    it('uses a custom label when provided', async ({ story, actor }) => {
        const searchInput = story('components/common/SearchInput/Default', {
            value: '', ariaLabel: 'Search everything',
        }).as(SearchInput);

        await actor.attemptsTo(
            Ensure.that(searchInput.label(), equals('Search everything')),
        );
    });
});
