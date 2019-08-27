import { Question } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export const FileExists = {
    at: (path: Path) => Question.about<Promise<boolean>>(`${ path.value } exists`, actor =>
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
