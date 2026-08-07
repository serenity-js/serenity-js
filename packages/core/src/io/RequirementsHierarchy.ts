import { ConfigurationError, LogicError } from '../errors/index.js';
import { CapabilityTag, FeatureTag, Tag, ThemeTag } from '../model/index.js';
import type { FileSystem } from './FileSystem.js';
import { Path } from './Path.js';

export class RequirementsHierarchy {

    private root: Path;

    private static readonly specDirectoryCandidates = [
        `features`,
        `specs`,
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

    requirementTagsFor(pathToSpec: Path, featureName?: string): Tag[] {
        const [ fileBasedFeatureName, capabilityName, ...themeNames ] = this.hierarchyFor(pathToSpec).reverse().filter(segment => ! [ '.', '..' ].includes(segment));

        const themeTags = themeNames.reverse().map(themeName => Tag.humanReadable(ThemeTag, themeName));
        const capabilityTag = capabilityName && Tag.humanReadable(CapabilityTag, capabilityName);
        const featureTag = featureName
            ? new FeatureTag(featureName)
            : Tag.humanReadable(FeatureTag, fileBasedFeatureName)

        return [
            ...themeTags,
            capabilityTag,
            featureTag
        ].filter(Boolean);
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

    /**
     * Checks whether a README file exists at the given directory path
     * (case-insensitive lookup for `readme.md`).
     */
    hasReadmeAt(directoryPath: Path): boolean {
        return !! this.findReadmeAt(directoryPath);
    }

    /**
     * Reads and returns the content of the README file at the given directory path.
     * Use {@link hasReadmeAt} to check existence before calling this method.
     *
     * @throws {ConfigurationError} if no README exists at the path
     */
    readmeAt(directoryPath: Path): string {
        const readmePath = this.findReadmeAt(directoryPath);
        if (! readmePath) {
            throw new LogicError(`No README found at ${ directoryPath }. Use hasReadmeAt() to check existence before calling readmeAt()`);
        }

        return this.fileSystem.readFileSync(readmePath, { encoding: 'utf8' }) as string;
    }

    private findReadmeAt(directoryPath: Path): Path | undefined {
        if (! this.fileSystem.exists(directoryPath)) {
            return undefined;
        }
        const entries = this.fileSystem.readdirSync(directoryPath);
        const readmeFilename = entries.find(entry => /^readme\.md$/i.test(entry));

        return readmeFilename
            ? directoryPath.join(Path.from(readmeFilename))
            : undefined;
    }
}