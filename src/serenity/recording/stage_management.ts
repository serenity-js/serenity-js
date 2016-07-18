import {DomainEvent} from '../domain/events';
import * as _ from 'lodash';

export class StageManager {

    private listeners: DomainEventListeners[] = [];

    constructor(private journal: Journal) { }

    record(event: DomainEvent<any>) {
        this.journal.record(event);

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

    readTheJournal(): DomainEvent<any>[] {
        return this.journal.read();
    }

    readNewJournalEntriesAs(readerId: string): DomainEvent<any>[] {
        return this.journal.readAs(readerId);
    }
}

export class Journal {
    private events:     DomainEvent<any>[]       = [];
    private bookmarks:  { [id: string]: number } = {};

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

    /**
     * Returns a list of all the events recorded since you last checked
     *
     * @return {Event[]} a list of events
     */
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
