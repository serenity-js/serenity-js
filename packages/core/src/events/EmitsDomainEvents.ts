import type { ActivityDetails, CorrelationId } from '../model/index.js';
import type { TellsTime } from '../screenplay/index.js';
import type { DomainEvent } from './DomainEvent.js';

export interface EmitsDomainEvents extends TellsTime {
    currentSceneId(): CorrelationId;
    assignNewActivityId(details: ActivityDetails): CorrelationId;
    announce(event: DomainEvent): void;
    waitForNextCue(): Promise<void>,
}
