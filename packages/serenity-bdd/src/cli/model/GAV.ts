import { Path } from '@serenity-js/core/lib/io';
import { ensure, isDefined, isInRange, isInteger, matches, property, TinyType } from 'tiny-types';

/**
 * @package
 */
export class GAV extends TinyType {
    static fromString(gav: string): GAV {
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
        ensure('groupId', groupId, isDefined(), matches(/^[a-z][\d_a-z-]+(?:\.[\d_a-z-]+)+[\d_a-z-]$/));
        ensure('artifactId', artifactId, isDefined(), matches(/^[\d_a-z-]+$/));
        ensure('version', version, isDefined(), matches(/^(?:\d+\.?){3}$/));
        ensure('extension', extension, isDefined(), matches(/^[a-z]+$/));
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
