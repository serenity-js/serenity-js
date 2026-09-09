import { contain, Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';

import { minimalData } from '../../../spec/app/data-factories.js';
import { PhotoStrip } from '../../../src/serenity/scenarios/PhotoStrip.serenity.js';

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

function mountPhotoStrip(storyFunction: (path: string, props?: Record<string, unknown>) => { as: <T>(io: new (...args: any[]) => T) => any }) {
    return storyFunction('components/scenarios/PhotoStrip/Default', {
        activities: activitiesWithPhotos(),
        scenarioStartedAt: '2024-06-15T14:30:00.000Z',
        data: minimalData(),
    }).as(PhotoStrip);
}

describe('PhotoStrip', () => {

    it('renders nothing when no .png artifacts exist', async ({ story, actor }) => {
        const view = story('components/scenarios/PhotoStrip/Default', {
            activities: [
                { name: 'step 1', outcome: 'SUCCESS', duration: 100, children: [], artifacts: [] },
            ],
            scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            data: minimalData(),
        }).as(PhotoStrip);

        await actor.attemptsTo(
            Ensure.that(view, not(isPresent())),
        );
    });

    it('renders nothing when activities have no artifacts at all', async ({ story, actor }) => {
        const view = story('components/scenarios/PhotoStrip/Default', {
            activities: [
                { name: 'step 1', outcome: 'SUCCESS', duration: 100, children: [] },
            ],
            scenarioStartedAt: '2024-06-15T14:30:00.000Z',
            data: minimalData(),
        }).as(PhotoStrip);

        await actor.attemptsTo(
            Ensure.that(view, not(isPresent())),
        );
    });

    it('displays the correct photo count in the title', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        // 3 photos: screenshot-1.png, nested-screenshot.png, screenshot-2.png
        await actor.attemptsTo(
            Ensure.that(view.title(), includes('SCREENSHOTS (3)')),
        );
    });

    it('renders a thumbnail for each screenshot', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            Ensure.that(view.photoCount(), equals(3)),
        );
    });

    it('displays the activity name as caption for each photo', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            Ensure.that(view.captions(), contain('Navigate to login page')),
        );
    });

    it('collects photos from nested child activities', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        // The nested "Enter username" activity has a screenshot
        await actor.attemptsTo(
            Ensure.that(view.captions(), contain('Enter username')),
        );
    });

    it('excludes non-.png artifacts', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        // The .json artifact from "Click submit" should not appear
        await actor.attemptsTo(
            Ensure.that(view.captions(), not(contain('Click submit'))),
        );
    });

    it('opens lightbox when clicking a thumbnail', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.isOpen(), equals(true)),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
        );
    });

    it('lightbox navigates forward with ArrowRight', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
            view.lightbox.next(),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
        );
    });

    it('lightbox navigates backward with ArrowLeft', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(1),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
            view.lightbox.prev(),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
        );
    });

    it('lightbox closes on Escape', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.isOpen(), equals(true)),
            view.lightbox.close(),
            Ensure.that(view.lightbox.isOpen(), equals(false)),
        );
    });

    it('lightbox closes when clicking the overlay background', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.isOpen(), equals(true)),
            view.lightbox.closeByOverlayClick(),
            Ensure.that(view.lightbox.isOpen(), equals(false)),
        );
    });

    it('lightbox shows counter indicating position (e.g., 1/3)', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.counter(), includes('1/3')),
        );
    });

    it('lightbox hides previous nav button on first photo', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.hasPrevButton(), equals(false)),
            Ensure.that(view.lightbox.hasNextButton(), equals(true)),
        );
    });

    it('lightbox hides next nav button on last photo', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(2),
            Ensure.that(view.lightbox.hasNextButton(), equals(false)),
            Ensure.that(view.lightbox.hasPrevButton(), equals(true)),
        );
    });

    it('clicking the next button navigates to the next photo', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
            view.lightbox.clickNext(),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
        );
    });

    it('clicking the previous button navigates to the previous photo', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(1),
            Ensure.that(view.lightbox.caption(), includes('Fill in credentials')),
            view.lightbox.clickPrev(),
            Ensure.that(view.lightbox.caption(), includes('Navigate to login page')),
        );
    });

    it('locks body scroll when lightbox is open', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

        await actor.attemptsTo(
            view.openPhoto(0),
            ExecuteScript.sync('return document.body.style.overflow'),
            Ensure.that(LastScriptExecution.result<string>(), equals('hidden')),
            ExecuteScript.sync('return document.body.style.position'),
            Ensure.that(LastScriptExecution.result<string>(), equals('fixed')),
        );
    });

    it('restores body scroll when lightbox is closed', async ({ story, actor }) => {
        const view = mountPhotoStrip(story);

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
