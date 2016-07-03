import * as _ from 'lodash';
import {DomainEvent} from "../domain/events";

export class Chronicler {

    constructor(private chronicle: Chronicle) { }

    private listeners: DomainEventListeners[] = [];

    record(event: DomainEvent<any>) {
        this.chronicle.record(event);

        if (this.listeners[event.constructor.name]) {
            this.listeners[event.constructor.name].notify(event);
        }
    }

    on<T>(eventType: {new (T): DomainEvent<T>}, listener: (DomainEvent) => void) {

        if (! this.listeners[eventType.name]) {
            this.listeners[eventType.name] = new DomainEventListeners();
        }

        this.listeners[eventType.name].register(listener);
    }

    readTheChronicle(): DomainEvent<any>[] {
        return this.chronicle.read();
    }

    readNewEntriesAs(readerId: string): DomainEvent<any>[] {
        return this.chronicle.readAs(readerId);
    }
}

export class Chronicle {
    private events:    DomainEvent<any>[] = []; // todo: is that right? is that a list or a map??
    private bookmarks: string[]           = []; // { [id: string] : number } = {};

    /**
     * Records an event and stores it in memory
     *
     * @param event
     */
    public record(event: DomainEvent<any>) {
        this.events.push(event);
    }

    /**
     * Returns a list of all the events ever recorded
     *
     * @return {Event[]} a list of events
     */
    public read(): DomainEvent<any>[] {
        return _.sortBy(_.cloneDeep(this.events), (event) => event.timestamp );
    }

    public readAs(readerId: string): DomainEvent<any>[] {
        let events   = this.read(),
            bookmark = this.bookmarks[readerId] || 0;

        this.bookmarks[readerId] = events.length;

        return events.slice(bookmark);
    }
}

class DomainEventListeners {
    private listeners: Array<(DomainEvent) => void> = [];

    register(listener: (DomainEvent) => void) {
        this.listeners.push(listener);
    }

    notify(event: DomainEvent<any>) {
        this.listeners.forEach( (listener) => listener(_.cloneDeep(event)) );
    }
}