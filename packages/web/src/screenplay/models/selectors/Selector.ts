import { f } from '@serenity-js/core';

export abstract class Selector {

    toString(): string {
        const selectorDescription   = this.constructor.name.replace(/([a-z]+)([A-Z])/g, '$1 $2').toLowerCase();
        const parametersDescription = Object.keys(this).map(field => f`${this[field]}`).join(', ');

        return `${ selectorDescription } (${ parametersDescription })`;
    }
}
