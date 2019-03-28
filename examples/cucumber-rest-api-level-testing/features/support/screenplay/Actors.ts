import { Actor, DressingRoom } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';

import { requestHandler } from '@serenity-js-examples/calculator-app';

export class Actors implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            ManageALocalServer.running(requestHandler),
            CallAnApi.at('http://localhost'),
        );
    }
}
