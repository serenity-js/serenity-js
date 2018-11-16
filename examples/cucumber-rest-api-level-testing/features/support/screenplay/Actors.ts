import { Actor, Cast } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';

import { requestHandler } from '@serenity-js-examples/calculator-app';

export class Actors implements Cast {
    actor(name: string) {
        return Actor.named(name).whoCan(
            ManageALocalServer.using(requestHandler),
            CallAnApi.at('http://localhost'),
        );
    }
}
