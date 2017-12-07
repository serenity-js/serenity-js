import {Interaction, UsesAbilities} from '@serenity-js/core/lib/screenplay';
import {CallAnApi} from '../../call_an_api';

export class Get implements Interaction {

    static resource = (resource: string) => new Get(resource);

    performAs(actor: UsesAbilities): PromiseLike<any> {
        return CallAnApi.as(actor).call('GET', this.resource, true);
    }

    constructor(private resource: string) { }

    toString = () => `{0} execute a GET on resource ${this.resource}`;
}
