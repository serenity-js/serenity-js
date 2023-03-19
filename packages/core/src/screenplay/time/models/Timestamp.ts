import moment from 'moment';
import { ensure, isDefined, isInstanceOf, Predicate, TinyType } from 'tiny-types';

import { Duration } from './Duration';

/**
 * Represents a point in time.
 *
 * `Timestamp` makes it easier for Serenity/JS to work with information related to time, like {@apilink DomainEvent|domain events}.
 *
 * ## Learn more
 * - {@apilink Duration}
 * - [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
 *
 * @group Time
 */
export class Timestamp extends TinyType {
    static fromJSON(v: string): Timestamp {
        return new Timestamp(new Date(ensure(Timestamp.name, v, isSerialisedISO8601Date())));
    }

    static fromTimestampInSeconds(v: number): Timestamp {
        return Timestamp.fromTimestampInMilliseconds(v * 1000);
    }

    static fromTimestampInMilliseconds(v: number): Timestamp {
        return new Timestamp(moment(v).toDate());
    }

    constructor(public readonly value: Date = new Date()) {
        super();
        ensure(Timestamp.name, value, isDefined(), isInstanceOf(Date));
    }

    diff(another: Timestamp): Duration {
        ensure('timestamp', another, isDefined());
        return new Duration(Math.abs(moment(this.value).diff(another.value, 'ms', true)));
    }

    plus(duration: Duration): Timestamp {
        ensure('duration', duration, isDefined());
        return new Timestamp(moment(this.value).add(duration.inMilliseconds(), 'ms').toDate());
    }

    less(duration: Duration): Timestamp {
        ensure('duration', duration, isDefined());
        return new Timestamp(moment(this.value).subtract(duration.inMilliseconds(), 'ms').toDate());
    }

    isBefore(another: Timestamp): boolean {
        ensure('timestamp', another, isDefined());
        return this.value.getTime() < another.value.getTime();
    }

    isBeforeOrEqual(another: Timestamp): boolean {
        ensure('timestamp', another, isDefined());
        return this.value.getTime() <= another.value.getTime();
    }

    isAfter(another: Timestamp): boolean {
        ensure('timestamp', another, isDefined());
        return this.value.getTime() > another.value.getTime();
    }

    isAfterOrEqual(another: Timestamp): boolean {
        ensure('timestamp', another, isDefined());
        return this.value.getTime() >= another.value.getTime();
    }

    toMilliseconds(): number {
        return moment(this.value).valueOf();
    }

    toSeconds(): number {
        return moment(this.value).unix();
    }

    toJSON(): string {
        return this.value.toJSON();
    }

    toString(): string {
        return this.value.toISOString();
    }
}

function isSerialisedISO8601Date(): Predicate<string> {
    return Predicate.to(`be an ISO-8601-compliant date`, (value: string) =>
        moment(value, moment.ISO_8601, true).isValid());
}
