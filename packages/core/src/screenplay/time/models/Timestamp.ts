import { ensure, isDefined, isInstanceOf, Predicate, TinyType } from 'tiny-types';
import { inspect } from 'util';

import { Duration } from './Duration';

/**
 * Represents a point in time.
 *
 * `Timestamp` makes it easier for you to work with information related to time, like {@apilink DomainEvent|domain events}.
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

    static fromTimestampInSeconds(value: number): Timestamp {
        return Timestamp.fromTimestampInMilliseconds(value * 1000);
    }

    static fromTimestampInMilliseconds(value: number): Timestamp {
        return new Timestamp(new Date(value));
    }

    static now(): Timestamp {
        return new Timestamp();
    }

    constructor(public readonly value: Date = new Date()) {
        super();
        ensure(Timestamp.name, value, isDefined(), isInstanceOf(Date));
    }

    diff(another: Timestamp): Duration {
        ensure('timestamp', another, isDefined());
        return new Duration(Math.abs(this.toMilliseconds() - another.toMilliseconds()));
    }

    plus(duration: Duration): Timestamp {
        ensure('duration', duration, isDefined());
        return new Timestamp(new Date(this.toMilliseconds() + duration.inMilliseconds()));
    }

    less(duration: Duration): Timestamp {
        ensure('duration', duration, isDefined());
        return new Timestamp(new Date(this.toMilliseconds() - duration.inMilliseconds()));
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
        return this.value.getTime();
    }

    toSeconds(): number {
        return Math.floor(this.toMilliseconds() / 1_000);
    }

    toJSON(): string {
        return this.value.toJSON();
    }

    toISOString(): string {
        return this.value.toISOString();
    }

    toString(): string {
        return this.toISOString();
    }

    [inspect.custom](): string {
        return `Timestamp(${ this.value.toISOString() })`;
    }
}

function isSerialisedISO8601Date(): Predicate<string> {
    return Predicate.to(`be an ISO8601-compatible string that follows the YYYY-MM-DDTHH:mm:ss.sssZ format`, (value: string) => {
        const basicIsoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

        if (! basicIsoRegex.test(value)) {
            return false;
        }

        const date = new Date(value);

        return date instanceof Date
            && ! Number.isNaN(date.getTime());
    });
}
