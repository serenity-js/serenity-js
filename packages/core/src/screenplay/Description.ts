import { TinyType } from 'tiny-types';

import type { Describable } from './Describable';

export class Description extends TinyType {
    constructor(public readonly value: string) {
        super();
    }

    toString(): string {
        return this.value;
    }

    static isDescribable(maybeDescribable: unknown): maybeDescribable is Describable {
        return !! maybeDescribable
            && typeof (maybeDescribable as any)['describedBy'] === 'function'
            && maybeDescribable['describedBy'].length === 1
    }
}
