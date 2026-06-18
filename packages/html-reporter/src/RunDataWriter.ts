import type { FileSystem } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import type { RunData } from './model/RunData.js';

/**
 * Writes the db.json file for the current test run.
 *
 * @package
 */
export class RunDataWriter {
    constructor(private readonly fileSystem: FileSystem) {
    }

    write(runData: RunData, runDirectory: Path): void {
        const databaseJsonPath = runDirectory.join(Path.from('db.json'));
        const content = JSON.stringify(runData, undefined, 2);
        this.fileSystem.storeSync(databaseJsonPath, content, 'utf8');
    }
}
