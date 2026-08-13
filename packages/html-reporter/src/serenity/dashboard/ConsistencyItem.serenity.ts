import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { InteractionObject } from '../common/InteractionObject.serenity.js';

export class ConsistencyItem<NET> extends InteractionObject<NET> {

    viewDetails = (): Task =>
        Task.where('#actor views consistency item details',
            Click.on(this.rootElement),
        );
}
