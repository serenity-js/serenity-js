import semver from 'semver';
import { ensure, isDefined, isString, Predicate, TinyType } from 'tiny-types';

/**
 * A tiny type describing a version number, like `1.2.3`
 */
export class Version extends TinyType {

    /**
     * @param version
     */
    static fromJSON(version: string): Version {
        return new Version(version);
    }

    /**
     * @param version
     */
    constructor(private readonly version: string) {
        super();
        ensure('version', version, isDefined(), isString(), isValid());
    }

    /**
     * @param other
     */
    isAtLeast(other: Version): boolean {
        return semver.gte(this.version, other.version);
    }

    /**
     * @returns
     *  Major version number of a given package version, i.e. `1` in `1.2.3`
     */
    major(): number {
        return Number(this.version.split('.')[0]);
    }

    /**
     * @param range
     */
    satisfies(range: string): boolean {
        return semver.satisfies(this.version, range);
    }

    toString(): string {
        return `${ this.version }`;
    }
}

/**
 * @package
 */
function isValid(): Predicate<string> {
    return Predicate.to(`be a valid version number`, (version: string) =>
        !! semver.valid(version),
    );
}
