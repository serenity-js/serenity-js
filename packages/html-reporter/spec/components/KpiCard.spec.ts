import { Ensure, equals } from '@serenity-js/assertions';

import { KpiCard } from '../../src/serenity/KpiCard.serenity.js';
import { describe, it } from './fixtures.js';

describe('KpiCard', () => {

    it('displays label and value', async ({ mount, actor }) => {
        const kpiCard = await mount({
            component: 'KpiCard',
            importPath: './components/KpiCard',
            props: { label: 'Slowest', value: '2.5s', ariaLabel: 'Slowest test: 2.5s' },
            interactionObject: KpiCard,
        });

        await actor.attemptsTo(
            Ensure.that(kpiCard.label(), equals('SLOWEST')),
            Ensure.that(kpiCard.value(), equals('2.5s')),
        );
    });

    it('displays subtitle when provided', async ({ mount, actor }) => {
        const kpiCard = await mount({
            component: 'KpiCard',
            importPath: './components/KpiCard',
            props: { label: 'Total', value: '12.3s', ariaLabel: 'Total duration: 12.3s', subtitle: '8 scenarios' },
            interactionObject: KpiCard,
        });

        await actor.attemptsTo(
            Ensure.that(kpiCard.subtitle(), equals('8 scenarios')),
        );
    });

    it('exposes accessible label from aria-label', async ({ mount, actor }) => {
        const kpiCard = await mount({
            component: 'KpiCard',
            importPath: './components/KpiCard',
            props: { label: 'Average', value: '1.2s', ariaLabel: 'Average duration: 1.2s' },
            interactionObject: KpiCard,
        });

        await actor.attemptsTo(
            Ensure.that(kpiCard.accessibleLabel(), equals('Average duration: 1.2s')),
        );
    });

    it('renders numeric values', async ({ mount, actor }) => {
        const kpiCard = await mount({
            component: 'KpiCard',
            importPath: './components/KpiCard',
            props: { label: 'Errors', value: 42, ariaLabel: 'Errors: 42' },
            interactionObject: KpiCard,
        });

        await actor.attemptsTo(
            Ensure.that(kpiCard.value(), equals('42')),
        );
    });

    it('renders without subtitle when not provided', async ({ mount, actor }) => {
        const kpiCard = await mount({
            component: 'KpiCard',
            importPath: './components/KpiCard',
            props: { label: 'Fastest', value: '0.1s', ariaLabel: 'Fastest test: 0.1s' },
            interactionObject: KpiCard,
        });

        await actor.attemptsTo(
            Ensure.that(kpiCard.label(), equals('FASTEST')),
            Ensure.that(kpiCard.value(), equals('0.1s')),
            Ensure.that(kpiCard.accessibleLabel(), equals('Fastest test: 0.1s')),
        );
    });
});
