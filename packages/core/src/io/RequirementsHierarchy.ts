import { ConfigurationError } from '../errors';
import type { Tag } from '../model';
import type { FileSystem} from './FileSystem';
import { Path } from './Path';

export class RequirementsHierarchy {

    private root: Path;

    private static readonly specDirectoryCandidates = [
        `features`,
        `spec`,
        `tests`,
        `test`,
        `src`,
    ];

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly userDefinedSpecDirectory?: Path,
    ) {
    }

    requirementTagsFor(pathToSpec: Path): Tag[] {
        throw new Error('Not implemented yet');
    }

    hierarchyFor(pathToSpec: Path): string[] {
        const relative = this.rootDirectory().relative(pathToSpec);

        return relative.split().map((segment, i, segments) => {
            // return all the segments as-is, except for the last one
            if (i < segments.length - 1) {
                return segment;
            }

            // Strip the extension, like `.feature` or `.spec.ts`
            const firstDotIndex = segment.indexOf('.');
            return firstDotIndex === -1
                ? segment
                : segment.slice(0, firstDotIndex);
        });
    }

    rootDirectory(): Path {
        if (! this.root) {
            this.root = this.userDefinedSpecDirectory
                ? this.resolve(this.userDefinedSpecDirectory)
                : this.guessRootDirectory();
        }

        return this.root;
    }

    private guessRootDirectory(): Path {
        for (const candidate of RequirementsHierarchy.specDirectoryCandidates) {
            const candidateSpecDirectory = Path.from(candidate);
            if (this.fileSystem.exists(Path.from(candidate))) {
                return this.fileSystem.resolve(candidateSpecDirectory);
            }
        }

        // default to current working directory
        return this.fileSystem.resolve(Path.from('.'));
    }

    private resolve(userDefinedRootDirectory: Path): Path {
        if (! this.fileSystem.exists(userDefinedRootDirectory)) {
            throw new ConfigurationError(`Configured specDirectory \`${ userDefinedRootDirectory }\` does not exist`);
        }

        return this.fileSystem.resolve(userDefinedRootDirectory);
    }
}