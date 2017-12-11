import {Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {CallAnApi} from '../abilities';

export class Put implements Interaction {

    static itemOnResource = (item: any, resource: string) => new Put(item, resource);

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).put(this.resource, this.item);
    }

    constructor(private item: any, private resource: string) {
    }

    toString = () => `{0} execute a PUT on resource ${this.resource} with item: ${this.item}`;
}
