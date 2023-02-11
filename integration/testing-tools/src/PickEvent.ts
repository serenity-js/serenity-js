import { DomainEvent } from '@serenity-js/core/lib/events';

export class PickEvent {
    static from(events: DomainEvent[]): PickEvent {
        return new PickEvent(events);
    }

    constructor(private events: DomainEvent[]) {
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    next<T extends DomainEvent>(type: Function & { prototype: T }, assertion: (event: T) => void): PickEvent {

        const foundIndex = this.events.findIndex(event => event instanceof type);

        return this.check(type, foundIndex, assertion);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    last<T extends DomainEvent>(type: Function & { prototype: T }, assertion: (event: T) => void): PickEvent {

        const reversedEvents = this.events.slice().reverse();
        const foundIndex = this.events.length - 1 - reversedEvents.findIndex(event => event instanceof type);

        return this.check(type, foundIndex, assertion);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private check<T extends DomainEvent>(type: Function & { prototype: T }, index: number, assertion: (event: T) => void) {
        if (index < 0) {
            const found = this.events.map(e => e.constructor.name).join(', ') || 'an empty list';

            throw new Error(`${ type.name } event not found within ${ found }`);
        }

        try {
            assertion(this.events[ index ] as T);
        }
        catch (error) {

            const longestEventName: number = this.events.reduce((longestSoFar, event) => {
                const nameLength = event.constructor.name.length;
                return nameLength > longestSoFar ? nameLength : longestSoFar;
            }, 0);

            console.error(
                this.events.map(event => `[${event.constructor.name.padEnd(longestEventName, ' ')}] ${ JSON.stringify(event.toJSON()) }`).join('\n')
            );

            throw error;
        }

        this.events = this.events.slice(index + 1);

        return this;
    }
}
