import { ensure, isDefined, Serialised } from 'tiny-types';

import { Description } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneTemplateDetected extends DomainEvent {
    public static fromJSON(o: Serialised<SceneTemplateDetected>) {
        return new SceneTemplateDetected(
            Description.fromJSON(o.template as string),
        );
    }

    constructor(
        public readonly template: Description,
    ) {
        super();
        ensure('template', template, isDefined());
    }
}
