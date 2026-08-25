import { contain, Ensure, equals, includes, not } from '@serenity-js/assertions';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';

import { PhotoStrip } from '../../../src/serenity/scenarios/PhotoStrip.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

function activitiesWithPhotos() {
    return [
        {
            name: 'Navigate to login page',
            outcome: 'SUCCESS',
            duration: 150,
            startedAt: '2024-06-15T14:30:00.100Z',
            children: [],
            artifacts: [
                { name: 'screenshot-1.png', path: 'screenshots/screenshot-1.png' },
            ],
        },
        {
            name: 'Fill in credentials',
            outcome: 'SUCCESS',
            duration: 200,
            startedAt: '2024-06-15T14:30:00.300Z',
            children: [
                {
                    name: 'Enter username',
                    outcome: 'SUCCESS',
                    duration: 80,
                    startedAt: '2024-06-15T14:30:00.300Z',
                    children: [],
                    artifacts: [
                        { name: 'nested-screenshot.png', path: 'screenshots/nested-screenshot.png' },
                    ],
                },
            ],
            artifacts: [
                { name: 'screenshot-2.png', path: 'screenshots/screenshot-2.png' },
            ],
        },
        {
            name: 'Click submit',
            outcome: 'SUCCESS',
            duration: 100,
            startedAt: '2024-06-15T14:30:00.600Z',
            children: [],
            artifacts: [
                { name: 'not-a-photo.json', path: 'data/result.json' },
            ],
        },
    ];
}

describe('PhotoStrip', () => {

    it('renders nothing when no .png artifacts exist', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: [
                    { name: 'step 1', outcome: 'SUCCESS', duration: 100, children: [], artifacts: [] },
                ],
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.isPresent(), equals(false)),
        );
    });

    it('renders nothing when activities have no artifacts at all', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: [
                    { name: 'step 1', outcome: 'SUCCESS', duration: 100, children: [] },
                ],
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.isPresent(), equals(false)),
        );
    });

    it('displays the correct photo count in the title', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // 3 photos: screenshot-1.png, nested-screenshot.png, screenshot-2.png
        await actor.attemptsTo(
            Ensure.that(view.title(), includes('SCREENSHOTS (3)')),
        );
    });

    it('renders a thumbnail for each screenshot', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.photoCount(), equals(3)),
        );
    });

    it('displays the activity name as caption for each photo', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.captions(), contain('Navigate to login page')),
        );
    });

    it('collects photos from nested child activities', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // The nested "Enter username" activity has a screenshot
        await actor.attemptsTo(
            Ensure.that(view.captions(), contain('Enter username')),
        );
    });

    it('excludes non-.png artifacts', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        // The .json artifact from "Click submit" should not appear
        await actor.attemptsTo(
            Ensure.that(view.captions(), not(contain('Click submit'))),
        );
    });

    it('opens lightbox when clicking a thumbnail', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.isOpen(), equals(true)),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
        );
    });

    it('lightbox navigates forward with ArrowRight', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
            view.lightbox.next(),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
        );
    });

    it('lightbox navigates backward with ArrowLeft', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(1),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
            view.lightbox.prev(),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
        );
    });

    it('lightbox closes on Escape', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.isOpen(), equals(true)),
            view.lightbox.close(),
            Ensure.that(view.lightbox.isOpen(), equals(false)),
        );
    });

    it('lightbox closes when clicking the overlay background', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.isOpen(), equals(true)),
            view.lightbox.closeByOverlayClick(),
            Ensure.that(view.lightbox.isOpen(), equals(false)),
        );
    });

    it('lightbox shows counter indicating position (e.g., 1/3)', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.counter(), includes('1/3')),
        );
    });

    it('lightbox hides previous nav button on first photo', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.hasPrevButton(), equals(false)),
            Ensure.that(view.lightbox.hasNextButton(), equals(true)),
        );
    });

    it('lightbox hides next nav button on last photo', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(2),
            Ensure.that(view.lightbox.hasNextButton(), equals(false)),
            Ensure.that(view.lightbox.hasPrevButton(), equals(true)),
        );
    });

    it('clicking the next button navigates to the next photo', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
            view.lightbox.clickNext(),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
        );
    });

    it('clicking the previous button navigates to the previous photo', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(1),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
            view.lightbox.clickPrev(),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
        );
    });

    it('locks body scroll when lightbox is open', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            ExecuteScript.sync('return document.body.style.overflow'),
            Ensure.that(LastScriptExecution.result<string>(), equals('hidden')),
            ExecuteScript.sync('return document.body.style.position'),
            Ensure.that(LastScriptExecution.result<string>(), equals('fixed')),
        );
    });

    it('restores body scroll when lightbox is closed', async ({ interactionObject, actor }) => {
        const view = await interactionObject(PhotoStrip, './components/scenarios/PhotoStrip', {
            props: {
                activities: activitiesWithPhotos(),
                scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.openPhoto(0),
            view.lightbox.close(),
            ExecuteScript.sync('return document.body.style.overflow'),
            Ensure.that(LastScriptExecution.result<string>(), equals('')),
            ExecuteScript.sync('return document.body.style.position'),
            Ensure.that(LastScriptExecution.result<string>(), equals('')),
        );
    });
});
