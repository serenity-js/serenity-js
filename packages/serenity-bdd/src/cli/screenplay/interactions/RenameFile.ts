import { Interaction } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';

import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export const RenameFile = {
    from: (source: Path) => ({  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
        to: (destination: Path) => Interaction.where(`#actor renames ${ source.value } to ${ destination.value }`, actor =>
            UseFileSystem.as(actor).rename(source, destination)),
    }),
};
