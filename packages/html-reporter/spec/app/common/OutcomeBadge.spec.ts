import { Ensure, equals } from '@serenity-js/assertions';

import { OutcomeBadge } from '../../../src/serenity/common/OutcomeBadge.serenity.js';
import { describe, it } from '../fixtures.js';

describe('OutcomeBadge', () => {

    it('displays the correct icon for a passing outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'SUCCESS' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('✓')),
        );
    });

    it('displays the correct icon for a failing outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'FAILURE' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('✗')),
        );
    });

    it('displays the correct icon for a pending outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'PENDING' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('–')),
        );
    });

    it('displays the correct icon for an error outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'ERROR' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('!')),
        );
    });

    it('reports the outcome type for SUCCESS', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'SUCCESS' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('SUCCESS')),
        );
    });

    it('reports the outcome type for FAILURE', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'FAILURE' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('FAILURE')),
        );
    });

    it('reports the outcome type for COMPROMISED', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'COMPROMISED' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('COMPROMISED')),
        );
    });

    it('displays the correct icon for a skipped outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/common/OutcomeBadge',
            props: { outcome: 'SKIPPED' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('⊘')),
            Ensure.that(badge.outcomeType(), equals('SKIPPED')),
        );
    });
});
