import * as moment from 'moment';
import { ensure, isDefined, isInstanceOf, Predicate, TinyType } from 'tiny-types';

import { Duration } from './Duration';

export class Timestamp extends TinyType {
    static fromJSON(v: string): Timestamp {
        return new Timestamp(new Date(ensure(Timestamp.name, v, isSerialisedISO8601Date())));
    }

    static fromMillisecondTimestamp(v: number): Timestamp {
        return new Timestamp(moment(v).toDate());
    }

    constructor(public readonly value: Date = new Date()) {
        super();
        ensure(Timestamp.name, value, isDefined(), isInstanceOf(Date));
    }

    diff(another: Timestamp): Duration {
        return new Duration(Math.abs(moment(this.value).diff(another.value, 'ms', true)));
    }

    plus(duration: Duration): Timestamp {
        return new Timestamp(moment(this.value).add(duration.inMilliseconds(), 'ms').toDate());
    }

    less(duration: Duration): Timestamp {
        return new Timestamp(moment(this.value).subtract(duration.inMilliseconds(), 'ms').toDate());
    }

    toMillisecondTimestamp(): number {
        return moment(this.value).valueOf();
    }

    toJSON(): string {
        return this.value.toJSON();
    }

    toString(): string {
        return this.value.toString();
    }
}

function isSerialisedISO8601Date(): Predicate<string> {
    return Predicate.to(`be an ISO-8601-compliant date`, (value: string) =>
        moment(value, moment.ISO_8601, true).isValid());
}
