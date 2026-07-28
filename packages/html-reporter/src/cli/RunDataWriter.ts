import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import type { RunData } from './model/RunData.js';

/**
 * Writes the db.json file for the current test run.
 *
 * When `workerId` is provided (e.g., from WebdriverIO's parallel workers),
 * creates a worker-specific file like `db-0-5.json` instead of `db.json`.
 * This prevents race conditions when multiple workers write to the same directory.
 *
 * @package
 */
export class RunDataWriter {
    constructor(
        private readonly fileSystem: FileSystem,
        private readonly workerId?: string,
    ) {
    }

    write(runData: RunData, runDirectory: Path): void {
        const filename = this.workerId
            ? `db-${ this.workerId }.json`
            : 'db.json';
        const databaseJsonPath = runDirectory.join(Path.from(filename));
        const content = JSON.stringify(runData, undefined, 2);
        this.fileSystem.storeSync(databaseJsonPath, content, 'utf8');
    }
}
