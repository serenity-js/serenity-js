import { Actor, Cast } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { BrowseTheWebWithProtractor } from '@serenity-js/protractor';
import { protractor } from 'protractor';

import { app } from '../app';

export class Actors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithProtractor.using(protractor.browser),
            ManageALocalServer.runningAHttpListener(app),
        );
    }
}
