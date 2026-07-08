import { Ensure, equals } from '@serenity-js/assertions';

import { HistoryDots } from '../../src/HistoryDots.serenity.js';
import { describe, it } from './fixtures.js';

describe('HistoryDots', () => {

    it('renders the correct number of dots', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS', label: 'Run 1' },
                    { outcome: 'FAILURE', label: 'Run 2' },
                    { outcome: 'SUCCESS', label: 'Run 3' },
                ],
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.count(), equals(3)),
        );
    });

    it('applies the correct outcome class to each dot', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS' },
                    { outcome: 'FAILURE' },
                    { outcome: 'PENDING' },
                ],
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.outcomeClasses(), equals(['passed', 'failed', 'pending'])),
        );
    });

    it('displays labels as title attributes', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS', label: 'Run 1' },
                    { outcome: 'FAILURE', label: 'Run 2' },
                ],
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.titles(), equals(['Run 1', 'Run 2'])),
        );
    });

    it('respects the max prop by showing only the last N entries', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS', label: 'Run 1' },
                    { outcome: 'FAILURE', label: 'Run 2' },
                    { outcome: 'PENDING', label: 'Run 3' },
                    { outcome: 'SUCCESS', label: 'Run 4' },
                    { outcome: 'FAILURE', label: 'Run 5' },
                ],
                max: 3,
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.count(), equals(3)),
            Ensure.that(historyDots.outcomeClasses(), equals(['pending', 'passed', 'failed'])),
        );
    });

    it('defaults to showing a maximum of 5 dots', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS' },
                    { outcome: 'FAILURE' },
                    { outcome: 'PENDING' },
                    { outcome: 'SKIPPED' },
                    { outcome: 'ERROR' },
                    { outcome: 'SUCCESS' },
                    { outcome: 'FAILURE' },
                ],
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.count(), equals(5)),
        );
    });

    it('renders empty labels as empty title attributes', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS' },
                    { outcome: 'FAILURE' },
                ],
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.titles(), equals(['', ''])),
        );
    });
});
