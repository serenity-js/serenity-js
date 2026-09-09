import { Ensure, equals, includes, isPresent } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';

import { AboutView } from '../../../src/serenity/about/AboutView.serenity.js';

describe('AboutView', () => {

    it('renders the about content', async ({ story, actor }) => {
        const view = story('components/about/AboutView/Default').as(AboutView);

        await actor.attemptsTo(
            Ensure.that(view, isPresent()),
        );
    });

    it('displays confidence scoring explanation', async ({ story, actor }) => {
        const view = story('components/about/AboutView/Default').as(AboutView);

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('Confidence scoring')),
            Ensure.that(view.bodyText(), includes('Pass Rate')),
            Ensure.that(view.bodyText(), includes('Consistency')),
            Ensure.that(view.bodyText(), includes('Completeness')),
        );
    });

    it('displays glossary section', async ({ story, actor }) => {
        const view = story('components/about/AboutView/Default').as(AboutView);

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('Glossary')),
            Ensure.that(view.bodyText(), includes('Actor')),
            Ensure.that(view.bodyText(), includes('Ability')),
            Ensure.that(view.bodyText(), includes('Task')),
        );
    });

    it('links to serenity-js.org', async ({ story, actor }) => {
        const view = story('components/about/AboutView/Default').as(AboutView);

        await actor.attemptsTo(
            Ensure.that(view.hasLinkTo('https://serenity-js.org'), equals(true)),
        );
    });
});
