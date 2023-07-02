import { requestHandler } from '@examples/calculator-app';
import { Actor, Cast } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            ManageALocalServer.runningAHttpListener(requestHandler),
            CallAnApi.at('http://localhost'),
        );
    }
}
