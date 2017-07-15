import * as moment from 'moment';
import { Outcome, PhotoReceipt, RecordedActivity, RecordedScene, Tag } from './model';

export class DomainEvent<T> {
    private type: string;

    constructor(public value: T, public timestamp?: number) {
        this.timestamp = timestamp || moment().valueOf();
        this.type = this.constructor.name;
    }

    toString() {
        return `${this.timestamp} | ${this.constructor.name}: ${this.value.toString()}`;
    }
}

export class SceneStarts        extends DomainEvent<RecordedScene> {}
export class ActivityStarts     extends DomainEvent<RecordedActivity> {}
export class ActivityFinished   extends DomainEvent<Outcome<RecordedActivity>> {}
export class SceneTagged        extends DomainEvent<PromiseLike<Tag>> {}
export class SceneFinished      extends DomainEvent<Outcome<RecordedScene>> {}
export class PhotoAttempted     extends DomainEvent<PhotoReceipt> {}
