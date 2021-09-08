import { LogicError } from '@serenity-js/core';

import { UIElementLocation } from './UIElementLocation';

export class UIElementLocator<T> {
    private readonly resolvers: Map<typeof UIElementLocation, (location: UIElementLocation) => Promise<T>> = new Map();

    when<L extends UIElementLocation>(type: new(...args: any[]) => L, fn: (location: L) => Promise<T>): this {
        this.resolvers.set(type, fn);
        return this;
    }

    locate(location: UIElementLocation): Promise<T> {
        const resolver = this.resolvers.get(location.constructor as typeof UIElementLocation);

        if (! resolver) {
            throw new LogicError(`No resolver registered for location defined ${ location } (${ location.constructor.name })`);
        }

        return resolver(location);
    }
}
