import { format } from '@serenity-js/core';

const f = format({ markQuestions: true });

export abstract class Selector {

    toString(): string {
        // todo: strip anything preceding "By", like "WebdriverIOByCss|
        const selectorDescription   = this.constructor.name.replace(/([a-z]+)([A-Z])/g, '$1 $2').toLowerCase();
        const parametersDescription = Object.keys(this).map(field => f`${this[field]}`).join(', ');

        return `${ selectorDescription } (${ parametersDescription })`;
    }
}
