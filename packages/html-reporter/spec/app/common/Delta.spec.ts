import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';

import { Delta } from '../../../src/serenity/common/Delta.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

describe('Delta', () => {

    it('renders nothing when previous is undefined', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 80, previous: undefined },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view, not(isPresent())),
        );
    });

    it('shows "no change" when current equals previous', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 75, previous: 75 },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('— no change')),
            Ensure.that(view.sentiment(), equals('neutral')),
        );
    });

    it('shows upward arrow with positive class when value increases', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 85, previous: 70 },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('↑ 15')),
            Ensure.that(view.sentiment(), equals('positive')),
        );
    });

    it('shows downward arrow with negative class when value decreases', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 60, previous: 80 },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('↓ 20')),
            Ensure.that(view.sentiment(), equals('negative')),
        );
    });

    it('inverts polarity when invert is true (increase = negative)', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 5, previous: 2, invert: true },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('↓ 3')),
            Ensure.that(view.sentiment(), equals('negative')),
        );
    });

    it('inverts polarity when invert is true (decrease = positive)', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 1, previous: 4, invert: true },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('↑ 3')),
            Ensure.that(view.sentiment(), equals('positive')),
        );
    });

    it('appends suffix to the displayed value', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 90, previous: 85, suffix: '%' },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('↑ 5%')),
            Ensure.that(view.sentiment(), equals('positive')),
        );
    });

    it('displays absolute difference regardless of direction', async ({ mount, actor }) => {
        const view = await mount({
            component: 'Delta',
            importPath: './components/common/charts/Delta',
            props: { current: 10, previous: 25 },
            data: minimalData(),
            interactionObject: Delta,
        });

        await actor.attemptsTo(
            Ensure.that(view.text(), equals('↓ 15')),
            Ensure.that(view.sentiment(), equals('negative')),
        );
    });
});
