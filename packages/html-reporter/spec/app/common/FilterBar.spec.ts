import { contain, Ensure, equals } from '@serenity-js/assertions';

import { FilterBar } from '../../../src/serenity/common/FilterBar.serenity.js';
import { describe, it } from '../fixtures.js';

describe('FilterBar', () => {

    it('displays all filter chip labels', async ({ interactionObject, actor }) => {
        const filterBar = await interactionObject(FilterBar, './components/common/FilterBar', {
            props: {
                filters: [
                    { key: 'all', label: 'All', count: 10 },
                    { key: 'passed', label: 'Passed', count: 7 },
                    { key: 'failed', label: 'Failed', count: 2 },
                    { key: 'skipped', label: 'Skipped', count: 1 },
                ],
                activeFilter: 'all',
                onFilter: '__noop',
            },
        });

        await actor.attemptsTo(
            Ensure.that(filterBar.filterLabels(), equals(['All', 'Passed', 'Failed', 'Skipped'])),
        );
    });

    it('reports active filter via aria-pressed', async ({ interactionObject, actor }) => {
        const filterBar = await interactionObject(FilterBar, './components/common/FilterBar', {
            props: {
                filters: [
                    { key: 'all', label: 'All', count: 10 },
                    { key: 'passed', label: 'Passed', count: 7 },
                    { key: 'failed', label: 'Failed', count: 2 },
                    { key: 'skipped', label: 'Skipped', count: 1 },
                ],
                activeFilter: 'failed',
                onFilter: '__noop',
            },
        });

        await actor.attemptsTo(
            Ensure.that(filterBar.activeFilters(), equals(['Failed'])),
        );
    });

    it('reports multiple active filters when multi-selected', async ({ interactionObject, actor }) => {
        const filterBar = await interactionObject(FilterBar, './components/common/FilterBar', {
            props: {
                filters: [
                    { key: 'all', label: 'All', count: 10 },
                    { key: 'passed', label: 'Passed', count: 7 },
                    { key: 'failed', label: 'Failed', count: 2 },
                    { key: 'skipped', label: 'Skipped', count: 1 },
                ],
                activeFilter: 'failed,skipped',
                onFilter: '__noop',
            },
        });

        await actor.attemptsTo(
            Ensure.that(filterBar.activeFilters(), contain('Failed')),
            Ensure.that(filterBar.activeFilters(), contain('Skipped')),
        );
    });

    it('reports selected sort option', async ({ interactionObject, actor }) => {
        const filterBar = await interactionObject(FilterBar, './components/common/FilterBar', {
            props: {
                filters: [
                    { key: 'all', label: 'All', count: 5 },
                    { key: 'passed', label: 'Passed', count: 5 },
                ],
                activeFilter: 'all',
                onFilter: '__noop',
                sortOptions: [
                    { key: 'name', label: 'Name' },
                    { key: 'duration', label: 'Duration' },
                ],
                activeSort: 'duration',
            },
        });

        await actor.attemptsTo(
            Ensure.that(filterBar.selectedSort(), equals('duration')),
        );
    });

    it('shows "All" as active when no specific filter is selected', async ({ interactionObject, actor }) => {
        const filterBar = await interactionObject(FilterBar, './components/common/FilterBar', {
            props: {
                filters: [
                    { key: 'all', label: 'All', count: 5 },
                    { key: 'passed', label: 'Passed', count: 3 },
                    { key: 'failed', label: 'Failed', count: 2 },
                ],
                activeFilter: 'all',
                onFilter: '__noop',
            },
        });

        await actor.attemptsTo(
            Ensure.that(filterBar.activeFilters(), equals(['All'])),
        );
    });
});
