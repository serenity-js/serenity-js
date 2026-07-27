import { Ensure, equals, includes } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { Navigate, Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Capabilities', () => {

    describe('Deep Linking', () => {

        it('preserves selected filter in the URL', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),
                capabilitiesView.selectFilter('Healthy'),

                // Capture the URL with filter state
                notes().set('filteredUrl', Page.current().url().href),

                // Navigate away and back via the captured URL
                Navigate.to('/single/index.html'),
                Navigate.to(notes().get('filteredUrl')),

                // Verify the filter is restored
                Ensure.that(capabilitiesView.filterBar.activeFilters(), equals(['Healthy'])),
            );
        });

        it('preserves sort selection in the URL', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),
                capabilitiesView.selectSort('confidence'),

                notes().set('sortedUrl', Page.current().url().href),

                Navigate.to('/single/index.html'),
                Navigate.to(notes().get('sortedUrl')),

                Ensure.that(capabilitiesView.selectedSort(), equals('confidence')),
            );
        });

        it('restores combined filter, sort and search from URL', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                // Navigate directly to a deep link with all params
                Navigate.to('/single/index.html#/capabilities?filter=healthy&sort=confidence&search=todo'),

                Ensure.that(capabilitiesView.filterBar.activeFilters(), equals(['Healthy'])),
                Ensure.that(capabilitiesView.selectedSort(), equals('confidence')),
                Ensure.that(capabilitiesView.searchInput.value(), equals('todo')),
            );
        });

        it('preserves path param when filter changes', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                // Navigate to a specific capability via deep link
                Navigate.to('/single/index.html#/capabilities?path=e2e'),

                // Change a filter — the path param must survive
                capabilitiesView.selectFilter('Healthy'),

                Ensure.that(Page.current().url().href, includes('path=e2e')),
            );
        });
    });
});
