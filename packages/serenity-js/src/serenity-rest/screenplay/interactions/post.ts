import {Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {CallAnApi} from '../../call_an_api';

export class Post implements Interaction {

    static item = (item: any, resource: string) => new Post(item, resource);

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).callWithBody('POST', this.resource, this.item, true);
    }

    constructor(private item: any, private resource: string) {
    }

    toString = () => `{0} execute a POST on resource ${this.resource}`;
}
