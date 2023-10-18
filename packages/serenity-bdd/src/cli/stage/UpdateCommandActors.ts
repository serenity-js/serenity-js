import type { Actor, Cast } from '@serenity-js/core';
import { TakeNotes } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';
import type { AxiosRequestConfigDefaults} from '@serenity-js/rest';
import { CallAnApi } from '@serenity-js/rest';

import { UseFileSystem } from '../screenplay';

/**
 * @package
 */
export class UpdateCommandActors implements Cast {
    constructor(
        private readonly cwd: Path,
        private readonly axiosConfigDefaults: AxiosRequestConfigDefaults,
    ){
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            CallAnApi.using(this.axiosConfigDefaults),
            UseFileSystem.at(this.cwd),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
