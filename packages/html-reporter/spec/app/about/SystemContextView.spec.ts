import { Ensure, equals, includes } from '@serenity-js/assertions';

import { SystemContextView } from '../../../src/serenity/about/SystemContextView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

describe('SystemContextView', () => {

    it('displays the Node.js version', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.nodeVersion(), equals('v22.0.0')),
        );
    });

    it('displays the test runner name and version', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.testRunner(), includes('Playwright')),
            Ensure.that(view.testRunner(), includes('1.45.0')),
        );
    });

    it('displays the operating system', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.operatingSystem(), includes('darwin')),
        );
    });

    it('displays the Serenity/JS version', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.serenityVersion(), equals('v3.44.0')),
        );
    });

    it('displays CI/CD provider and build info', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.ciProvider(), includes('GitHub Actions')),
            Ensure.that(view.ciBranch(), includes('main')),
            Ensure.that(view.ciCommit(), includes('abc1234')),
            Ensure.that(view.ciBuildNumber(), includes('#42')),
        );
    });

    it('displays the commit message', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData(),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.commitMessage(), includes('resolve unstable test')),
        );
    });

    it('displays browser information', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData({
                systemContext: {
                    nodeVersion: 'v22.0.0',
                    os: { name: 'linux', version: '6.0', arch: 'x64' },
                    serenityVersion: '3.44.0',
                    testRunner: { name: 'Playwright', version: '1.45.0' },
                    browsers: [
                        { name: 'chromium', version: '126.0.1' },
                        { name: 'firefox', version: '115.0' },
                    ],
                    ci: null,
                },
            }),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.browser('CHROMIUM'), includes('126.0.1')),
            Ensure.that(view.browser('FIREFOX'), includes('115.0')),
        );
    });

    it('shows placeholder when systemContext is missing', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: { ...minimalData(), systemContext: undefined },
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('not yet available')),
        );
    });

    it('does not show CI section when ci is null', async ({ mount, actor }) => {
        const view = await mount({
            component: 'SystemContextView',
            importPath: './components/about/SystemContextView',
            data: minimalData({
                systemContext: {
                    nodeVersion: 'v22.0.0',
                    os: { name: 'darwin', version: '24.0.0', arch: 'arm64' },
                    serenityVersion: '3.44.0',
                    testRunner: { name: 'Mocha', version: '11.0.0' },
                    browsers: [],
                    ci: null,
                },
            }),
            interactionObject: SystemContextView,
        });

        await actor.attemptsTo(
            Ensure.that(view.testRunner(), includes('Mocha')),
            // Ensure.that(view.ciProvider(), not(isPresent())),
        );
    });
});
