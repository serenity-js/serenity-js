import { format } from '@serenity-js/core';

const f = format({ markQuestions: true });

export abstract class Selector<T> {

    constructor(public readonly value: T) {
    }

    toString(): string {
        const selectorDescription   = this.constructor.name.replace(/([a-z]+)([A-Z])/g, '$1 $2').toLowerCase();
        const parametersDescription = Object.keys(this).map(field => f`${this[field]}`).join(', ');

        return `${ selectorDescription } (${ parametersDescription })`;
    }
}
