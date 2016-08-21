import {DomainEvent} from '../domain/events';
import { Stage } from './stage';
import * as _ from 'lodash';

export interface StageCrewMember {
    assignTo(stage: Stage);

    notifyOf(event: DomainEvent<any>): void;
}

export class StageManager {

    private listeners: CrewMembersCommunicationChannel[] = [];
    private wip: Promise<any>[] = [];

    constructor(private journal: Journal) {
    }

    notifyOf(event: DomainEvent<any>) {
        this.journal.record(event);

        if (this.listeners[event.constructor.name]) {
            this.listeners[event.constructor.name].notify(event);
        }

        // for the "catch-all" crew members
        if (this.listeners[DomainEvent.name]) {
            this.listeners[DomainEvent.name].notify(event);
        }
    }

    informOfWorkInProgress<T>(promise: Promise<T>): void {
        this.wip.push(promise);
    }

    allDone(): Promise<any[]> {
        return Promise.all(this.wip);
    }

    registerInterestIn(eventsOfInterest: { new (value: any): DomainEvent<any>}[], crewMember: StageCrewMember) {

        eventsOfInterest.forEach(eventType => {

            if (! this.listeners[eventType.name]) {
                this.listeners[eventType.name] = new CrewMembersCommunicationChannel();
            }

            this.listeners[eventType.name].register(crewMember);
        });
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

class CrewMembersCommunicationChannel {
    private listeners: StageCrewMember[] = [];

    register(listener: StageCrewMember) {
        this.listeners.push(listener);
    }

    notify(event: DomainEvent<any>) {
        this.listeners.forEach( (listener) => listener.notifyOf(_.cloneDeep(event)) );
    }
}
