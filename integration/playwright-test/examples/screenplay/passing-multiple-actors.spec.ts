import { Ensure, equals } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import { LocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { afterEach, describe, it, test } from '@serenity-js/playwright-test';
import { By, Navigate, PageElement, Text } from '@serenity-js/web';

import { MultipleWebActorsWithSharedNotes } from './actors/MultipleWebActorsWithSharedNotes';

interface Notes {
    testServerUrl: string;
}

describe('Playwright Test reporting', () => {

    test.use({
        actors: async ({ browser }, use) => {
            await use(new MultipleWebActorsWithSharedNotes(browser));
        },
    });

    const welcomeMessage = Text.of(PageElement.located(By.id('welcome-message')))
        .describedAs('welcome message');

    describe('A screenplay scenario', () => {

        it('supports multiple actors', async ({ actorCalled }) => {
            await actorCalled('Charlie').attemptsTo(
                StartLocalServer.onRandomPort(),
                notes<Notes>().set('testServerUrl', LocalServer.url()),
            );

            await actorCalled('Alice').attemptsTo(
                Navigate.to(notes<Notes>().get('testServerUrl')),
            );

            await actorCalled('Bob').attemptsTo(
                Navigate.to(notes<Notes>().get('testServerUrl')),
            );

            await actorCalled('Alice').attemptsTo(
                Ensure.that(welcomeMessage, equals('Welcome, Alice!')),
            );

            await actorCalled('Bob').attemptsTo(
                Ensure.that(welcomeMessage, equals('Welcome, Bob!')),
            );
        });

        afterEach(async ({ actorCalled }) => {
            await actorCalled('Charlie').attemptsTo(
                StopLocalServer.ifRunning(),
            );
        });
    });
});
