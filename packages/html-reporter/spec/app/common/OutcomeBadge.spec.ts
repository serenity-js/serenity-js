import { Ensure, equals } from '@serenity-js/assertions';

import { OutcomeBadge } from '../../../src/serenity/common/OutcomeBadge.serenity.js';
import { describe, it } from '../fixtures.js';

describe('OutcomeBadge', () => {

    it('displays the correct icon for a passing outcome', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'SUCCESS' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('✓')),
        );
    });

    it('displays the correct icon for a failing outcome', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'FAILURE' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('✗')),
        );
    });

    it('displays the correct icon for a pending outcome', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'PENDING' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('–')),
        );
    });

    it('displays the correct icon for an error outcome', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'ERROR' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('!')),
        );
    });

    it('reports the outcome type for SUCCESS', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'SUCCESS' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('SUCCESS')),
        );
    });

    it('reports the outcome type for FAILURE', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'FAILURE' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('FAILURE')),
        );
    });

    it('reports the outcome type for COMPROMISED', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'COMPROMISED' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('COMPROMISED')),
        );
    });

    it('displays the correct icon for a skipped outcome', async ({ interactionObject, actor }) => {
        const badge = await interactionObject(OutcomeBadge, './components/common/OutcomeBadge', {
            props: { outcome: 'SKIPPED' },
        });

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('⊘')),
            Ensure.that(badge.outcomeType(), equals('SKIPPED')),
        );
    });
});
