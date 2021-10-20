import { LogicError } from '@serenity-js/core';

import { PageElementLocation } from './PageElementLocation';

export class PageElementLocator<T> {
    private readonly resolvers: Map<typeof PageElementLocation, (location: PageElementLocation) => Promise<T>> = new Map();

    when<L extends PageElementLocation>(type: new(...args: any[]) => L, fn: (location: L) => Promise<T>): this {
        this.resolvers.set(type, fn);
        return this;
    }

    locate(location: PageElementLocation): Promise<T> {
        const resolver = this.resolvers.get(location.constructor as typeof PageElementLocation);

        if (! resolver) {
            throw new LogicError(`No resolver registered for location defined ${ location } (${ location.constructor.name })`);
        }

        return resolver(location);
    }
}
