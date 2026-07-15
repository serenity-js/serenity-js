import { Ensure, equals, includes } from '@serenity-js/assertions';

import { AboutView } from '../../../src/serenity/about/AboutView.serenity.js';
import { describe, it } from '../fixtures.js';

describe('AboutView', () => {

    it('renders the about content', async ({ mount, actor }) => {
        const view = await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
            interactionObject: AboutView,
        });

        await actor.attemptsTo(
            Ensure.that(view.isVisible(), equals(true)),
        );
    });

    it('displays confidence scoring explanation', async ({ mount, actor }) => {
        const view = await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
            interactionObject: AboutView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('Confidence scoring')),
            Ensure.that(view.bodyText(), includes('Pass Rate')),
            Ensure.that(view.bodyText(), includes('Consistency')),
            Ensure.that(view.bodyText(), includes('Completeness')),
        );
    });

    it('displays glossary section', async ({ mount, actor }) => {
        const view = await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
            interactionObject: AboutView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('Glossary')),
            Ensure.that(view.bodyText(), includes('Actor')),
            Ensure.that(view.bodyText(), includes('Ability')),
            Ensure.that(view.bodyText(), includes('Task')),
        );
    });

    it('links to serenity-js.org', async ({ mount, actor }) => {
        const view = await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
            interactionObject: AboutView,
        });

        await actor.attemptsTo(
            Ensure.that(view.hasLinkTo('https://serenity-js.org'), equals(true)),
        );
    });
});
