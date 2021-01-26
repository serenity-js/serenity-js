import { Ability, UsesAbilities } from '@serenity-js/core';
import { FileSystem, Path } from '@serenity-js/core/lib/io';
import { ReadStream, Stats, WriteStream } from 'fs';

/**
 * @package
 */
export class UseFileSystem implements Ability {
    static at(root: Path) {
        return new UseFileSystem(new FileSystem(root));
    }

    static as(actor: UsesAbilities): UseFileSystem {
        return actor.abilityTo(UseFileSystem);
    }

    constructor(private readonly fileSystem: FileSystem) {
    }

    createReadStream(relativePathToFile: Path): ReadStream {
        return this.fileSystem.createReadStream(relativePathToFile);
    }

    createWriteStreamTo(relativePathToFile: Path): WriteStream {
        return this.fileSystem.createWriteStreamTo(relativePathToFile);
    }

    createDirectory(relativePathToDirectory: Path) {
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
