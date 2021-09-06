import { LogicError } from '@serenity-js/core';

import { ByCss } from './ByCss';
import { ById } from './ById';
import { ByLinkText } from './ByLinkText';
import { ByPartialLinkText } from './ByPartialLinkText';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';
import { UIElementLocation } from './UIElementLocation';

export class UIElementLocator<T> {
    private readonly resolvers: Map<typeof UIElementLocation, (value: string) => Promise<T>> = new Map();

    whenCss(fn: (value: string) => Promise<T>): this {
        return this.withResolver(ByCss, fn);
    }

    whenId(fn: (value: string) => Promise<T>): this {
        return this.withResolver(ById, fn);
    }

    whenLinkText(fn: (value: string) => Promise<T>): this {
        return this.withResolver(ByLinkText, fn);
    }

    whenPartialLinkText(fn: (value: string) => Promise<T>): this {
        return this.withResolver(ByPartialLinkText, fn);
    }

    whenTagName(fn: (value: string) => Promise<T>): this {
        return this.withResolver(ByTagName, fn);
    }

    whenXPath(fn: (value: string) => Promise<T>): this {
        return this.withResolver(ByXPath, fn);
    }

    locateAt(location: UIElementLocation): Promise<T> {
        const resolver = this.resolvers.get(location.constructor as typeof UIElementLocation);

        if (! resolver) {
            throw new LogicError(`No resolver registered for location defined ${ location } (${ location.constructor.name })`);
        }

        return resolver(location.value);
    }

    private withResolver(type: typeof UIElementLocation, fn: (value: string) => Promise<T>): this {
        this.resolvers.set(type, fn);
        return this;
    }
}
