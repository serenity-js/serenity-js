import { ensure, isDefined, isGreaterThan, property, TinyType } from 'tiny-types';

import { posix } from 'path';

export class Path extends TinyType {
    public readonly value: string;

    constructor(value: string) {
        super();
        ensure(Path.name, value, isDefined(), property('length', isGreaterThan(0)));

        this.value = posix.normalize(value);
    }

    join(another: Path) {
        return new Path(posix.join(this.value, another.value));
    }

    resolve(another: Path) {
        return new Path(posix.resolve(this.value, another.value));
    }

    directory() {
        return new Path(posix.dirname(this.value));
    }
}
