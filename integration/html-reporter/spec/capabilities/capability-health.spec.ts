import { contain, Ensure, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Capabilities', () => {

    describe('Capability Health', () => {

        it('shows the overall confidence percentage', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.confidence(), includes('%')),
            );
        });

        it('lists feature capabilities with scenario counts', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.scenarioCount(), includes('20')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('authentication')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('checkout')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('todo')),
            );
        });

        it('allows drilling into failing scenarios within a capability', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.childCapabilityNames(), contain('todo')),
                Ensure.that(capabilitiesView.scenarioCount(), includes('scenario')),
            );
        });
    });
});
