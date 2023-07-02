import { Question } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';
import { createHash } from 'crypto';

import { UseFileSystem } from '../abilities';

/**
 * @package
 */
export const Checksum = {
    of: (destination: Path) => ({   // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
        calculatedUsing: (hashingAlgorithm: string) =>
            Question.about<string>(`checksum of ${ destination.value }`, actor => {
                const hash = createHash(hashingAlgorithm);

                const input = UseFileSystem.as(actor).createReadStream(destination);

                return new Promise((resolve, reject) => {
                    input.on('data', data => hash.update(data));
                    input.on('end', () => resolve(hash.digest('hex')));
                    input.on('error', error => reject(error));
                });
            }),
    }),
};
