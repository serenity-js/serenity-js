import { Actor, DressingRoom, TakeNotes } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import { httpAdapter } from 'axios/lib/adapters/http'; // tslint:disable-line:no-submodule-imports
import { UseFileSystem } from '../screenplay';

/**
 * @package
 */
export class Actors implements DressingRoom {
    constructor(private readonly rootDir: Path) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            CallAnApi.using(axios.create({
                adapter: httpAdapter,
            })),
            UseFileSystem.at(this.rootDir),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
