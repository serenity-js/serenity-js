import { Ensure, equals } from '@serenity-js/assertions';

import { AboutView } from '../../../src/serenity/about/AboutView.serenity.js';
import { describe, expect, it } from '../fixtures.js';

describe('AboutView interaction object', () => {

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
});

describe('AboutView', () => {

    it('displays confidence scoring explanation', async ({ mount, page }) => {
        await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
        });

        await expect(page.locator('body')).toContainText('Confidence scoring');
        await expect(page.locator('body')).toContainText('Pass Rate');
        await expect(page.locator('body')).toContainText('Consistency');
        await expect(page.locator('body')).toContainText('Completeness');
    });

    it('displays glossary section', async ({ mount, page }) => {
        await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
        });

        await expect(page.locator('body')).toContainText('Glossary');
        await expect(page.locator('body')).toContainText('Actor');
        await expect(page.locator('body')).toContainText('Ability');
        await expect(page.locator('body')).toContainText('Task');
    });

    it('links to serenity-js.org', async ({ mount, page }) => {
        await mount({
            component: 'AboutView',
            importPath: './components/about/AboutView',
        });

        await expect(page.locator('a[href="https://serenity-js.org"]')).toBeVisible();
    });
});
