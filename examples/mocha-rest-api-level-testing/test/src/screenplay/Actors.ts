import { requestHandler } from '@examples/calculator-app';
import { Actor, Cast, Notepad, TakeNotes } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';

export class Actors extends Cast {
    private readonly sharedNotepad = Notepad.empty();

    prepare(actor: Actor): Actor {
        switch (actor.name) {
            case 'Apisitt':
                return actor.whoCan(
                    ManageALocalServer.runningAHttpListener(requestHandler),
                    TakeNotes.using(this.sharedNotepad),
                );
            default:
                return actor.whoCan(
                    CallAnApi.at('http://localhost'),
                    TakeNotes.using(this.sharedNotepad),
                );
        }
    }
}
