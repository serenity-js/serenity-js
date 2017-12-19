import {Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {CallAnApi} from '../abilities';

export class Post implements Interaction {

    static item = (item: any) => ({ on: (resource: string) => new Post(item, resource) })

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).post(this.resource, this.item);
    }

    constructor(private item: any, private resource: string) {
    }

    toString = () => `{0} execute a POST on resource ${this.resource} with item: ${this.item}`;
}
