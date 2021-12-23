import { format } from '@serenity-js/core';

const f = format({ markQuestions: true });

export abstract class Selector<Parameters extends unknown[]> {

    public readonly parameters: Parameters;
    public readonly subject: string;

    constructor(...parameters: Parameters) {
        const selectorDescription   = this.constructor.name.replace(/([a-z]+)([A-Z])/g, '$1 $2').toLowerCase();
        const parametersDescription = parameters.map(selector => f`${selector}`).join(', ');

        this.subject = `${ selectorDescription } (${ parametersDescription })`;

        this.parameters = parameters;
    }

    toString(): string {
        return this.subject;
    }
}
