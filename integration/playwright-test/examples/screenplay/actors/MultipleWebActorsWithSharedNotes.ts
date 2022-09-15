import { Browser } from '@playwright/test';
import { Actor, Cast, Notepad, TakeNotes  } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { createServer } from 'http';

const server = createServer(function (request, response) {
    response.setHeader('Connection', 'close');
    response.end(`<html><body><h1 id="welcome-message">Welcome, ${ request.headers['user-agent'] }!</h1></body></html>`);
})

export class MultipleWebActorsWithSharedNotes implements Cast {
    private sharedNotepad = Notepad.empty();

    constructor(private readonly browser: Browser) {
    }

    prepare(actor: Actor): Actor {
        if (actor.name === 'Charlie') {
            return actor.whoCan(
                ManageALocalServer.runningAHttpListener(server),
                TakeNotes.using(this.sharedNotepad),
            );
        }

        return actor.whoCan(
            BrowseTheWebWithPlaywright.using(this.browser, {
                userAgent: `${ actor.name }`
            }),
            TakeNotes.using(this.sharedNotepad),
        );
    }
}