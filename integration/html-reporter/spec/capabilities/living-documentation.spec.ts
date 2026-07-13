import { Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Capabilities', () => {

    describe('Living Documentation', () => {

        it('navigates to filtered scenarios when clicking a spec file link in the README', async ({ actor, capabilitiesView, scenariosView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),
                capabilitiesView.followReadmeLink('Authentication'),

                Ensure.that(Page.current().url().href, includes('#/tests?search=')),
                Ensure.that(scenariosView.scenarioCount(), isGreaterThan(0)),
            );
        });

        it('navigates to a child capability when clicking a directory link in the README', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),
                capabilitiesView.followReadmeLink('End-to-End Flows'),

                Ensure.that(Page.current().url().href, includes('#/capabilities?path=e2e')),
                Ensure.that(capabilitiesView.scenarioCount(), includes('1')),
            );
        });

        it('preserves external links in the README without transformation', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.readmeLinkHref('Serenity/JS'), equals('https://serenity-js.org')),
            );
        });
    });
});
