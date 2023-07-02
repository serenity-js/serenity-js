import { Question } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';

import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export const FileExists = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    at: (path: Path) => Question.about<boolean>(`${ path.value } exists`, actor =>
        UseFileSystem.as(actor).attributesOf(path)
            .then(_ => true)
            .catch(error => {
                if (error.code !== 'ENOENT') {
                    throw error;
                }

                return false;
            }),
    ),
};
