import { ensure, isDefined, TinyType } from 'tiny-types';

import { Timestamp } from '../model';

export abstract class DomainEvent extends TinyType {
    protected constructor(public readonly timestamp: Timestamp = new Timestamp()) {
        super();
        ensure('timestamp', timestamp, isDefined());
    }
}
