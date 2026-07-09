import { Ensure, equals } from '@serenity-js/assertions';

import { OutcomeBadge } from '../../src/serenity/OutcomeBadge.serenity.js';
import { describe, it } from './fixtures.js';

describe('OutcomeBadge', () => {

    it('displays the correct icon for a passing outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/OutcomeBadge',
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
            importPath: './components/OutcomeBadge',
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
            importPath: './components/OutcomeBadge',
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
            importPath: './components/OutcomeBadge',
            props: { outcome: 'ERROR' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('!')),
        );
    });

    it('applies the correct CSS class for the outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/OutcomeBadge',
            props: { outcome: 'SUCCESS' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('passed')),
        );
    });

    it('applies the failed class for FAILURE outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/OutcomeBadge',
            props: { outcome: 'FAILURE' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('failed')),
        );
    });

    it('applies the compromised class for COMPROMISED outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/OutcomeBadge',
            props: { outcome: 'COMPROMISED' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('compromised')),
        );
    });

    it('displays the correct icon for a skipped outcome', async ({ mount, actor }) => {
        const badge = await mount({
            component: 'OutcomeBadge',
            importPath: './components/OutcomeBadge',
            props: { outcome: 'SKIPPED' },
            interactionObject: OutcomeBadge,
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('⊘')),
            Ensure.that(badge.outcomeType(), equals('skipped')),
        );
    });
});
