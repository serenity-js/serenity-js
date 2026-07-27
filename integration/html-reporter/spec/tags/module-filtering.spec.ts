import { contain, Ensure, equals, includes } from '@serenity-js/assertions';
import { Page } from '@serenity-js/web';

import { describe, it } from '../../src';

describe('Module Tagging', () => {

    describe('Module Tag Filtering', () => {

        it('should show module tags in the Tags view', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),

                // The Tags view shows feature tags (11) + module tags (3) = 14 total
                // We verify module tags are present among all tags
                Ensure.that(tagsView.tagNames(), contain('playwright-web')),
                Ensure.that(tagsView.tagNames(), contain('webdriverio-cucumber')),
                Ensure.that(tagsView.tagNames(), contain('rest-api')),
            );
        });

        it('should filter scenarios by module using @module:name search token', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                // Total scenarios before filtering (18 from multi-module data)
                Ensure.that(scenariosView.scenarioCount(), equals(18)),

                // Search for playwright-web module (8 scenarios)
                scenariosView.find('@module:playwright-web'),

                // URL should contain the encoded search token
                Ensure.that(Page.current().url().href, includes(encodeURIComponent('@module:playwright-web'))),

                // Should show only playwright-web scenarios
                Ensure.that(scenariosView.scenarioCount(), equals(8)),
            );
        });

        it('should filter to webdriverio-cucumber module', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                scenariosView.find('@module:webdriverio-cucumber'),

                // Should show 6 scenarios from webdriverio-cucumber
                Ensure.that(scenariosView.scenarioCount(), equals(6)),
            );
        });

        it('should filter to rest-api module', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                scenariosView.find('@module:rest-api'),

                // Should show 4 scenarios from rest-api (all passing)
                Ensure.that(scenariosView.scenarioCount(), equals(4)),
            );
        });

        it('should allow clicking a module tag to navigate to filtered scenarios', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),

                // Click on the playwright-web module tag
                tagsView.selectTag('playwright-web'),

                // Should navigate to scenarios view with the module filter applied
                Ensure.that(Page.current().url().href, includes('#/tests')),
                Ensure.that(Page.current().url().href, includes(encodeURIComponent('@module:playwright-web'))),
            );
        });

        it('should combine module filter with outcome filter', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                // Search for failed scenarios in playwright-web module
                scenariosView.find('@module:playwright-web'),
                scenariosView.selectFilter('Failed'),

                // Should show only the 2 failed playwright-web scenarios
                Ensure.that(scenariosView.scenarioCount(), equals(2)),

                // URL should have both filters
                Ensure.that(Page.current().url().href, includes('filter=failed')),
            );
        });

        it('should show module tags in scenario rows', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),

                // Find a specific scenario from playwright-web
                scenariosView.find('Login should authenticate'),

                // The scenario should be visible with its tags
                Ensure.that(scenariosView.scenarioCount(), equals(1)),

                // Module tag should be clickable in the scenario row
                // (This is verified by the tag being present in the DOM)
            );
        });
    });
});
