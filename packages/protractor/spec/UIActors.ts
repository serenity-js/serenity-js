/* eslint-disable unicorn/filename-case */
import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import { protractor } from 'protractor';
import { BrowseTheWeb } from '../src/screenplay/abilities';
import { app } from './pages';

export class UIActors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWeb.using(protractor.browser),
            TakeNotes.usingAnEmptyNotepad(),
            ManageALocalServer.runningAHttpListener(app),
            CallAnApi.using(axios.create()),
        );
    }
}
