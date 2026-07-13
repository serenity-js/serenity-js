import { contain, Ensure, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Capabilities', () => {

    describe('Capability Health', () => {

        it('shows the overall confidence score for the project', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.confidence(), includes('85')),
            );
        });

        it('lists feature areas with their scenario counts', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.childCapabilityNames(), contain('authentication')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('checkout')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('todo')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('End-to-End Flows')),
            );
        });
    });
});
