import { Ensure, equals } from '@serenity-js/assertions';

import { describe, it } from '@serenity-js/playwright-test';
import { ResultCount } from '../../../src/serenity/common/ResultCount.serenity.js';

describe('ResultCount', () => {

    it('displays "Showing X of Y label" when showing fewer than total', async ({ story, actor }) => {
        const resultCount = story('components/common/ResultCount/Default', {
            showing: 5, total: 20, label: 'test scenarios',
        }).as(ResultCount);

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 5 of 20 test scenarios')),
        );
    });

    it('displays "Showing X of X label" when showing equals total', async ({ story, actor }) => {
        const resultCount = story('components/common/ResultCount/Default', {
            showing: 20, total: 20, label: 'test scenarios',
        }).as(ResultCount);

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 20 of 20 test scenarios')),
        );
    });

    it('handles singular counts', async ({ story, actor }) => {
        const resultCount = story('components/common/ResultCount/Default', {
            showing: 1, total: 1, label: 'test',
        }).as(ResultCount);

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 1 of 1 test')),
        );
    });

    it('shows filtered count with capabilities label', async ({ story, actor }) => {
        const resultCount = story('components/common/ResultCount/Default', {
            showing: 3, total: 15, label: 'capabilities',
        }).as(ResultCount);

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 3 of 15 capabilities')),
        );
    });
});
