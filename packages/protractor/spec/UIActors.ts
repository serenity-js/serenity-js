import type { Actor, Cast} from '@serenity-js/core';
import { TakeNotes } from '@serenity-js/core';
import { ManageALocalServer } from '@serenity-js/local-server';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import { protractor } from 'protractor';

import { BrowseTheWebWithProtractor } from '../src/screenplay/abilities';
import { app } from './pages';

export class UIActors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(
            BrowseTheWebWithProtractor.using(protractor.browser),
            TakeNotes.usingAnEmptyNotepad(),
            ManageALocalServer.runningAHttpListener(app),
            CallAnApi.using(axios.create()),
        );
    }
}
