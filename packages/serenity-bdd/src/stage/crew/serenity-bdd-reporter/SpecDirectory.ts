import { FileSystem, Path } from '@serenity-js/core/lib/io';

export class SpecDirectory {

    private static readonly specDirectoryCandidates = [
        `features`,
        `spec`,
        `tests`,
        `test`,
        `src`,
    ];

    constructor(private readonly fileSystem: FileSystem) {
    }

    guessLocation(): Path {
        for (const candidate of SpecDirectory.specDirectoryCandidates) {
            const candidateSpecDirectory = Path.from(candidate);
            if (this.fileSystem.exists(Path.from(candidate))) {
                return this.fileSystem.resolve(candidateSpecDirectory);
            }
        }

        // default to current working directory
        return this.fileSystem.resolve(Path.from('.'));
    }
}