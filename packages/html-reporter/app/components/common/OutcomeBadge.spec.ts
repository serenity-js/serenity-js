import { Ensure, equals } from '@serenity-js/assertions';

import { describe, it } from '@serenity-js/playwright-test';
import { OutcomeBadge } from '../../../src/serenity/common/OutcomeBadge.serenity.js';

describe('OutcomeBadge', () => {

    it('displays the correct icon for a passing outcome', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'SUCCESS',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('✓')),
        );
    });

    it('displays the correct icon for a failing outcome', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'FAILURE',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('✗')),
        );
    });

    it('displays the correct icon for a pending outcome', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'PENDING',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('–')),
        );
    });

    it('displays the correct icon for an error outcome', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'ERROR',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('!')),
        );
    });

    it('reports the outcome type for SUCCESS', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'SUCCESS',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('SUCCESS')),
        );
    });

    it('reports the outcome type for FAILURE', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'FAILURE',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('FAILURE')),
        );
    });

    it('reports the outcome type for COMPROMISED', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'COMPROMISED',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.outcomeType(), equals('COMPROMISED')),
        );
    });

    it('displays the correct icon for a skipped outcome', async ({ story, actor }) => {
        const badge = story('components/common/OutcomeBadge/Default', {
            outcome: 'SKIPPED',
        }).as(OutcomeBadge);

        await actor.attemptsTo(
            Ensure.that(badge.iconText(), equals('⊘')),
            Ensure.that(badge.outcomeType(), equals('SKIPPED')),
        );
    });
});
