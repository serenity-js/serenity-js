import { Ensure, equals } from '@serenity-js/assertions';

import { describe, it } from '@serenity-js/playwright-test';
import { KpiCard } from '../../../src/serenity/common/KpiCard.serenity.js';

describe('KpiCard', () => {

    it('displays label and value', async ({ story, actor }) => {
        const kpiCard = story('components/common/KpiCard/Default', {
            label: 'Slowest', value: '2.5s', ariaLabel: 'Slowest test: 2.5s',
        }).as(KpiCard);

        await actor.attemptsTo(
            Ensure.that(kpiCard.label(), equals('SLOWEST')),
            Ensure.that(kpiCard.value(), equals('2.5s')),
        );
    });

    it('displays subtitle when provided', async ({ story, actor }) => {
        const kpiCard = story('components/common/KpiCard/Default', {
            label: 'Total', value: '12.3s', ariaLabel: 'Total duration: 12.3s', subtitle: '8 scenarios',
        }).as(KpiCard);

        await actor.attemptsTo(
            Ensure.that(kpiCard.subtitle(), equals('8 scenarios')),
        );
    });

    it('exposes accessible label from aria-label', async ({ story, actor }) => {
        const kpiCard = story('components/common/KpiCard/Default', {
            label: 'Average', value: '1.2s', ariaLabel: 'Average duration: 1.2s',
        }).as(KpiCard);

        await actor.attemptsTo(
            Ensure.that(kpiCard.accessibleLabel(), equals('Average duration: 1.2s')),
        );
    });

    it('renders numeric values', async ({ story, actor }) => {
        const kpiCard = story('components/common/KpiCard/Default', {
            label: 'Errors', value: 42, ariaLabel: 'Errors: 42',
        }).as(KpiCard);

        await actor.attemptsTo(
            Ensure.that(kpiCard.value(), equals('42')),
        );
    });

    it('renders without subtitle when not provided', async ({ story, actor }) => {
        const kpiCard = story('components/common/KpiCard/Default', {
            label: 'Fastest', value: '0.1s', ariaLabel: 'Fastest test: 0.1s',
        }).as(KpiCard);

        await actor.attemptsTo(
            Ensure.that(kpiCard.label(), equals('FASTEST')),
            Ensure.that(kpiCard.value(), equals('0.1s')),
            Ensure.that(kpiCard.accessibleLabel(), equals('Fastest test: 0.1s')),
        );
    });
});
