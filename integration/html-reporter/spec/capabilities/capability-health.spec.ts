import { and, contain, Ensure, includes } from '@serenity-js/assertions';

import { describe, it } from '../../src';

describe('Capabilities', () => {

    describe('Capability Health', () => {

        it('shows the overall confidence score for the project', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.confidence(), includes('85')),
            );
        });

        it('lists feature areas with their scenario counts', { tag: '@showcase' }, async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.childCapabilityNames(), and(
                    contain('authentication'),
                    contain('checkout'),
                    contain('todo'),
                    contain('End-to-End Flows'),
                )),
            );
        });
    });
});
