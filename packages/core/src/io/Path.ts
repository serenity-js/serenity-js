import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

import filenamify = require('filenamify');
import path = require('upath');

export class Path extends TinyType {
    private static readonly Separator = '/';
    public readonly value: string;

    static fromJSON(v: string): Path {
        return new Path(v);
    }

    static from(...segments: string[]): Path {
        return new Path(path.joinSafe(...segments));
    }

    static fromSanitisedString(value: string): Path {
        const
            normalised = path.normalize(value).replace(/["'/:\\]/gi, ''),
            extension  = path.extname(normalised),
            basename   = path.basename(normalised, extension),
            filename   = filenamify(basename, { replacement: '-', maxLength: 250 })
                .trim()
                .replace(/[\s-]+/g, '-');

        return new Path(path.join(
            path.dirname(normalised),
            `${ filename }${ extension }`,
        ));
    }

    constructor(value: string) {
        super();
        ensure(Path.name, value, isDefined(), property('length', isGreaterThan(0)));

        this.value = path.normalize(value);
    }

    join(another: Path): Path {
        return new Path(path.join(this.value, another.value));
    }

    split(): string[] {
        return this.value
            .split(Path.Separator)
            .filter(segment => !! segment); // so that we ignore the trailing path separator in absolute paths
    }

    resolve(another: Path): Path {
        return new Path(path.resolve(this.value, another.value));
    }

    directory(): Path {
        return new Path(path.dirname(this.value));
    }

    basename(): string {
        return path.basename(this.value);
    }

    isAbsolute(): boolean {
        return path.isAbsolute(this.value);
    }

    root(): Path {
        return new Path(path.parse(this.value).root);
    }
}
