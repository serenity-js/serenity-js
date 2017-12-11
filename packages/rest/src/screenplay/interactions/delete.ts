import {Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {CallAnApi} from '../abilities';

export class Delete implements Interaction {

    static resource = (resource: string) => new Delete(resource);

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).delete(this.resource);
    }

    constructor(private resource: string) {
    }

    toString = () => `{0} execute a DELETE on resource ${this.resource}`;
}
