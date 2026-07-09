import { Ensure, equals } from '@serenity-js/assertions';

import { HistoryDots } from '../../src/serenity/HistoryDots.serenity.js';
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

    it('reports the outcome type and title of each dot', async ({ mount, actor }) => {
        const historyDots = await mount({
            component: 'HistoryDots',
            importPath: './components/HistoryDots',
            props: {
                entries: [
                    { outcome: 'SUCCESS', label: 'Run 1' },
                    { outcome: 'FAILURE', label: 'Run 2' },
                    { outcome: 'PENDING', label: 'Run 3' },
                ],
            },
            interactionObject: HistoryDots,
        });

        await actor.attemptsTo(
            Ensure.that(historyDots.outcomes(), equals([
                { type: 'passed', title: 'Run 1' },
                { type: 'failed', title: 'Run 2' },
                { type: 'pending', title: 'Run 3' },
            ])),
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
            Ensure.that(historyDots.outcomes(), equals([
                { type: 'pending', title: 'Run 3' },
                { type: 'passed', title: 'Run 4' },
                { type: 'failed', title: 'Run 5' },
            ])),
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

    it('uses empty titles when labels are not provided', async ({ mount, actor }) => {
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
            Ensure.that(historyDots.outcomes(), equals([
                { type: 'passed', title: '' },
                { type: 'failed', title: '' },
            ])),
        );
    });
});
