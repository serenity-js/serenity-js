import semver = require('semver');
import { ensure, isDefined, isString, Predicate, TinyType } from 'tiny-types';

export class Version extends TinyType {

    fromJSON(version: string) {
        return new Version(version);
    }

    constructor(private readonly version: string) {
        super();
        ensure('version', version, isDefined(), isString(), isValid());
    }

    isAtLeast(other: Version) {
        return semver.gte(this.version, other.version);
    }

    major(): number {
        return Number(this.version.split('.')[0]);
    }

    toString() {
        return `${ this.version }`;
    }
}

function isValid(): Predicate<string> {
    return Predicate.to(`be a valid version number`, (version: string) =>
        !! semver.valid(version),
    );
}
