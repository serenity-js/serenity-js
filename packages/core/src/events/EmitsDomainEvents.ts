import type { ActivityDetails, CorrelationId } from '../model';
import type { TellsTime } from '../screenplay';
import type { DomainEvent } from './DomainEvent';

export interface EmitsDomainEvents extends TellsTime {
    currentSceneId(): CorrelationId;
    assignNewActivityId(details: ActivityDetails): CorrelationId;
    announce(event: DomainEvent): void;
    waitForNextCue(): Promise<void>,
}
