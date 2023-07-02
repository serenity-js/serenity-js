import { Interaction } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';

import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export const CreateDirectory = {
    at: (destination: Path): Interaction =>
        Interaction.where(`#actor creates a directory at ${ destination.value }`, actor =>
            UseFileSystem.as(actor).createDirectory(destination).then(_ => void 0)
        ),
};
