import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

import path = require('upath');

export class Path extends TinyType {
    private static readonly Separator = '/';
    public readonly value: string;

    static fromJSON = (v: string) => new Path(v);

    constructor(value: string) {
        super();
        ensure(Path.name, value, isDefined(), property('length', isGreaterThan(0)));

        this.value = path.normalize(value);
    }

    join(another: Path) {
        return new Path(path.join(this.value, another.value));
    }

    split(): string[] {
        return this.value.split(Path.Separator);
    }

    resolve(another: Path) {
        return new Path(path.resolve(this.value, another.value));
    }

    directory() {
        return new Path(path.dirname(this.value));
    }

    basename(): string {
        return path.basename(this.value);
    }
}
