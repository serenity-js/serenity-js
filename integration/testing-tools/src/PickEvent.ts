import { DomainEvent } from '@serenity-js/core/lib/events';

export class PickEvent {
    static from = (events: DomainEvent[]): PickEvent => new PickEvent(events);

    constructor(private events: DomainEvent[]) {
    }

    /* eslint-disable-next-line @typescript-eslint/ban-types */
    next<T extends DomainEvent>(type: Function & { prototype: T }, assertion: (event: T) => void): PickEvent {

        const foundIndex = this.events.findIndex(event => event instanceof type);

        if (foundIndex < 0) {
            const found = this.events.map(e => e.constructor.name).join(', ') || 'an empty list';

            throw new Error(`${ type.name } event not found within ${ found }`);
        }

        assertion(this.events[ foundIndex ] as T);

        this.events = this.events.slice(foundIndex + 1);

        return this;
    }
}
