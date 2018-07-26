import { Timestamp } from '../model';
import { StageCrewMember } from '../stage';
import { DomainEvent } from './DomainEvent';

export class AsyncOperationCompleted extends DomainEvent {
    constructor(
        public readonly crewMember: { new(...args: any[]): StageCrewMember },
        public readonly taskDescription: string,
        public readonly value: Promise<void>,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
    }
}
