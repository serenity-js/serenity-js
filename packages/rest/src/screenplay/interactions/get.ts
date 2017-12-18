import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import {CallAnApi} from '../abilities';

export class Get implements Interaction {

    static resource = (resource: string) => new Get(resource);

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).get(this.resource);
    }

    constructor(private resource: string) { }

    toString = () => `{0} execute a GET on resource ${this.resource}`;
}
