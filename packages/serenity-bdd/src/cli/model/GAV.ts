import { Path } from '@serenity-js/core/lib/io';
import { ensure, isDefined, isInRange, isInteger, Predicate, property, TinyType } from 'tiny-types';

/**
 * @package
 */
export class GAV extends TinyType {
    static fromString(gav: string) {
        const parts = gav.split(':');

        ensure('GAV segments', parts, property('length', isInteger(), isInRange(3, 5)));

        switch (parts.length) {
            case 5:     return new GAV(parts[0], parts[1], parts[4], parts[2], parts[3]);
            case 4:     return new GAV(parts[0], parts[1], parts[3], parts[2]);
            default:    return new GAV(parts[0], parts[1], parts[2]);
        }
    }

    constructor(
        public readonly groupId: string,
        public readonly artifactId: string,
        public readonly version: string,
        public readonly extension: string = 'jar',
        public readonly classifier?: string,
    ) {
        super();
        ensure('groupId', groupId, isDefined(), matchesRegex('group name', /^[a-z][a-z0-9_-]+(?:\.[a-z0-9_-]+)+[0-9a-z_-]$/));
        ensure('artifactId', artifactId, isDefined(), matchesRegex('artifact name', /^[a-z0-9_-]+$/));
        ensure('version', version, isDefined(), matchesRegex('version', /^(?:\d+\.?){3}$/));
        ensure('extension', extension, isDefined(), matchesRegex('version', /^[a-z]+$/));
    }

    toPath(): Path {
        const name = [
            this.artifactId,
            this.version,
            this.classifier,
        ].filter(s => !!s).join('-');

        return new Path(`${ name }.${ this.extension}`);
    }
}

function matchesRegex(type: string, regex: RegExp): Predicate<string> {
    return Predicate.to(`match ${type} regex ${regex}`, (value: string) =>
        typeof value === 'string' &&
        regex.test(value),
    );
}
