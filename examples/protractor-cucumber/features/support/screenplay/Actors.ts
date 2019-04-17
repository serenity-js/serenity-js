import { Actor, DressingRoom } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { BrowseTheWeb } from '@serenity-js/protractor';
import { protractor } from 'protractor';
import { app } from '../app';

export class Actors implements DressingRoom {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
            ManageALocalServer.runningAHttpListener(app),
        );
    }
}
