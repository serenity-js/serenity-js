import type { Actor, Cast} from '@serenity-js/core';
import { TakeNotes } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';

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
