import { ensure, isDefined, Serialised } from 'tiny-types';

import { Description, Name } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneBackgroundDetected extends DomainEvent {
    public static fromJSON(o: Serialised<SceneBackgroundDetected>) {
        return new SceneBackgroundDetected(
            Name.fromJSON(o.name as string),
            Description.fromJSON(o.description as string),
        );
    }

    constructor(
        public readonly name: Name,
        public readonly description: Description,
    ) {
        super();
        ensure('name', name, isDefined());
        ensure('description', description, isDefined());
    }
}
