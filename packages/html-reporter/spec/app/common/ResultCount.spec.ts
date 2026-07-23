import { Ensure, equals } from '@serenity-js/assertions';

import { ResultCount } from '../../../src/serenity/common/ResultCount.serenity.js';
import { describe, it } from '../fixtures.js';

describe('ResultCount', () => {

    it('displays "Showing X of Y label" when showing fewer than total', async ({ mount, actor }) => {
        const resultCount = await mount({
            component: 'ResultCount',
            importPath: './components/common/ResultCount',
            props: { showing: 5, total: 20, label: 'test scenarios' },
            interactionObject: ResultCount,
        });

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 5 of 20 test scenarios')),
        );
    });

    it('displays "Showing X of X label" when showing equals total', async ({ mount, actor }) => {
        const resultCount = await mount({
            component: 'ResultCount',
            importPath: './components/common/ResultCount',
            props: { showing: 20, total: 20, label: 'test scenarios' },
            interactionObject: ResultCount,
        });

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 20 of 20 test scenarios')),
        );
    });

    it('handles singular counts', async ({ mount, actor }) => {
        const resultCount = await mount({
            component: 'ResultCount',
            importPath: './components/common/ResultCount',
            props: { showing: 1, total: 1, label: 'test' },
            interactionObject: ResultCount,
        });

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 1 of 1 test')),
        );
    });

    it('shows filtered count with capabilities label', async ({ mount, actor }) => {
        const resultCount = await mount({
            component: 'ResultCount',
            importPath: './components/common/ResultCount',
            props: { showing: 3, total: 15, label: 'capabilities' },
            interactionObject: ResultCount,
        });

        await actor.attemptsTo(
            Ensure.that(resultCount.text(), equals('Showing 3 of 15 capabilities')),
        );
    });
});
