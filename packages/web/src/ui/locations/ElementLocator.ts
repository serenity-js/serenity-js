import { LogicError } from '@serenity-js/core';

import { ElementLocation } from './ElementLocation';

export class ElementLocator<T> {
    private readonly resolvers: Map<typeof ElementLocation, (location: ElementLocation) => Promise<T>> = new Map();

    when<L extends ElementLocation>(type: new(...args: any[]) => L, fn: (location: L) => Promise<T>): this {
        this.resolvers.set(type, fn);
        return this;
    }

    locate(location: ElementLocation): Promise<T> {
        const resolver = this.resolvers.get(location.constructor as typeof ElementLocation);

        if (! resolver) {
            throw new LogicError(`No resolver registered for location defined ${ location } (${ location.constructor.name })`);
        }

        return resolver(location);
    }
}
