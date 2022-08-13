import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';
import { requestHandler } from '@serenity-js-examples/calculator-app';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        switch (actor.name) {
            case 'Apisitt':
                return actor.whoCan(
                    ManageALocalServer.runningAHttpListener(requestHandler),
                    TakeNotes.usingASharedNotepad(),
                );
            default:
                return actor.whoCan(
                    CallAnApi.at('http://localhost'),
                    TakeNotes.usingASharedNotepad(),
                );
        }
    }
}
