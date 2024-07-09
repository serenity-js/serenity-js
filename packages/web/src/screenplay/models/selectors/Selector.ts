import { f } from '@serenity-js/core';
import { TinyType } from 'tiny-types';

/**
 * Describes a selector you use to identify a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) or a group of [`PageElement`](https://serenity-js.org/api/web/class/PageElements/).
 *
 * @group Models
 */
export abstract class Selector extends TinyType {

    toString(): string {
        const selectorDescription   = this.constructor.name.replaceAll(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
        const parametersDescription = Object.keys(this).map(field => f`${this[field]}`).join(', ');

        return `${ selectorDescription } (${ parametersDescription })`;
    }
}
