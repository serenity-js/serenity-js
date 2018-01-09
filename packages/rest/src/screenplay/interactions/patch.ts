import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { CallAnApi } from '../abilities';

export class Patch implements Interaction {

    static resource = (resource: string) => ({ with: (item: any) => new Patch(item, resource) });

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).patch(this.resource, this.item);
    }

    constructor(private item: any, private resource: string) {
    }

    toString = () => `#actor executes a PATCH on resource ${this.resource} with item: ${this.item}`;
}
