import { ActivityDetails, CorrelationId } from '../model';
import { Timestamp } from '../screenplay';
import { DomainEvent } from './DomainEvent';

export interface EmitsDomainEvents {
    currentSceneId(): CorrelationId;
    assignNewActivityId(details: ActivityDetails): CorrelationId;
    announce(event: DomainEvent): void;
    currentTime(): Timestamp;
    waitForNextCue(): Promise<void>,
}
