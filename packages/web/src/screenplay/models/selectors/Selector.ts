import { f } from '@serenity-js/core';

/**
 * Describes a selector you use to identify a {@apilink PageElement} or a group of {@apilink PageElements}.
 *
 * @group Models
 */
export abstract class Selector {

    toString(): string {
        const selectorDescription   = this.constructor.name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
        const parametersDescription = Object.keys(this).map(field => f`${this[field]}`).join(', ');

        return `${ selectorDescription } (${ parametersDescription })`;
    }
}
