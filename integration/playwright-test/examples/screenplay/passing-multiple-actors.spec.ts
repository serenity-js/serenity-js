import { Ensure, equals } from '@serenity-js/assertions';
import { Cast, Notepad, notes, TakeNotes } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { afterEach, describe, it, test } from '@serenity-js/playwright-test';
import { By, Navigate, PageElement, Text } from '@serenity-js/web';

import { server } from './actors/server';

interface Notes {
    testServerUrl: string;
}

describe('Playwright Test reporting', () => {

    test.use({
        actors: async ({ browser }, use) => {
            const sharedNotepad = Notepad.empty();

            const cast = Cast.where(actor => {
                if (actor.name === 'Charlie') {
                    return actor.whoCan(
                        ManageALocalServer.runningAHttpListener(server),
                        TakeNotes.using(sharedNotepad),
                    );
                }

                return actor.whoCan(
                    BrowseTheWebWithPlaywright.using(browser, {
                        userAgent: `${ actor.name }`
                    }),
                    TakeNotes.using(sharedNotepad),
                );
            });

            await use(cast)
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
