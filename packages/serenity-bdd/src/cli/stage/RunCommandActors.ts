import { Actor, Cast, TakeNotes } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';

import { UseFileSystem } from '../screenplay';

/**
 * @package
 */
export class RunCommandActors implements Cast {
    constructor(private readonly cwd: Path){
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            UseFileSystem.at(this.cwd),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
