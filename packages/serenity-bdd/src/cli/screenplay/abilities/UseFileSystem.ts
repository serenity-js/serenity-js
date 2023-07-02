import { Ability } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';
import { FileSystem } from '@serenity-js/core/lib/io';
import type { ReadStream, Stats, WriteStream } from 'fs';

/**
 * @package
 */
export class UseFileSystem extends Ability {
    static at(root: Path): UseFileSystem {
        return new UseFileSystem(new FileSystem(root));
    }

    constructor(private readonly fileSystem: FileSystem) {
        super();
    }

    createReadStream(relativePathToFile: Path): ReadStream {
        return this.fileSystem.createReadStream(relativePathToFile);
    }

    createWriteStreamTo(relativePathToFile: Path): WriteStream {
        return this.fileSystem.createWriteStreamTo(relativePathToFile);
    }

    createDirectory(relativePathToDirectory: Path): Promise<Path> {
        return this.fileSystem.ensureDirectoryExistsAt(relativePathToDirectory);
    }

    remove(relativePathToFileOrDirectory: Path): Promise<void> {
        return this.fileSystem.remove(relativePathToFileOrDirectory);
    }

    rename(source: Path, destination: Path): Promise<void> {
        return this.fileSystem.rename(source, destination);
    }

    attributesOf(relativePathToFileOrDirectory: Path): Promise<Stats> {
        return this.fileSystem.stat(relativePathToFileOrDirectory);
    }
}
